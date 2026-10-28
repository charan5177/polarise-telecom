import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api import auth, employees, leads, calls, telephony, reports, sessions, audit

# Initialize database schema
Base.metadata.create_all(bind=engine)

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
