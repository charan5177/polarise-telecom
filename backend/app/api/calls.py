import uuid
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.config import settings
from app.api.auth import get_current_user, require_admin
from app.models.models import Call, CallEvent, CallRecording, Lead, User, EmployeeProfile, FollowUp, AuditLog
from app.schemas.schemas import CallOut, InitiateCallRequest, CallStatusUpdateRequest, InboundSimulateRequest
from app.services.telephony_service import get_telephony_provider, generate_demo_wav_audio

router = APIRouter(prefix="/calls", tags=["Calls & Telephony Operations"])

@router.get("", response_model=List[CallOut])
def get_calls(
    lead_id: Optional[int] = None,
    user_id: Optional[int] = None,
    direction: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Call)

    if current_user.role == "telecaller":
        query = query.filter(Call.user_id == current_user.id)
    elif user_id:
        query = query.filter(Call.user_id == user_id)

    if lead_id:
        query = query.filter(Call.lead_id == lead_id)
    if direction:
        query = query.filter(Call.direction == direction)
    if status:
        query = query.filter(Call.status == status)

    calls = query.order_by(Call.start_time.desc()).limit(limit).all()

    result = []
    for c in calls:
        cout = CallOut.from_orm(c)
        if c.user:
            cout.employee_name = c.user.name
            cout.employee_id_code = c.user.employee_id
        if c.lead:
            cout.lead_code = c.lead.lead_code
            if not cout.customer_name:
                cout.customer_name = c.lead.student_name
        # Strictly hide recordings from telecallers (only admins can access recordings)
        if current_user.role == "telecaller":
            cout.recording = None
        result.append(cout)
    return result

