from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date, Float, Text, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="telecaller") # super_admin, operations_admin, reporting_admin, telecaller
    phone_number = Column(String(30), nullable=True)
    forwarding_enabled = Column(Boolean, default=True)
    extension = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    is_locked = Column(Boolean, default=False)
    failed_login_attempts = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    profile = relationship("EmployeeProfile", back_populates="user", uselist=False)
    work_sessions = relationship("WorkSession", back_populates="user")
    assigned_leads = relationship("Lead", back_populates="assigned_employee", foreign_keys="Lead.assigned_user_id")
    calls = relationship("Call", back_populates="user")
    follow_ups = relationship("FollowUp", back_populates="user")

class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    designation = Column(String(100), default="Admissions Telecaller")
    department = Column(String(100), default="Student Outreach & Counseling")
    current_status = Column(String(30), default="offline") # online, available, on_call, on_break, offline
    status_message = Column(String(255), default="Signed out")
    last_status_change = Column(DateTime, default=utcnow)
    last_active_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="profile")

class WorkSession(Base):
    __tablename__ = "work_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_date = Column(Date, default=lambda: utcnow().date(), index=True)
    login_time = Column(DateTime, default=utcnow)
    logout_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, default=0)
    break_time_seconds = Column(Integer, default=0)
    active_calls_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="work_sessions")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    lead_code = Column(String(50), unique=True, index=True, nullable=False)
    student_name = Column(String(120), nullable=False, index=True)
    parent_name = Column(String(120), nullable=True)
    phone = Column(String(30), nullable=False, index=True)
    alt_phone = Column(String(30), nullable=True)
    email = Column(String(120), nullable=True)
    city = Column(String(80), default="Bengaluru")
    state = Column(String(80), default="Karnataka")
    course_interest = Column(String(150), default="B.Tech Computer Science")
    lead_source = Column(String(100), default="Website Inquiry")
    assigned_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String(50), default="New", index=True) # New, Assigned, Contacted, Interested, Follow-up Required, Not Interested, Converted, Invalid Number, Do Not Contact
    priority = Column(String(30), default="Medium") # Low, Medium, High, Urgent
    last_contact_date = Column(DateTime, nullable=True)
    next_follow_up = Column(DateTime, nullable=True, index=True)
    total_calls_count = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    assigned_employee = relationship("User", back_populates="assigned_leads", foreign_keys=[assigned_user_id])
    calls = relationship("Call", back_populates="lead")
    follow_ups = relationship("FollowUp", back_populates="lead")
    assignments = relationship("LeadAssignment", back_populates="lead")

class LeadAssignment(Base):
    __tablename__ = "lead_assignments"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    assigned_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    previous_assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_at = Column(DateTime, default=utcnow)
    notes = Column(String(255), nullable=True)

    lead = relationship("Lead", back_populates="assignments")

class Call(Base):
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, index=True)
    call_sid = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="SET NULL"), nullable=True, index=True)
    customer_number = Column(String(30), nullable=False, index=True)
    customer_name = Column(String(120), nullable=True)
    direction = Column(String(20), default="outbound", index=True) # outbound, inbound
    caller_id = Column(String(30), nullable=False) # organization virtual number
    status = Column(String(40), default="initiated", index=True) # initiated, ringing, in-progress, completed, busy, no-answer, failed, canceled
    start_time = Column(DateTime, default=utcnow, index=True)
    answer_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    elapsed_duration = Column(Integer, default=0) # Total call duration in seconds
    connected_duration = Column(Integer, default=0) # Connected talk duration in seconds
    call_outcome = Column(String(100), nullable=True) # Converted, Follow-up Required, Ringing/No Answer, etc.
    cost = Column(Float, default=0.0)
    is_demo = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    follow_up_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="calls")
    lead = relationship("Lead", back_populates="calls")
    recording = relationship("CallRecording", back_populates="call", uselist=False)
    events = relationship("CallEvent", back_populates="call")

class CallEvent(Base):
    __tablename__ = "call_events"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)
    timestamp = Column(DateTime, default=utcnow)
    raw_payload = Column(Text, nullable=True)

    call = relationship("Call", back_populates="events")

class CallRecording(Base):
    __tablename__ = "call_recordings"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id", ondelete="CASCADE"), unique=True, nullable=False)
    recording_sid = Column(String(100), unique=True, index=True, nullable=False)
    recording_url = Column(String(255), nullable=True) # Internal streaming path e.g. /api/telephony/recordings/{id}/stream
    duration_seconds = Column(Integer, default=0)
    file_format = Column(String(10), default="mp3")
    status = Column(String(30), default="Available") # Pending, Available, Failed, Not Supported
    is_simulated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    call = relationship("Call", back_populates="recording")

class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_time = Column(DateTime, nullable=False, index=True)
    status = Column(String(30), default="pending", index=True) # pending, completed, rescheduled, cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    lead = relationship("Lead", back_populates="follow_ups")
    user = relationship("User", back_populates="follow_ups")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_name = Column(String(100), default="System")
    action = Column(String(80), nullable=False, index=True)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=utcnow, index=True)

class ProviderAccount(Base):
    __tablename__ = "provider_accounts"

    id = Column(Integer, primary_key=True, index=True)
    provider_name = Column(String(50), default="Exotel")
    is_active = Column(Boolean, default=False)
    virtual_number = Column(String(50), default="+918047190000")
    subdomain = Column(String(100), default="api.exotel.com")
    account_sid_masked = Column(String(100), default="")
    api_key_masked = Column(String(100), default="")
    webhook_url = Column(String(255), default="/api/telephony/webhooks/exotel")
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(120), unique=True, index=True, nullable=False)
    provider = Column(String(50), default="Exotel")
    payload = Column(Text, nullable=False)
    processed = Column(Boolean, default=False)
    processed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
