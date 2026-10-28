# Cloud Telephony Integration Checklist — Exotel
**Polarise Telecom Technology**  
*Polaris Educational Consultancy*

This document provides step-by-step instructions for completing carrier integration with Exotel once live credentials and authorized virtual numbers are acquired.

---

## 1. Provider Credentials Checklist

Ensure the following credentials are obtained from the Exotel Dashboard (`https://my.exotel.com/`):

- [ ] **Account SID:** Found under *API Details* (e.g. `polarisconsultancy1`).
- [ ] **API Key:** Primary carrier authorization key.
- [ ] **API Token:** Primary carrier secret token.
- [ ] **Authorized Virtual Caller ID (ExoPhone):** Licensed 10-digit virtual DID number (e.g. `+918047190000`).
- [ ] **Subdomain:** Regional endpoint (default: `api.exotel.com`).

---

## 2. Environment Variables Configuration

Update `backend/.env` with production parameters:

```env
DEMO_MODE=false
EXOTEL_ACCOUNT_SID=your_actual_account_sid
EXOTEL_API_KEY=your_actual_api_key
EXOTEL_API_TOKEN=your_actual_api_token
EXOTEL_SUBDOMAIN=api.exotel.com
EXOTEL_VIRTUAL_NUMBER=+918047190000
EXOTEL_WEBHOOK_SECRET=your_webhook_signature_secret
```

---

## 3. Webhook URL Configuration in Exotel Applet

Exotel notifies Polarise Telecom Technology regarding call state transitions (`ringing`, `in-progress`, `completed`, `busy`, `no-answer`) and call recording readiness.

Configure your Exotel Passthru Applet to dispatch callbacks to:
```
POST https://<your-public-api-domain>/api/telephony/webhooks/exotel
```

### Supported Callback Fields:
- `CallSid`: Unique carrier call identifier.
- `From`: Agent or customer number.
- `To`: Target customer or virtual trunk.
- `Status`: `ringing`, `in-progress`, `completed`, `busy`, `failed`, `no-answer`.
- `RecordingUrl`: Secure provider URL for call recording retrieval.
- `RecordingDuration`: Verified connected talk duration in seconds.

---

## 4. Indian Regulatory & Compliance Notes

1. **Mandatory Two-Party Call Recording Disclosure:**
   In compliance with Indian telecommunications regulations, ensure the carrier applet plays a notice (e.g., *"This call may be recorded for quality and counseling verification purposes."*) before bridging.
2. **Do Not Call (DNC) Scrubbing:**
   Student numbers flagged as `Do Not Contact` in the Lead CRM are prevented from outbound dialing at the application layer.
3. **Storage & Retention Policy:**
   Recordings are retained for 180 days by default and served exclusively via authenticated tokenized streaming routes.
