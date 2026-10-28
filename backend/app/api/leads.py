import io
import csv
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.api.auth import get_current_user, require_admin
from app.models.models import Lead, LeadAssignment, User, AuditLog
from app.schemas.schemas import LeadOut, LeadCreate, LeadUpdate, LeadAssignmentRequest
from app.services.excel_service import parse_leads_file, generate_sample_lead_template_excel

router = APIRouter(prefix="/leads", tags=["Lead & Parent Management CRM"])

@router.get("", response_model=List[LeadOut])
def get_leads(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_user_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Lead)

    # Telecallers only see their assigned leads
    if current_user.role == "telecaller":
        query = query.filter(Lead.assigned_user_id == current_user.id)
    elif assigned_user_id:
        query = query.filter(Lead.assigned_user_id == assigned_user_id)

    if status and status != "All":
        query = query.filter(Lead.status == status)

    if priority and priority != "All":
        query = query.filter(Lead.priority == priority)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Lead.student_name.ilike(search_filter),
                Lead.parent_name.ilike(search_filter),
                Lead.phone.ilike(search_filter),
                Lead.lead_code.ilike(search_filter),
                Lead.city.ilike(search_filter),
                Lead.course_interest.ilike(search_filter)
            )
        )

    leads = query.order_by(Lead.updated_at.desc()).all()
    
    # Enrich assigned employee name
    result = []
    for l in leads:
        lead_dict = LeadOut.from_orm(l)
        if l.assigned_employee:
            lead_dict.assigned_employee_name = l.assigned_employee.name
        result.append(lead_dict)
    return result

@router.get("/template-excel")
def download_excel_template(current_user: User = Depends(require_admin)):
    """
    Download a professionally styled Excel (.xlsx) template for uploading student & parent leads.
    """
    excel_bytes = generate_sample_lead_template_excel()
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=Polaris_Leads_Intake_Template.xlsx"}
    )

