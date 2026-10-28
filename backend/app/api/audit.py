from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import require_admin
from app.models.models import AuditLog, User
from app.schemas.schemas import AuditLogOut

router = APIRouter(prefix="/audit", tags=["Audit Logs"])

@router.get("/logs", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = 100,
    action: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs
