import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { ShieldCheck, Filter } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<any[]>('/audit/logs').then(setLogs).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Security & Administrative Audit Logs</h2>
        <p className="text-xs text-slate-500">Immutable trail of administrative changes, lead reassignments, and system configurations</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Timestamp</th>
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">Action Event</th>
              <th className="px-5 py-3.5">Entity Type</th>
              <th className="px-5 py-3.5">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-slate-400">Loading audit trail...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-slate-400">No logs found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">{log.user_name}</td>
                  <td className="px-5 py-3.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono font-bold text-[10px] text-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-blue-600">{log.entity_type || 'System'}</td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-md">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
