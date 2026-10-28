from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash
from app.api.auth import require_admin, require_super_admin
from app.models.models import User, EmployeeProfile, AuditLog
from app.schemas.schemas import UserOut, UserCreate, UserUpdate

router = APIRouter(prefix="/employees", tags=["Employees Management"])

@router.get("", response_model=List[UserOut])
def get_employees(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    users = db.query(User).order_by(User.employee_id.asc()).all()
    return users

@router.get("/{user_id}", response_model=UserOut)
def get_employee(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")
    return user

@router.post("", response_model=UserOut)
def create_employee(req: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    existing = db.query(User).filter((User.email == req.email.strip().lower()) | (User.employee_id == req.employee_id.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID or Email already registered.")
    
    user = User(
        employee_id=req.employee_id.strip().upper(),
        name=req.name.strip(),
        email=req.email.strip().lower(),
        hashed_password=get_password_hash(req.password),
        role=req.role,
        phone_number=req.phone_number,
        extension=req.extension,
        is_active=req.is_active
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = EmployeeProfile(
        user_id=user.id,
        designation="Telecalling Executive" if user.role == "telecaller" else "System Administrator",
        current_status="offline"
    )
    db.add(profile)

    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.name,
        action="CREATE_EMPLOYEE",
        entity_type="User",
        entity_id=str(user.id),
        details=f"Admin created account for {user.name} ({user.employee_id})"
    )
    db.add(audit)
    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}", response_model=UserOut)
def update_employee(user_id: int, req: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    if req.name is not None:
        user.name = req.name.strip()
    if req.phone_number is not None:
        user.phone_number = req.phone_number.strip()
    if req.extension is not None:
        user.extension = req.extension.strip()
    if req.is_active is not None:
        user.is_active = req.is_active
    if req.is_locked is not None:
        user.is_locked = req.is_locked
        if not req.is_locked:
            user.failed_login_attempts = 0
    if req.role is not None and current_user.role == "super_admin":
        user.role = req.role

    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.name,
        action="UPDATE_EMPLOYEE",
        entity_type="User",
        entity_id=str(user.id),
        details=f"Admin updated details for {user.name}"
    )
    db.add(audit)
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{user_id}/toggle-lock")
def toggle_lock(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")
    user.is_locked = not user.is_locked
    if not user.is_locked:
        user.failed_login_attempts = 0
    db.commit()
    return {"message": f"Account {'unlocked' if not user.is_locked else 'locked'} successfully", "is_locked": user.is_locked}