@router.get("/{call_id}", response_model=CallOut)
def get_call_detail(call_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    c = db.query(Call).filter(Call.id == call_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Call record not found")
    
    if current_user.role == "telecaller" and c.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to another employee's call record.")

    cout = CallOut.from_orm(c)
    if c.user:
        cout.employee_name = c.user.name
        cout.employee_id_code = c.user.employee_id
    if c.lead:
        cout.lead_code = c.lead.lead_code
        if not cout.customer_name:
            cout.customer_name = c.lead.student_name
    if current_user.role == "telecaller":
        cout.recording = None
    return cout

@router.post("/initiate", response_model=CallOut)
async def initiate_call(
    req: InitiateCallRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    
    # 1. Lead verification
    lead = None
    if req.lead_id:
        lead = db.query(Lead).filter(Lead.id == req.lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Selected lead does not exist")
        if current_user.role == "telecaller" and lead.assigned_user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You are not authorized to contact this unassigned lead.")

    target_phone = req.customer_number.strip()
    target_name = req.customer_name or (lead.student_name if lead else "Parent / Student")

    # 2. Select Provider (Exotel or Demo Telephony Provider)
    is_demo_call = settings.DEMO_MODE if req.is_demo is None else req.is_demo
    provider = get_telephony_provider()
    
    agent_phone = current_user.phone_number or "+919876543210"
    caller_id = settings.EXOTEL_VIRTUAL_NUMBER

    try:
        prov_res = await provider.initiate_call(
            from_agent_phone=agent_phone,
            to_customer_phone=target_phone,
            caller_id=caller_id,
            custom_field=f"user_{current_user.id}_lead_{lead.id if lead else 0}"
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Telephony Provider Error: {str(e)}")

    call_sid = prov_res["call_sid"]

    # 3. Create Call Attempt record in database
    call = Call(
        call_sid=call_sid,
        user_id=current_user.id,
        lead_id=lead.id if lead else None,
        customer_number=target_phone,
        customer_name=target_name,
        direction="outbound",
        caller_id=caller_id,
        status="ringing", # Outbound call immediately transitions to ringing the customer
        start_time=now,
        is_demo=is_demo_call,
        cost=1.20 if not is_demo_call else 0.0
    )
    db.add(call)
    db.commit()
    db.refresh(call)

    # 4. Record Call Event
    event = CallEvent(
        call_id=call.id,
        event_type="initiated",
        timestamp=now,
        raw_payload=str(prov_res)
    )
    db.add(event)

    # 5. Update telecaller status to On Call
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == current_user.id).first()
    if profile:
        profile.current_status = "on_call"
        profile.status_message = f"Calling {target_name} ({target_phone})"
        profile.last_status_change = now

    # 6. Update lead total calls count
    if lead:
        lead.total_calls_count += 1
        lead.last_contact_date = now
        if lead.status == "New" or lead.status == "Assigned":
            lead.status = "Contacted"

    db.commit()
    db.refresh(call)

    cout = CallOut.from_orm(call)
    cout.employee_name = current_user.name
    cout.employee_id_code = current_user.employee_id
    if lead:
        cout.lead_code = lead.lead_code
    return cout

@router.patch("/{call_id}/status", response_model=CallOut)
def update_call_status(
    call_id: int,
    req: CallStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call record not found")
    
    if current_user.role == "telecaller" and call.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    now = datetime.now(timezone.utc)
    prev_status = call.status
    call.status = req.status

    # Record event
    event = CallEvent(
        call_id=call.id,
        event_type=req.status,
        timestamp=now,
        raw_payload=f"Status changed from {prev_status} to {req.status}"
    )
    db.add(event)

    # State transitions & duration logic
    # Start time is when call attempt initiated
    start_dt = call.start_time
    if start_dt and start_dt.tzinfo is None:
        start_dt = start_dt.replace(tzinfo=timezone.utc)

    if req.status == "in-progress" and not call.answer_time:
        call.answer_time = now

    if req.status in ("completed", "busy", "no-answer", "failed", "canceled"):
        call.end_time = now
        call.elapsed_duration = max(0, int((now - start_dt).total_seconds()))
        
        # Connected duration MUST ONLY count from answer_time to end_time
        if call.answer_time:
            ans_dt = call.answer_time
            if ans_dt.tzinfo is None:
                ans_dt = ans_dt.replace(tzinfo=timezone.utc)
            call.connected_duration = max(0, int((now - ans_dt).total_seconds()))
        else:
            call.connected_duration = 0

        # Create or link recording if connected
        if call.connected_duration > 0 and not call.recording:
            rec_sid = f"REC-{uuid.uuid4().hex[:12].upper()}"
            recording = CallRecording(
                call_id=call.id,
                recording_sid=rec_sid,
                recording_url=f"/api/telephony/recordings/{call.id}/stream",
                duration_seconds=call.connected_duration,
                status="Available",
                is_simulated=call.is_demo
            )
            db.add(recording)

            # Assign speech file to call
            try:
                import shutil
                import os
                rec_dir = os.path.abspath(settings.RECORDINGS_DIR)
                target_file = os.path.join(rec_dir, f"call_{call.id}.wav")
                source_file = os.path.join(rec_dir, f"sample_call_{1 if call.id % 2 != 0 else 2}.wav")
                if os.path.exists(source_file) and not os.path.exists(target_file):
                    shutil.copyfile(source_file, target_file)
            except Exception as e:
                pass

        # Revert employee status to available
        profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == call.user_id).first()
        if profile and profile.current_status == "on_call":
            profile.current_status = "available"
            profile.status_message = "Online"
            profile.last_status_change = now

    if req.call_outcome:
        call.call_outcome = req.call_outcome
        if call.lead:
            # Map outcome to lead status
            if "Converted" in req.call_outcome:
                call.lead.status = "Converted"
            elif "Follow-up" in req.call_outcome:
                call.lead.status = "Follow-up Required"
            elif "Not Interested" in req.call_outcome:
                call.lead.status = "Not Interested"
            elif "Invalid" in req.call_outcome:
                call.lead.status = "Invalid Number"
            elif "Interested" in req.call_outcome:
                call.lead.status = "Interested"

    if req.notes:
        call.notes = req.notes
        if call.lead:
            call.lead.notes = f"{datetime.now().strftime('%d/%m/%Y %H:%M')}: {req.notes}\n" + (call.lead.notes or "")

    if req.follow_up_date:
        call.follow_up_date = req.follow_up_date
        if call.lead:
            call.lead.next_follow_up = req.follow_up_date
            # Create FollowUp record
            fu = FollowUp(
                lead_id=call.lead_id,
                user_id=call.user_id,
                scheduled_time=req.follow_up_date,
                status="pending",
                notes=req.notes or f"Follow-up scheduled from call {call.call_sid}"
            )
            db.add(fu)

    db.commit()
    db.refresh(call)

    cout = CallOut.from_orm(call)
    if call.user:
        cout.employee_name = call.user.name
        cout.employee_id_code = call.user.employee_id
    if call.lead:
        cout.lead_code = call.lead.lead_code
        cout.customer_name = call.lead.student_name
    return cout

@router.post("/demo-simulate-inbound", response_model=CallOut)
def simulate_demo_inbound_call(
    req: Optional[InboundSimulateRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Demo Call Simulator for incoming parent calls.
    Allows presentation attendees to experience an inbound call flow.
    """
    now = datetime.now(timezone.utc)
    phone = (req.customer_phone if req and req.customer_phone else None) or "+919845012345"
    
    # Try to match existing lead
    matched_lead = None
    if req and req.lead_id:
        matched_lead = db.query(Lead).filter(Lead.id == req.lead_id).first()
    if not matched_lead:
        matched_lead = db.query(Lead).filter(or_(Lead.phone == phone, Lead.alt_phone == phone)).first()
        
    cust_name = (req.customer_name if req and req.customer_name else None) or (
        matched_lead.student_name if matched_lead else "Admissions Parent Caller"
    )

    forwarding_info = ""
    if current_user.forwarding_enabled:
        forwarding_info = f" [Forwarded to Counselor Mobile: {current_user.phone_number or '+91 98450 12345'}]"

    call_sid = f"SIM-INB-{uuid.uuid4().hex[:10].upper()}"
    call = Call(
        call_sid=call_sid,
        user_id=current_user.id,
        lead_id=matched_lead.id if matched_lead else None,
        customer_number=phone,
        customer_name=cust_name,
        direction="inbound",
        caller_id=settings.EXOTEL_VIRTUAL_NUMBER,
        status="ringing", # Inbound call alerts the telecaller
        start_time=now,
        is_demo=True,
        cost=0.0,
        notes=f"Incoming Parent Counseling Inquiry{forwarding_info}"
    )
    db.add(call)
    db.commit()
    db.refresh(call)

    event = CallEvent(
        call_id=call.id,
        event_type="inbound_ringing",
        timestamp=now,
        raw_payload=f"Inbound parent call triggered{forwarding_info}"
    )
    db.add(event)
    db.commit()
    db.refresh(call)

    cout = CallOut.from_orm(call)
    cout.employee_name = current_user.name
    cout.employee_id_code = current_user.employee_id
    if matched_lead:
        cout.lead_code = matched_lead.lead_code
    return cout
