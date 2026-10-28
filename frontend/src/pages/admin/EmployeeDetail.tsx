import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest, User, Call, WorkSession } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { RecordingPlayer } from '../../components/RecordingPlayer';
import { ArrowLeft, PhoneCall, Clock, CheckCircle2, History, UserCheck, Shield } from 'lucide-react';

export const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<User | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest<User>(`/employees/${id}`),
      apiRequest<Call[]>(`/calls?user_id=${id}`),
      apiRequest<WorkSession[]>('/sessions/all')
    ]).then(([u, c, s]) => {
      setEmployee(u);
      setCalls(c);
      setSessions(s.filter(sess => sess.user_id === Number(id)));
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  if (loading) return <div className="py-12 text-center text-xs text-slate-400">Loading profile dossier...</div>;
  if (!employee) return <div className="py-12 text-center text-xs text-rose-500">Employee not found.</div>;

  return (
    <div className="space-y-6">
      <Link to="/admin/employees" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Employee List</span>
      </Link>

      {/* Profile Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-md">
              {employee.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-blue-600">{employee.employee_id}</span>
                <StatusBadge status={employee.profile?.current_status || 'offline'} type="employee" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{employee.name}</h2>
              <p className="text-xs text-slate-500">{employee.email} • Forwarding Line: {employee.phone_number || 'None'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Calls & Work Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calls Log */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <History className="h-4 w-4 text-blue-600" />
            <span>Authorized Call Records ({calls.length})</span>
          </h3>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {calls.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No calls on record.</div>
            ) : (
              calls.map(c => (
                <div key={c.id} className="py-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.customer_name} ({c.customer_number})</span>
                    <StatusBadge status={c.status} type="call" />
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Outcome: <strong className="text-slate-700">{c.call_outcome || 'Pending'}</strong> • 
                    Talk time: <strong className="text-emerald-700">{formatSec(c.connected_duration)}</strong>
                  </div>
                  {c.recording && (
                    <RecordingPlayer
                      callId={c.id}
                      callSid={c.call_sid}
                      durationSeconds={c.recording.duration_seconds}
                      isSimulated={c.recording.is_simulated}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Work Sessions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span>Work Sessions & Attendance</span>
          </h3>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No session history.</div>
            ) : (
              sessions.map(s => (
                <div key={s.id} className="py-3 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{s.session_date}</div>
                    <div className="text-[11px] text-slate-400">
                      Login: {new Date(s.login_time).toLocaleTimeString()} • 
                      Logout: {s.logout_time ? new Date(s.logout_time).toLocaleTimeString() : 'Active'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono text-slate-800">{formatSec(s.duration_seconds)}</div>
                    <span className="text-[10px] text-blue-600 font-semibold">{s.active_calls_count} calls handled</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
