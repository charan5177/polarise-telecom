from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user, require_admin
from app.models.models import WorkSession, EmployeeProfile, User, AuditLog
from app.schemas.schemas import WorkSessionOut

router = APIRouter(prefix="/sessions", tags=["Attendance & Work Sessions"])

@router.get("/my", response_model=List[WorkSessionOut])
def get_my_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = db.query(WorkSession).filter(WorkSession.user_id == current_user.id).order_by(WorkSession.login_time.desc()).limit(30).all()
    return sessions

@router.get("/all", response_model=List[WorkSessionOut])
def get_all_sessions(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    sessions = db.query(WorkSession).order_by(WorkSession.login_time.desc()).limit(100).all()
    return sessions

@router.post("/break/toggle")
def toggle_break(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Employee profile not found")

    now = datetime.now(timezone.utc)
    if profile.current_status == "on_break":
        profile.current_status = "available"
        profile.status_message = "Online"
    else:
        profile.current_status = "on_break"
        profile.status_message = "On Break"
    
    profile.last_status_change = now
    profile.last_active_at = now
    db.commit()
    return {"current_status": profile.current_status, "status_message": profile.status_message}
