from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.auth import get_current_user, require_admin
from app.models.models import Call, Lead, User, EmployeeProfile, WorkSession, FollowUp, AuditLog
from app.schemas.schemas import EmployeeDashboardStats, AdminDashboardStats
from app.services.excel_service import (
    generate_calls_excel, generate_calls_csv, generate_work_sessions_excel, generate_leads_excel,
    generate_employee_callsheet_excel
)

router = APIRouter(prefix="/reports", tags=["Reports, Analytics & Excel Exports"])

@router.get("/dashboard/employee", response_model=EmployeeDashboardStats)
def get_employee_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)

    # Today's calls by current user
    calls_today = db.query(Call).filter(
        Call.user_id == current_user.id,
        Call.start_time >= today_start
    ).all()

    total_calls = len(calls_today)
    answered_calls = sum(1 for c in calls_today if c.connected_duration and c.connected_duration > 0)
    busy_calls = sum(1 for c in calls_today if c.status == "busy")
    failed_calls = sum(1 for c in calls_today if c.status in ("failed", "canceled"))
    unanswered_calls = sum(1 for c in calls_today if c.status in ("no-answer", "ringing") and (not c.connected_duration or c.connected_duration == 0))

    connected_seconds = sum(c.connected_duration for c in calls_today if c.connected_duration)
    avg_connected = int(connected_seconds / answered_calls) if answered_calls > 0 else 0

    last_call = db.query(Call).filter(Call.user_id == current_user.id).order_by(Call.start_time.desc()).first()

    # Active work session duration
    active_session = db.query(WorkSession).filter(
        WorkSession.user_id == current_user.id,
        WorkSession.is_active == True
    ).first()
    
    working_seconds = 0
    login_time = None
    if active_session:
        login_time = active_session.login_time
        if login_time:
            lt = login_time.replace(tzinfo=timezone.utc) if login_time.tzinfo is None else login_time
            working_seconds = max(0, int((now - lt).total_seconds()))

    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == current_user.id).first()
    current_status = profile.current_status if profile else "offline"

    pending_followups = db.query(FollowUp).filter(
        FollowUp.user_id == current_user.id,
        FollowUp.status == "pending"
    ).count()

    assigned_leads = db.query(Lead).filter(Lead.assigned_user_id == current_user.id).count()

    return {
        "employee_name": current_user.name,
        "employee_id": current_user.employee_id,
        "role": current_user.role,
        "current_status": current_status,
        "session_login_time": login_time,
        "total_working_seconds": working_seconds,
        "today_total_calls": total_calls,
        "today_answered_calls": answered_calls,
        "today_unanswered_calls": unanswered_calls,
        "today_busy_calls": busy_calls,
        "today_failed_calls": failed_calls,
        "today_connected_talk_seconds": connected_seconds,
        "average_connected_seconds": avg_connected,
        "last_call_time": last_call.start_time if last_call else None,
        "pending_followups_count": pending_followups,
        "assigned_leads_count": assigned_leads
    }

