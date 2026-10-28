import React, { useState, useEffect } from 'react';
import { apiRequest, Call } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { History, PhoneOutgoing, PhoneIncoming, Filter, ShieldAlert } from 'lucide-react';

export const CallHistory: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [directionFilter, setDirectionFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const dirParam = directionFilter !== 'All' ? `&direction=${directionFilter.toLowerCase()}` : '';
      const data = await apiRequest<Call[]>(`/calls?limit=100${dirParam}`);
      setCalls(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [directionFilter]);

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Personal Call History</h2>
          <p className="text-xs text-slate-500 font-medium">Chronological register of your telecalling conversations and outcomes</p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="All">All Directions</option>
            <option value="Outbound">Outbound Calls</option>
            <option value="Inbound">Inbound Calls</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 flex items-center space-x-2.5">
        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
        <span className="font-semibold">
          Confidentiality Policy: Call recordings are restricted to administrative compliance and quality review.
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-black text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Call Ref</th>
                <th className="px-5 py-3.5">Direction</th>
                <th className="px-5 py-3.5">Customer & Phone</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Talk Time</th>
                <th className="px-5 py-3.5">Outcome</th>
                <th className="px-5 py-3.5">Disposition Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Loading call history...</td>
                </tr>
              ) : calls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No calls recorded yet.</td>
                </tr>
              ) : (
                calls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-500">{call.call_sid}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                        call.direction === 'outbound' ? 'bg-orange-50 text-orange-700' : 'bg-pink-50 text-pink-700'
                      }`}>
                        {call.direction === 'outbound' ? (
                          <PhoneOutgoing className="h-3 w-3" />
                        ) : (
                          <PhoneIncoming className="h-3 w-3" />
                        )}
                        <span className="capitalize">{call.direction}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-black text-slate-900">{call.customer_name || 'Parent / Student'}</div>
                      <div className="font-mono text-[11px] text-slate-500 font-semibold">{call.customer_number}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px] font-semibold">
                      {new Date(call.start_time).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-black text-emerald-600 font-mono">
                        {formatSec(call.connected_duration)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Elapsed: {formatSec(call.elapsed_duration)}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={call.call_outcome || call.status} type="call" />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 italic max-w-xs truncate">
                      {call.notes || 'No remarks recorded'}
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
