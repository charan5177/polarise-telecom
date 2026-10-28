import React, { useState, useEffect } from 'react';
import { apiRequest, WorkSession } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Clock, Coffee, CheckCircle2, ShieldAlert } from 'lucide-react';

export const MySessions: React.FC = () => {
  const { user, updateStatus } = useAuth();
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const data = await apiRequest<WorkSession[]>('/sessions/my');
      setSessions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const formatSec = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance & Work Sessions</h2>
          <p className="text-xs text-slate-500">Observable login sessions, break intervals, and daily working hours</p>
        </div>

        {/* Current status actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateStatus(user?.profile?.current_status === 'on_break' ? 'available' : 'on_break')}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
              user?.profile?.current_status === 'on_break'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
            }`}
          >
            <Coffee className="h-4 w-4" />
            <span>{user?.profile?.current_status === 'on_break' ? 'Resume Work' : 'Take a Break'}</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-900 flex items-start space-x-3">
        <ShieldAlert className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">System Compliance Notice:</span> Working hours and call engagements are verified against database session records and call timestamps. Telecallers cannot edit historical attendance.
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Session Date</th>
              <th className="px-5 py-3.5">Login Timestamp</th>
              <th className="px-5 py-3.5">Logout Timestamp</th>
              <th className="px-5 py-3.5">Working Duration</th>
              <th className="px-5 py-3.5">Engaged Calls</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-slate-400">Loading sessions...</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-slate-400">No session logs found.</td></tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{s.session_date}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">{new Date(s.login_time).toLocaleTimeString()}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">
                    {s.logout_time ? new Date(s.logout_time).toLocaleTimeString() : <span className="text-emerald-600 font-bold">Active Now</span>}
                  </td>
                  <td className="px-5 py-3.5 font-bold font-mono text-slate-700">
                    {formatSec(s.duration_seconds)}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-blue-600">{s.active_calls_count} calls</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {s.is_active ? 'In Progress' : 'Logged Out'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
