import React, { useState, useEffect } from 'react';
import { apiRequest, WorkSession, User } from '../../services/api';
import { Clock, Coffee, ShieldAlert, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AttendanceActivity: React.FC = () => {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [employees, setEmployees] = useState<{ [id: number]: User }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest<WorkSession[]>('/sessions/all'),
      apiRequest<User[]>('/employees')
    ]).then(([sess, emps]) => {
      setSessions(sess);
      const map: { [id: number]: User } = {};
      emps.forEach(u => { map[u.id] = u; });
      setEmployees(map);
    }).catch(console.error).finally(() => setLoading(false));
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
          <h2 className="text-xl font-bold text-slate-900">Attendance & Activity Surveillance</h2>
          <p className="text-xs text-slate-500">Observable counselor shifts, login timestamps, and actual call engagements</p>
        </div>

        <Link
          to="/admin/exports"
          className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <span>Export Attendance .xlsx</span>
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
        <span className="font-bold text-slate-800">Operational Integrity Note:</span> Login timestamps verify station connectivity. True productivity is evaluated in conjunction with connected talk minutes and admissions progression.
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Session ID</th>
              <th className="px-5 py-3.5">Counselor Name</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Check In</th>
              <th className="px-5 py-3.5">Check Out</th>
              <th className="px-5 py-3.5">Shift Duration</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-slate-400">Loading work sessions...</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-slate-400">No session logs found.</td></tr>
            ) : (
              sessions.map((s) => {
                const emp = employees[s.user_id];
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">#SESS-{s.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{emp?.name || 'Staff Member'}</div>
                      <div className="text-[10px] text-blue-600 font-mono">{emp?.employee_id}</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-700">{s.session_date}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{new Date(s.login_time).toLocaleTimeString()}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">
                      {s.logout_time ? new Date(s.logout_time).toLocaleTimeString() : <span className="text-emerald-600 font-bold">Logged In</span>}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                      {formatSec(s.duration_seconds)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.is_active ? 'Online' : 'Shift Complete'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