@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(lead_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Telecaller privacy boundary
    if current_user.role == "telecaller" and lead.assigned_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to unassigned lead.")
    
    out = LeadOut.from_orm(lead)
    if lead.assigned_employee:
        out.assigned_employee_name = lead.assigned_employee.name
    return out

@router.post("", response_model=LeadOut)
def create_lead(req: LeadCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check for duplicate phone
    duplicate = db.query(Lead).filter(Lead.phone == req.phone.strip()).first()
    warning = None
    if duplicate:
        warning = f"Warning: Lead with phone number {req.phone} already exists (ID: {duplicate.lead_code}, Student: {duplicate.student_name})"

    # Generate lead code
    lead_code = f"POL-{uuid.uuid4().hex[:6].upper()}"
    lead = Lead(
        lead_code=lead_code,
        student_name=req.student_name.strip(),
        parent_name=req.parent_name.strip() if req.parent_name else None,
        phone=req.phone.strip(),
        alt_phone=req.alt_phone.strip() if req.alt_phone else None,
        email=req.email.strip().lower() if req.email else None,
        city=req.city or "Bengaluru",
        state=req.state or "Karnataka",
        course_interest=req.course_interest or "Admissions Guidance",
        lead_source=req.lead_source or "Direct Web Inquiry",
        status=req.status or "New",
        priority=req.priority or "Medium",
        notes=req.notes,
        assigned_user_id=req.assigned_user_id if current_user.role != "telecaller" else current_user.id,
        next_follow_up=req.next_follow_up
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.name,
        action="CREATE_LEAD",
        entity_type="Lead",
        entity_id=str(lead.id),
        details=f"Created lead {lead.lead_code} for {lead.student_name}." + (f" ({warning})" if warning else "")
    )
    db.add(audit)
    db.commit()

    out = LeadOut.from_orm(lead)
    if lead.assigned_employee:
        out.assigned_employee_name = lead.assigned_employee.name
    return out

@router.post("/bulk-create")
def bulk_create_leads(leads_data: List[dict], db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    created_count = 0
    skipped_count = 0
    now = datetime.now(timezone.utc)
    
    for item in leads_data:
        student_name = item.get("student_name", "").strip()
        phone_raw = item.get("phone", "").strip()
        if not student_name or not phone_raw:
            continue
            
        digits = "".join(filter(str.isdigit, phone_raw))
        if len(digits) > 10 and digits.startswith("91"):
            digits = digits[2:]
        if len(digits) != 10:
            skipped_count += 1
            continue
            
        formatted_phone = f"+91{digits}"
        # Deduplication check
        if db.query(Lead).filter(Lead.phone == formatted_phone).first():
            skipped_count += 1
            continue
            
        lead = Lead(
            lead_code=f"POL-{uuid.uuid4().hex[:6].upper()}",
            student_name=student_name,
            parent_name=item.get("parent_name", "").strip() or None,
            phone=formatted_phone,
            alt_phone=item.get("alt_phone", "").strip() or None,
            email=item.get("email", "").strip() or None,
            city=item.get("city", "Bengaluru").strip(),
            state=item.get("state", "Karnataka").strip(),
            course_interest=item.get("course_interest", "Admissions Counseling").strip(),
            lead_source=item.get("lead_source", "Batch Entry").strip(),
            status="New",
            priority=item.get("priority", "Medium").strip(),
            assigned_user_id=item.get("assigned_user_id") or None
        )
        db.add(lead)
        created_count += 1
        
    db.commit()
    return {"created_count": created_count, "skipped_count": skipped_count}

@router.put("/{lead_id}", response_model=LeadOut)
def update_lead(lead_id: int, req: LeadUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if current_user.role == "telecaller" and lead.assigned_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to modify unassigned lead")

    for field, val in req.dict(exclude_unset=True).items():
        if field == "assigned_user_id" and current_user.role == "telecaller":
            continue # Telecallers cannot self-reassign leads
        setattr(lead, field, val)
    
    lead.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(lead)

    out = LeadOut.from_orm(lead)
    if lead.assigned_employee:
        out.assigned_employee_name = lead.assigned_employee.name
    return out

@router.post("/bulk-assign")
def bulk_assign_leads(req: LeadAssignmentRequest, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    target_ids = req.assigned_to_ids or ([req.assigned_to_id] if req.assigned_to_id else [])
    if not target_ids:
        raise HTTPException(status_code=400, detail="Please select at least one employee to allocate leads.")
        
    target_users = db.query(User).filter(User.id.in_(target_ids)).all()
    if not target_users:
        raise HTTPException(status_code=404, detail="Selected target employees not found")

    leads = db.query(Lead).filter(Lead.id.in_(req.lead_ids)).all()
    assigned_count = 0
    now = datetime.now(timezone.utc)
    num_users = len(target_users)

    for idx, lead in enumerate(leads):
        target_user = target_users[idx % num_users] # Round robin distribution among selected staff
        prev_user_id = lead.assigned_user_id
        lead.assigned_user_id = target_user.id
        if lead.status == "New":
            lead.status = "Assigned"
        lead.updated_at = now

        assignment = LeadAssignment(
            lead_id=lead.id,
            assigned_by_id=current_user.id,
            assigned_to_id=target_user.id,
            previous_assigned_to_id=prev_user_id,
            assigned_at=now,
            notes=req.notes
        )
        db.add(assignment)
        assigned_count += 1

    emp_names = ", ".join([u.name for u in target_users])
    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.name,
        action="BULK_ASSIGN_LEADS",
        entity_type="Lead",
        details=f"Assigned {assigned_count} leads distributed across selected counselor(s): {emp_names}"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Successfully allocated {assigned_count} leads across {len(target_users)} selected counselor(s): {emp_names}", "count": assigned_count}

@router.post("/upload-excel")
async def upload_excel_leads(
    file: UploadFile = File(...),
    allocation_mode: str = Query("auto_10", description="auto_10, selected, or unassigned"),
    target_employee_ids: Optional[str] = Query(None, description="Comma-separated employee IDs if mode is selected"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Upload and parse genuine Excel (.xlsx) or CSV files containing 100-2000 leads.
    Optionally distributes leads across the 10 remote counselors automatically.
    """
    content = await file.read()
    parsed_leads = parse_leads_file(content, file.filename)
    if not parsed_leads:
        raise HTTPException(
            status_code=400, 
            detail="No valid student/parent leads found in file. Ensure columns contain Student Name and 10-digit Phone numbers."
        )

    # Determine distribution targets
    target_users: List[User] = []
    if allocation_mode == "auto_10":
        # All 10 telecallers
        target_users = db.query(User).filter(User.role == "telecaller", User.is_active == True).order_by(User.employee_id.asc()).all()
    elif allocation_mode == "selected" and target_employee_ids:
        try:
            ids = [int(i.strip()) for i in target_employee_ids.split(",") if i.strip()]
            target_users = db.query(User).filter(User.id.in_(ids), User.is_active == True).all()
        except Exception:
            target_users = []

    imported_count = 0
    skipped_duplicates = 0
    distribution_counts = {u.employee_id: 0 for u in target_users}
    now = datetime.now(timezone.utc)
    num_targets = len(target_users)

    for idx, item in enumerate(parsed_leads):
        phone = item["phone"]
        if db.query(Lead).filter(Lead.phone == phone).first():
            skipped_duplicates += 1
            continue

        assigned_user = None
        status = "New"
        if num_targets > 0:
            assigned_user = target_users[idx % num_targets]
            status = "Assigned"
            distribution_counts[assigned_user.employee_id] = distribution_counts.get(assigned_user.employee_id, 0) + 1

        lead = Lead(
            lead_code=f"POL-{uuid.uuid4().hex[:6].upper()}",
            student_name=item["student_name"],
            parent_name=item["parent_name"],
            phone=phone,
            alt_phone=item["alt_phone"],
            email=item["email"],
            city=item["city"],
            state=item["state"],
            course_interest=item["course_interest"],
            lead_source=f"Excel Upload ({file.filename})",
            status=status,
            priority=item["priority"],
            notes=item["notes"],
            assigned_user_id=assigned_user.id if assigned_user else None,
            created_at=now,
            updated_at=now
        )
        db.add(lead)
        db.flush()

        if assigned_user:
            assignment = LeadAssignment(
                lead_id=lead.id,
                assigned_by_id=current_user.id,
                assigned_to_id=assigned_user.id,
                assigned_at=now,
                notes=f"Auto-allocated from batch file {file.filename}"
            )
            db.add(assignment)

        imported_count += 1

    db.commit()

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.name,
        action="EXCEL_LEADS_UPLOAD",
        entity_type="Lead",
        details=f"Uploaded {file.filename}: {imported_count} leads imported, {skipped_duplicates} duplicates skipped. Allocation mode: {allocation_mode} across {len(target_users)} staff."
    )
    db.add(audit)
    db.commit()

    return {
        "imported": imported_count,
        "skipped_duplicates": skipped_duplicates,
        "total_parsed": len(parsed_leads),
        "allocation_mode": allocation_mode,
        "distribution": distribution_counts,
        "message": f"Successfully imported {imported_count} leads from {file.filename}." + (
            f" Distributed evenly across {len(target_users)} counselors." if target_users else " Placed in unassigned queue."
        )
    }

@router.post("/import-csv")
async def import_csv_leads(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_admin)
):
    # Delegate to the enhanced upload handler
    return await upload_excel_leads(file=file, allocation_mode="auto_10", db=db, current_user=current_user)
