from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, oauth2_scheme, decode_access_token
from app.models.models import User, EmployeeProfile, WorkSession, AuditLog
from app.schemas.schemas import TokenResponse, LoginRequest, UserOut, StatusUpdateRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User account is deactivated or does not exist")
    if user.is_locked:
        raise HTTPException(status_code=403, detail="Account is temporarily locked. Contact administrator.")
    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ("super_admin", "operations_admin", "reporting_admin"):
        raise HTTPException(status_code=403, detail="Administrative privileges required")
    return current_user

def require_super_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Super Administrator privileges required")
    return current_user

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    
    if user.is_locked:
        raise HTTPException(status_code=403, detail="Account is locked. Please contact your administrator.")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account has been deactivated. Please contact your administrator.")

    if not verify_password(req.password, user.hashed_password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 5:
            user.is_locked = True
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid email or password.")

    # Successful login: reset failed attempts
    user.failed_login_attempts = 0
    now = datetime.now(timezone.utc)
    
    # Update profile status
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == user.id).first()
    if not profile:
        profile = EmployeeProfile(user_id=user.id, current_status="available", status_message="Online")
        db.add(profile)
    else:
        profile.current_status = "available"
        profile.status_message = "Online"
        profile.last_status_change = now
        profile.last_active_at = now

    # Open or continue work session for today
    today = now.date()
    active_session = db.query(WorkSession).filter(
        WorkSession.user_id == user.id,
        WorkSession.session_date == today,
        WorkSession.is_active == True
    ).first()
    
    if not active_session:
        active_session = WorkSession(
            user_id=user.id,
            session_date=today,
            login_time=now,
            is_active=True
        )
        db.add(active_session)

    # Log audit
    audit = AuditLog(
        user_id=user.id,
        user_name=user.name,
        action="USER_LOGIN",
        entity_type="User",
        entity_id=str(user.id),
        details=f"User {user.name} logged into {user.role} workspace."
    )
    db.add(audit)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    # End active work session
    active_session = db.query(WorkSession).filter(
        WorkSession.user_id == current_user.id,
        WorkSession.is_active == True
    ).first()
    
    if active_session:
        active_session.logout_time = now
        active_session.is_active = False
        if active_session.login_time:
            # handle timezone aware vs naive
            login_dt = active_session.login_time
            if login_dt.tzinfo is None:
                login_dt = login_dt.replace(tzinfo=timezone.utc)
            active_session.duration_seconds = max(0, int((now - login_dt).total_seconds()))

    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == current_user.id).first()
    if profile:
        profile.current_status = "offline"
        profile.status_message = "Signed out"
        profile.last_status_change = now

    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.name,
        action="USER_LOGOUT",
        entity_type="User",
        entity_id=str(current_user.id),
        details=f"User {current_user.name} logged out."
    )
    db.add(audit)
    db.commit()
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Update last_active_at
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == current_user.id).first()
    if profile:
        profile.last_active_at = datetime.now(timezone.utc)
        db.commit()
    return current_user

@router.post("/call-forwarding")
def update_call_forwarding(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    phone_raw = data.get("phone_number", "").strip()
    enabled = data.get("forwarding_enabled", True)
    
    digits = "".join(filter(str.isdigit, phone_raw))
    if len(digits) > 10 and digits.startswith("91"):
        digits = digits[2:]
    if len(digits) != 10:
        raise HTTPException(status_code=400, detail="Invalid phone number: Must be exactly 10 digits.")
        
    current_user.phone_number = f"+91{digits}"
    current_user.forwarding_enabled = bool(enabled)
    db.commit()
    return {
        "message": "Call forwarding preferences updated successfully",
        "phone_number": current_user.phone_number,
        "forwarding_enabled": current_user.forwarding_enabled
    }

@router.post("/status")
def update_status(req: StatusUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == current_user.id).first()
    if not profile:
        profile = EmployeeProfile(user_id=current_user.id)
        db.add(profile)
    
    profile.current_status = req.status
    if req.status_message:
        profile.status_message = req.status_message
    profile.last_status_change = datetime.now(timezone.utc)
    profile.last_active_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": profile.current_status, "message": profile.status_message}
