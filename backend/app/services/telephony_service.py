import uuid
import math
import struct
import io
import wave
import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import Call, CallEvent, CallRecording, Lead, User, AuditLog

class TelephonyProvider:
    """Base interface for cloud telephony providers (Exotel, Tata Tele, etc.)"""
    async def initiate_call(self, from_agent_phone: str, to_customer_phone: str, caller_id: str, custom_field: str) -> Dict[str, Any]:
        raise NotImplementedError

    async def hangup_call(self, call_sid: str) -> bool:
        raise NotImplementedError

    async def get_recording_url(self, recording_sid: str) -> Optional[str]:
        raise NotImplementedError

class ExotelProvider(TelephonyProvider):
    """
    Exotel Cloud Telephony Adapter
    Official documentation: https://developer.exotel.com/docs/voice
    Supports Exotel Call APIs and Webhook callbacks.
    """
    def __init__(self):
        self.account_sid = settings.EXOTEL_ACCOUNT_SID
        self.api_key = settings.EXOTEL_API_KEY
        self.api_token = settings.EXOTEL_API_TOKEN
        self.subdomain = settings.EXOTEL_SUBDOMAIN
        self.virtual_number = settings.EXOTEL_VIRTUAL_NUMBER

    async def initiate_call(self, from_agent_phone: str, to_customer_phone: str, caller_id: str, custom_field: str) -> Dict[str, Any]:
        if not self.account_sid or not self.api_key:
            raise ValueError("Exotel API credentials are not configured. Switch to Demo Mode or configure Exotel credentials in settings.")
        
        endpoint = f"https://{self.subdomain}/v1/Accounts/{self.account_sid}/Calls/connect.json"
        auth = (self.api_key, self.api_token)
        data = {
            "From": from_agent_phone,
            "To": to_customer_phone,
            "CallerId": caller_id or self.virtual_number,
            "CustomField": custom_field,
            "Record": "true",
            "StatusCallback": f"/api/telephony/webhooks/exotel"
        }
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(endpoint, auth=auth, data=data)
            if resp.status_code not in (200, 201):
                raise RuntimeError(f"Exotel API error {resp.status_code}: {resp.text}")
            result = resp.json()
            call_sid = result.get("Call", {}).get("Sid") or result.get("Sid") or str(uuid.uuid4())
            return {
                "call_sid": call_sid,
                "status": "initiated",
                "provider": "Exotel",
                "raw": result
            }

    async def hangup_call(self, call_sid: str) -> bool:
        if not self.account_sid or not self.api_key:
            return False
        endpoint = f"https://{self.subdomain}/v1/Accounts/{self.account_sid}/Calls/{call_sid}.json"
        auth = (self.api_key, self.api_token)
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(endpoint, auth=auth, data={"Status": "completed"})
            return resp.status_code in (200, 204)

class DemoTelephonyProvider(TelephonyProvider):
    """
    Demo Telephony Provider for safe local evaluations and presentations.
    Generates realistic call cycles with synthetic audio waveforms.
    """
    async def initiate_call(self, from_agent_phone: str, to_customer_phone: str, caller_id: str, custom_field: str) -> Dict[str, Any]:
        call_sid = f"SIM-EXO-{uuid.uuid4().hex[:12].upper()}"
        return {
            "call_sid": call_sid,
            "status": "initiated",
            "provider": "Polarise Demo Telephony Simulator",
            "raw": {
                "sid": call_sid,
                "virtual_number": caller_id,
                "simulated": True
            }
        }

    async def hangup_call(self, call_sid: str) -> bool:
        return True

def get_telephony_provider() -> TelephonyProvider:
    if settings.DEMO_MODE:
        return DemoTelephonyProvider()
    return ExotelProvider()

def generate_demo_wav_audio(duration_seconds: int = 15) -> bytes:
    """
    Generates a valid lightweight in-memory 8kHz mono WAV audio file with dual-tone
    telephony cadence and speech simulation harmonics for safe demonstration playback.
    """
    sample_rate = 8000
    total_samples = sample_rate * max(1, duration_seconds)
    buffer = io.BytesIO()
    
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        frames = bytearray()
        for i in range(total_samples):
            t = float(i) / sample_rate
            # 440Hz + 880Hz pleasant counselor/parent voice simulator frequency modulation
            freq1 = 440.0 + 30.0 * math.sin(2.0 * math.pi * 3.0 * t)
            freq2 = 880.0 + 40.0 * math.sin(2.0 * math.pi * 5.0 * t)
            
            # Envelope to simulate intermittent conversational speech
            envelope = 0.5 * (1.0 + math.sin(2.0 * math.pi * 0.8 * t))
            if envelope < 0.2:
                sample_val = 0
            else:
                sample_val = int(12000.0 * envelope * (0.6 * math.sin(2.0 * math.pi * freq1 * t) + 0.4 * math.sin(2.0 * math.pi * freq2 * t)))
            
            sample_val = max(-32767, min(32767, sample_val))
            frames.extend(struct.pack("<h", sample_val))
            
        wav_file.writeframes(frames)
        
    return buffer.getvalue()