@router.get("/dashboard/admin", response_model=AdminDashboardStats)
def get_admin_dashboard(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)

    # Employee counts
    total_employees = db.query(User).filter(User.role == "telecaller").count()
    total_admins = db.query(User).filter(User.role.in_(["super_admin", "operations_admin", "reporting_admin"])).count()

    # Profiles status counts for telecallers
    telecallers = db.query(User).filter(User.role == "telecaller").all()
    emp_ids = [u.id for u in telecallers]
    profiles = db.query(EmployeeProfile).filter(EmployeeProfile.user_id.in_(emp_ids)).all()
    
    status_map = {p.user_id: p.current_status for p in profiles}
    
    online_count = sum(1 for sid, st in status_map.items() if st in ("online", "available", "on_call", "on_break"))
    avail_count = sum(1 for sid, st in status_map.items() if st == "available")
    oncall_count = sum(1 for sid, st in status_map.items() if st == "on_call")
    break_count = sum(1 for sid, st in status_map.items() if st == "on_break")
    offline_count = sum(1 for sid, st in status_map.items() if st == "offline")
    not_logged_in = total_employees - online_count

    active_calls = db.query(Call).filter(Call.status.in_(["ringing", "in-progress"])).count()

    # Today's call statistics
    today_calls = db.query(Call).filter(Call.start_time >= today_start).all()
    today_total = len(today_calls)
    today_inbound = sum(1 for c in today_calls if c.direction == "inbound")
    today_outbound = sum(1 for c in today_calls if c.direction == "outbound")
    today_answered = sum(1 for c in today_calls if c.connected_duration and c.connected_duration > 0)
    today_missed = sum(1 for c in today_calls if c.status in ("no-answer", "ringing", "failed") and not c.connected_duration)

    connected_seconds = sum(c.connected_duration for c in today_calls if c.connected_duration)
    avg_call_duration = int(connected_seconds / today_answered) if today_answered > 0 else 0

    # Leads statistics
    leads_new = db.query(Lead).filter(Lead.status == "New").count()
    leads_assigned = db.query(Lead).filter(Lead.status == "Assigned").count()
    leads_contacted = db.query(Lead).filter(Lead.status == "Contacted").count()
    leads_converted = db.query(Lead).filter(Lead.status == "Converted").count()
    leads_pending = db.query(Lead).filter(Lead.status.in_(["New", "Assigned", "Follow-up Required"])).count()

    followups_due = db.query(FollowUp).filter(
        FollowUp.status == "pending",
        FollowUp.scheduled_time <= (now + timedelta(days=1))
    ).count()
    followups_overdue = db.query(FollowUp).filter(
        FollowUp.status == "pending",
        FollowUp.scheduled_time < now
    ).count()

    return {
        "total_employees": total_employees,
        "total_admins": total_admins,
        "employees_online": online_count,
        "employees_available": avail_count,
        "employees_on_call": oncall_count,
        "employees_on_break": break_count,
        "employees_offline": offline_count,
        "employees_not_logged_in": max(0, not_logged_in),
        "active_calls_count": active_calls,
        "today_total_calls": today_total,
        "today_incoming_calls": today_inbound,
        "today_outgoing_calls": today_outbound,
        "today_answered_calls": today_answered,
        "today_missed_calls": today_missed,
        "today_connected_talk_seconds": connected_seconds,
        "average_call_duration_seconds": avg_call_duration,
        "leads_new": leads_new,
        "leads_assigned": leads_assigned,
        "leads_contacted": leads_contacted,
        "leads_converted": leads_converted,
        "leads_pending": leads_pending,
        "followups_due": followups_due,
        "followups_overdue": followups_overdue
    }

@router.get("/export/calls/excel")
def export_calls_excel(
    user_id: Optional[int] = None,
    direction: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(Call)
    if user_id:
        query = query.filter(Call.user_id == user_id)
    if direction:
        query = query.filter(Call.direction == direction)
    if status:
        query = query.filter(Call.status == status)

    calls = query.order_by(Call.start_time.desc()).all()
    excel_bytes = generate_calls_excel(calls, report_title="Comprehensive Telecalling Register")

    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.name,
        action="EXPORT_CALLS_EXCEL",
        entity_type="Call",
        details=f"Exported {len(calls)} calls to Excel (.xlsx)"
    )
    db.add(audit)
    db.commit()

    filename = f"Polarise_Telecom_Calls_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/calls/csv")
def export_calls_csv(
    user_id: Optional[int] = None,
    direction: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(Call)
    if user_id:
        query = query.filter(Call.user_id == user_id)
    if direction:
        query = query.filter(Call.direction == direction)
    if status:
        query = query.filter(Call.status == status)

    calls = query.order_by(Call.start_time.desc()).all()
    csv_text = generate_calls_csv(calls)

    filename = f"Polarise_Telecom_Calls_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/sessions/excel")
def export_sessions_excel(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    sessions = db.query(WorkSession).order_by(WorkSession.login_time.desc()).all()
    excel_bytes = generate_work_sessions_excel(sessions)

    filename = f"Polarise_Attendance_Sessions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/leads/excel")
def export_leads_excel(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    leads = db.query(Lead).order_by(Lead.created_at.desc()).all()
    excel_bytes = generate_leads_excel(leads)

    filename = f"Polarise_Leads_Register_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/employee-callsheet/excel")
def export_employee_callsheet_excel(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Lead)
    target_name = "All Assigned Leads"
    
    if current_user.role == "telecaller":
        query = query.filter(Lead.assigned_user_id == current_user.id)
        target_name = current_user.name
    elif user_id:
        query = query.filter(Lead.assigned_user_id == user_id)
        u = db.query(User).filter(User.id == user_id).first()
        if u:
            target_name = u.name

    leads = query.order_by(Lead.priority.desc(), Lead.student_name.asc()).all()
    excel_bytes = generate_employee_callsheet_excel(leads, employee_name=target_name)

    filename = f"Polaris_CallSheet_{target_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.xlsx"
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
