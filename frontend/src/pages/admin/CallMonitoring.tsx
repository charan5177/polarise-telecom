import React, { useState, useEffect } from 'react';
import { apiRequest, Call, User } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { RecordingPlayer } from '../../components/RecordingPlayer';
import { Radio, PhoneOutgoing, PhoneIncoming, Filter, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CallMonitoring: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('All');
  const [direction, setDirection] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      let query = '/calls?limit=100';
      if (selectedUser !== 'All') query += `&user_id=${selectedUser}`;
      if (direction !== 'All') query += `&direction=${direction.toLowerCase()}`;
      
      const [c, e] = await Promise.all([
        apiRequest<Call[]>(query),
        apiRequest<User[]>('/employees')
      ]);
      setCalls(c);
      setEmployees(e.filter(u => u.role === 'telecaller'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [selectedUser, direction]);

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Live Call Monitoring & Activity Stream</h2>
          <p className="text-xs text-slate-500">Real-time log of inbound inquiries and outbound counselor dials across all 10 lines</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchCalls}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/exports"
            className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export to Excel</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-600">Filters:</span>
        </div>

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 p-2 font-medium text-slate-700 focus:outline-none"
        >
          <option value="All">All Counselors (EMP 01 - 10)</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.employee_id})
            </option>
          ))}
        </select>

        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 p-2 font-medium text-slate-700 focus:outline-none"
        >
          <option value="All">All Directions</option>
          <option value="Outbound">Outbound Only</option>
          <option value="Inbound">Inbound Only</option>
        </select>
      </div>

      {/* Full Call Monitoring Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Call Ref</th>
                <th className="px-5 py-3.5">Counselor</th>
                <th className="px-5 py-3.5">Student / Parent</th>
                <th className="px-5 py-3.5">Direction</th>
                <th className="px-5 py-3.5">Time</th>
                <th className="px-5 py-3.5">Talk Time (Connected)</th>
                <th className="px-5 py-3.5">Outcome</th>
                <th className="px-5 py-3.5">Call Recording</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center text-slate-400">Loading call activity...</td></tr>
              ) : calls.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-slate-400">No calls matched the filters.</td></tr>
              ) : (
                calls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">{call.call_sid}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{call.employee_name || 'N/A'}</div>
                      <div className="font-mono text-[11px] text-blue-600">{call.employee_id_code}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{call.customer_name || 'Parent / Student'}</div>
                      <div className="font-mono text-[11px] text-slate-400">{call.customer_number}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        call.direction === 'outbound' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {call.direction === 'outbound' ? <PhoneOutgoing className="h-3 w-3" /> : <PhoneIncoming className="h-3 w-3" />}
                        <span className="capitalize">{call.direction}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">
                      {new Date(call.start_time).toLocaleTimeString()}
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      <div className="font-bold text-emerald-600">{formatSec(call.connected_duration)}</div>
                      <div className="text-[10px] text-slate-400">Elapsed: {formatSec(call.elapsed_duration)}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={call.call_outcome || call.status} type="call" />
                    </td>
                    <td className="px-5 py-3.5 min-w-[200px]">
                      {call.recording && call.recording.status === 'Available' ? (
                        <RecordingPlayer
                          callId={call.id}
                          callSid={call.call_sid}
                          durationSeconds={call.recording.duration_seconds}
                          isSimulated={call.recording.is_simulated}
                        />
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No recording</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
