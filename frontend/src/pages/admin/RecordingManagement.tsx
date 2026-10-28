import React, { useState, useEffect } from 'react';
import { apiRequest, Call } from '../../services/api';
import { RecordingPlayer } from '../../components/RecordingPlayer';
import { FileAudio, ShieldAlert, Sparkles, CheckCircle2, Lock } from 'lucide-react';

export const RecordingManagement: React.FC = () => {
  const [callsWithRecordings, setCallsWithRecordings] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Call[]>('/calls?limit=100').then((calls) => {
      setCallsWithRecordings(calls.filter(c => c.recording));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Call Recording Vault & Compliance</h2>
        <p className="text-xs text-slate-500">Encrypted audio repository for counseling quality assurance and admissions compliance</p>
      </div>

      {/* Compliance Box */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 text-xs text-indigo-950 flex items-start space-x-3">
        <ShieldAlert className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold">Indian Telecom & Privacy Compliance Architecture:</div>
          <p className="text-[11px] leading-relaxed text-indigo-900/80">
            All calls connected via Exotel virtual trunks adhere to mandatory two-party recording announcements. 
            Direct public storage URLs are strictly forbidden; audio files are streamed via secure time-limited tokenized endpoints 
            with role-based access auditing. Default data retention policy: 180 days.
          </p>
        </div>
      </div>

      {/* Recordings Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Recording SID</th>
              <th className="px-5 py-3.5">Counselor</th>
              <th className="px-5 py-3.5">Student & Phone</th>
              <th className="px-5 py-3.5">Recorded Date</th>
              <th className="px-5 py-3.5">Duration</th>
              <th className="px-5 py-3.5">Mode</th>
              <th className="px-5 py-3.5">Audio Player</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-slate-400">Loading recordings...</td></tr>
            ) : callsWithRecordings.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-slate-400">No recordings stored yet.</td></tr>
            ) : (
              callsWithRecordings.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-700">
                    {c.recording?.recording_sid}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{c.employee_name}</div>
                    <div className="text-[10px] text-blue-600 font-mono">{c.employee_id_code}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{c.customer_name}</div>
                    <div className="font-mono text-[11px] text-slate-400">{c.customer_number}</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                    {new Date(c.start_time).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-600">
                    {c.recording?.duration_seconds}s
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center space-x-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      <Sparkles className="h-3 w-3" />
                      <span>{c.recording?.is_simulated ? 'SIMULATED DEMO' : 'LIVE EXOTEL'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 min-w-[220px]">
                    <RecordingPlayer
                      callId={c.id}
                      callSid={c.call_sid}
                      durationSeconds={c.recording!.duration_seconds}
                      isSimulated={c.recording!.is_simulated}
                    />
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
