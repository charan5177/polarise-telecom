const API_BASE = '/api';

export interface User {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'operations_admin' | 'reporting_admin' | 'telecaller';
  phone_number?: string;
  forwarding_enabled?: boolean;
  extension?: string;
  is_active: boolean;
  is_locked: boolean;
  profile?: {
    designation: string;
    department: string;
    current_status: 'online' | 'available' | 'on_call' | 'on_break' | 'offline';
    status_message: string;
    last_status_change?: string;
    last_active_at?: string;
  };
}

export interface Lead {
  id: number;
  lead_code: string;
  student_name: string;
  parent_name?: string;
  phone: string;
  alt_phone?: string;
  email?: string;
  city: string;
  state: string;
  course_interest: string;
  lead_source: string;
  assigned_user_id?: number;
  assigned_employee_name?: string;
  status: string;
  priority: string;
  last_contact_date?: string;
  next_follow_up?: string;
  total_calls_count: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Call {
  id: number;
  call_sid: string;
  user_id: number;
  lead_id?: number;
  employee_name?: string;
  employee_id_code?: string;
  lead_code?: string;
  customer_number: string;
  customer_name?: string;
  direction: 'outbound' | 'inbound';
  caller_id: string;
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'no-answer' | 'failed' | 'canceled';
  start_time: string;
  answer_time?: string;
  end_time?: string;
  elapsed_duration: number;
  connected_duration: number;
  call_outcome?: string;
  cost: number;
  is_demo: boolean;
  notes?: string;
  follow_up_date?: string;
  recording?: {
    id: number;
    recording_sid: string;
    recording_url: string;
    duration_seconds: number;
    status: string;
    is_simulated: boolean;
  };
}

export interface FollowUp {
  id: number;
  lead_id: number;
  lead_code?: string;
  student_name?: string;
  parent_name?: string;
  phone?: string;
  user_id: number;
  employee_name?: string;
  scheduled_time: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface WorkSession {
  id: number;
  user_id: number;
  session_date: string;
  login_time: string;
  logout_time?: string;
  duration_seconds: number;
  break_time_seconds: number;
  active_calls_count: number;
  is_active: boolean;
}

export interface EmployeeDashboardStats {
  employee_name: string;
  employee_id: string;
  role: string;
  current_status: string;
  session_login_time?: string;
  total_working_seconds: number;
  today_total_calls: number;
  today_answered_calls: number;
  today_unanswered_calls: number;
  today_busy_calls: number;
  today_failed_calls: number;
  today_connected_talk_seconds: number;
  average_connected_seconds: number;
  last_call_time?: string;
  pending_followups_count: number;
  assigned_leads_count: number;
}

export interface AdminDashboardStats {
  total_employees: number;
  total_admins: number;
  employees_online: number;
  employees_available: number;
  employees_on_call: number;
  employees_on_break: number;
  employees_offline: number;
  employees_not_logged_in: number;
  active_calls_count: number;
  today_total_calls: number;
  today_incoming_calls: number;
  today_outgoing_calls: number;
  today_answered_calls: number;
  today_missed_calls: number;
  today_connected_talk_seconds: number;
  average_call_duration_seconds: number;
  leads_new: number;
  leads_assigned: number;
  leads_contacted: number;
  leads_converted: number;
  leads_pending: number;
  followups_due: number;
  followups_overdue: number;
}

export async function apiRequest<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  isFormData: boolean = false
): Promise<T> {
  const token = localStorage.getItem('polarise_token');
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData && body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    localStorage.removeItem('polarise_token');
    localStorage.removeItem('polarise_user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
