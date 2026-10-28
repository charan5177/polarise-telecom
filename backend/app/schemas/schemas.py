from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# Auth schemas
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class LoginRequest(BaseModel):
    email: str
    password: str

class PasswordResetRequest(BaseModel):
    user_id: int
    new_password: str

# User schemas
class UserBase(BaseModel):
    employee_id: str
    name: str
    email: str
    role: str
    phone_number: Optional[str] = None
    forwarding_enabled: Optional[bool] = True
    extension: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    phone_number: Optional[str] = None
    extension: Optional[str] = None
    is_active: Optional[bool] = None
    is_locked: Optional[bool] = None

class EmployeeProfileOut(BaseModel):
    designation: Optional[str] = None
    department: Optional[str] = None
    current_status: str
    status_message: Optional[str] = None
    last_status_change: Optional[datetime] = None
    last_active_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserOut(UserBase):
    id: int
    is_locked: bool
    failed_login_attempts: int
    created_at: datetime
    profile: Optional[EmployeeProfileOut] = None

    class Config:
        from_attributes = True

# Work session schemas
class WorkSessionOut(BaseModel):
    id: int
    user_id: int
    session_date: date
    login_time: datetime
    logout_time: Optional[datetime] = None
    duration_seconds: int
    break_time_seconds: int
    active_calls_count: int
    is_active: bool

    class Config:
        from_attributes = True

class StatusUpdateRequest(BaseModel):
    status: str # available, on_call, on_break, offline
    status_message: Optional[str] = None

# Lead schemas
class LeadBase(BaseModel):
    student_name: str
    parent_name: Optional[str] = None
    phone: str
    alt_phone: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = "Bengaluru"
    state: Optional[str] = "Karnataka"
    course_interest: Optional[str] = "B.Tech Computer Science"
    lead_source: Optional[str] = "Website Inquiry"
    status: Optional[str] = "New"
    priority: Optional[str] = "Medium"
    notes: Optional[str] = None
    next_follow_up: Optional[datetime] = None

class LeadCreate(LeadBase):
    assigned_user_id: Optional[int] = None

class LeadUpdate(BaseModel):
    student_name: Optional[str] = None
    parent_name: Optional[str] = None
    phone: Optional[str] = None
    alt_phone: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    course_interest: Optional[str] = None
    lead_source: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_user_id: Optional[int] = None
    notes: Optional[str] = None
    next_follow_up: Optional[datetime] = None

class LeadAssignmentRequest(BaseModel):
    lead_ids: List[int]
    assigned_to_id: Optional[int] = None
    assigned_to_ids: Optional[List[int]] = None
    notes: Optional[str] = "Bulk assigned by administrator"

class LeadOut(LeadBase):
    id: int
    lead_code: str
    assigned_user_id: Optional[int] = None
    assigned_employee_name: Optional[str] = None
    last_contact_date: Optional[datetime] = None
    total_calls_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Call schemas
class InitiateCallRequest(BaseModel):
    lead_id: Optional[int] = None
    customer_number: str
    customer_name: Optional[str] = "Parent / Student"
    is_demo: Optional[bool] = None

class CallStatusUpdateRequest(BaseModel):
    status: str # ringing, in-progress, completed, busy, no-answer, failed
    call_outcome: Optional[str] = None
    notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None

class CallRecordingOut(BaseModel):
    id: int
    recording_sid: str
    recording_url: Optional[str] = None
    duration_seconds: int
    status: str
    is_simulated: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CallOut(BaseModel):
    id: int
    call_sid: str
    user_id: int
    lead_id: Optional[int] = None
    employee_name: Optional[str] = None
    employee_id_code: Optional[str] = None
    lead_code: Optional[str] = None
    customer_number: str
    customer_name: Optional[str] = None
    direction: str
    caller_id: str
    status: str
    start_time: datetime
    answer_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    elapsed_duration: int
    connected_duration: int
    call_outcome: Optional[str] = None
    cost: float
    is_demo: bool
    notes: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    recording: Optional[CallRecordingOut] = None

    class Config:
        from_attributes = True

# Follow up schemas
class FollowUpCreate(BaseModel):
    lead_id: int
    scheduled_time: datetime
    notes: Optional[str] = None

class FollowUpOut(BaseModel):
    id: int
    lead_id: int
    lead_code: Optional[str] = None
    student_name: Optional[str] = None
    parent_name: Optional[str] = None
    phone: Optional[str] = None
    user_id: int
    employee_name: Optional[str] = None
    scheduled_time: datetime
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard statistics schemas
class EmployeeDashboardStats(BaseModel):
    employee_name: str
    employee_id: str
    role: str
    current_status: str
    session_login_time: Optional[datetime] = None
    total_working_seconds: int
    today_total_calls: int
    today_answered_calls: int
    today_unanswered_calls: int
    today_busy_calls: int
    today_failed_calls: int
    today_connected_talk_seconds: int
    average_connected_seconds: int
    last_call_time: Optional[datetime] = None
    pending_followups_count: int
    assigned_leads_count: int

class AdminDashboardStats(BaseModel):
    total_employees: int
    total_admins: int
    employees_online: int
    employees_available: int
    employees_on_call: int
    employees_on_break: int
    employees_offline: int
    employees_not_logged_in: int
    active_calls_count: int
    today_total_calls: int
    today_incoming_calls: int
    today_outgoing_calls: int
    today_answered_calls: int
    today_missed_calls: int
    today_connected_talk_seconds: int
    average_call_duration_seconds: int
    leads_new: int
    leads_assigned: int
    leads_contacted: int
    leads_converted: int
    leads_pending: int
    followups_due: int
    followups_overdue: int

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: str
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class TelephonyConfigOut(BaseModel):
    demo_mode: bool
    provider_name: str
    virtual_number: str
    subdomain: str
    account_sid_masked: str
    api_key_masked: str
    webhook_url: str
    status: str

class TelephonyConfigUpdate(BaseModel):
    demo_mode: bool
    account_sid: Optional[str] = None
    api_key: Optional[str] = None
    api_token: Optional[str] = None
    virtual_number: Optional[str] = None
    subdomain: Optional[str] = None

class InboundSimulateRequest(BaseModel):
    customer_phone: Optional[str] = None
    customer_name: Optional[str] = None
    lead_id: Optional[int] = None
