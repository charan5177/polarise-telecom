import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api import auth, employees, leads, calls, telephony, reports, sessions, audit

# Initialize database schema
Base.metadata.create_all(bind=engine)

def ensure_default_accounts():
    from app.core.database import SessionLocal
    from app.models.models import User, EmployeeProfile
    from app.core.security import get_password_hash
    from datetime import datetime, timezone
    
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            hashed_pass = get_password_hash("Polaris@2026")
            now = datetime.now(timezone.utc)
            # 3 Admins
            for eid, name, email, role, des, dept, phone, ext in [
                ("ADM-001", "Dr. Arvind Menon", "admin1@polarisedu.in", "super_admin", "Super Administrator & Director", "Executive Management", "+918047190001", "100"),
                ("ADM-002", "Pooja Sharma", "admin2@polarisedu.in", "operations_admin", "Operations Administrator", "Telecalling Operations", "+918047190002", "101"),
                ("ADM-003", "Karthik Iyer", "admin3@polarisedu.in", "reporting_admin", "Reporting Administrator", "Data & Performance Analytics", "+918047190003", "102")
            ]:
                u = User(employee_id=eid, name=name, email=email, hashed_password=hashed_pass, role=role, phone_number=phone, extension=ext, is_active=True)
                db.add(u)
                db.flush()
                db.add(EmployeeProfile(user_id=u.id, designation=des, department=dept, current_status="available", status_message="Admin Console Active", last_status_change=now, last_active_at=now))
            # 10 Telecallers
            telecallers = [
                ("EMP-001", "Rohan Verma", "emp01@polarisedu.in", "+919876543201", "201"),
                ("EMP-002", "Sneha Patel", "emp02@polarisedu.in", "+919876543202", "202"),
                ("EMP-003", "Ananya Rao", "emp03@polarisedu.in", "+919876543203", "203"),
                ("EMP-004", "Vikas Deshmukh", "emp04@polarisedu.in", "+919876543204", "204"),
                ("EMP-005", "Meera Nair", "emp05@polarisedu.in", "+919876543205", "205"),
                ("EMP-006", "Aditya Kulkarni", "emp06@polarisedu.in", "+919876543206", "206"),
                ("EMP-007", "Priya Sundaram", "emp07@polarisedu.in", "+919876543207", "207"),
                ("EMP-008", "Rahul Sengupta", "emp08@polarisedu.in", "+919876543208", "208"),
                ("EMP-009", "Divya Joshi", "emp09@polarisedu.in", "+919876543209", "209"),
                ("EMP-010", "Farhan Khan", "emp10@polarisedu.in", "+919876543210", "210"),
            ]
            for eid, name, email, phone, ext in telecallers:
                u = User(employee_id=eid, name=name, email=email, hashed_password=hashed_pass, role="telecaller", phone_number=phone, extension=ext, is_active=True)
                db.add(u)
                db.flush()
                db.add(EmployeeProfile(user_id=u.id, designation="Senior Admissions Telecaller", department="Student Admissions Counseling", current_status="available", status_message="Online - Ready to dial", last_status_change=now, last_active_at=now))
            db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

ensure_default_accounts()

app = FastAPI(
    title=settings.APP_NAME,
    description="Cloud Telecalling and CRM platform developed for Polaris Educational Consultancy.",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development/demo, allow all local ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(auth.router, prefix="/api")
app.include_router(employees.router, prefix="/api")
app.include_router(leads.router, prefix="/api")
app.include_router(calls.router, prefix="/api")
app.include_router(telephony.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(audit.router, prefix="/api")

@app.get("/")
def root():
    return {
        "application": settings.APP_NAME,
        "client": settings.CLIENT_NAME,
        "mode": "Demo Mode" if settings.DEMO_MODE else "Live Telephony Mode",
        "status": "Operational",
        "docs_url": "/docs"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}
