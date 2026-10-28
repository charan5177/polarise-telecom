import React, { useState, useEffect } from 'react';
import { apiRequest, FollowUp } from '../../services/api';
import { useCall } from '../../context/CallContext';
import { CalendarClock, PhoneCall, CheckCircle2, Clock } from 'lucide-react';

export const FollowUps: React.FC = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const { startOutboundCall } = useCall();

  useEffect(() => {
    // In our backend, followups can be fetched or leads with next_follow_up
    apiRequest<FollowUp[]>('/leads').then((leads: any[]) => {
      const fus: FollowUp[] = leads
        .filter(l => l.next_follow_up)
        .map(l => ({
          id: l.id,
          lead_id: l.id,
          lead_code: l.lead_code,
          student_name: l.student_name,
          parent_name: l.parent_name,
          phone: l.phone,
          user_id: l.assigned_user_id || 0,
          scheduled_time: l.next_follow_up,
          status: 'pending',
          notes: l.notes || 'Scheduled counseling follow-up call',
          created_at: l.updated_at
        }));
      setFollowUps(fus);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Scheduled Follow-ups</h2>
        <p className="text-xs text-slate-500">Upcoming parent appointments and student advisory callbacks</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Lead</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Scheduled Date & Time</th>
                <th className="px-5 py-3.5">Contact Number</th>
                <th className="px-5 py-3.5">Notes</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading follow-ups...</td>
                </tr>
              ) : followUps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No pending follow-ups scheduled.</td>
                </tr>
              ) : (
                followUps.map((fu) => (
                  <tr key={fu.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-600">{fu.lead_code}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{fu.student_name}</td>
                    <td className="px-5 py-3.5 font-medium text-amber-700">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span>{new Date(fu.scheduled_time).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">{fu.phone}</td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">{fu.notes}</td>
                    <td className="px-5 py-3.5 text-right">
                      {fu.phone && (
                        <button
                          onClick={() => startOutboundCall(fu.phone!, fu.student_name, fu.lead_id)}
                          className="inline-flex items-center space-x-1 rounded-xl bg-emerald-50 px-3 py-1.5 font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition shadow-sm"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          <span>Dial Now</span>
                        </button>
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
