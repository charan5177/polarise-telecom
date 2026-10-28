import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest, Lead, Call } from '../../services/api';
import { useCall } from '../../context/CallContext';
import { StatusBadge } from '../../components/StatusBadge';
import { RecordingPlayer } from '../../components/RecordingPlayer';
import { 
  ArrowLeft, 
  PhoneCall, 
  Calendar, 
  Mail, 
  MapPin, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  User, 
  History
} from 'lucide-react';

export const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [newStatus, setNewStatus] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const { startOutboundCall } = useCall();

  const fetchLeadDetails = async () => {
    try {
      const [l, c] = await Promise.all([
        apiRequest<Lead>(`/leads/${id}`),
        apiRequest<Call[]>(`/calls?lead_id=${id}`)
      ]);
      setLead(l);
      setCalls(c);
      setNewStatus(l.status);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!lead) return;
    try {
      const updated = await apiRequest<Lead>(`/leads/${lead.id}`, 'PUT', {
        status: newStatus,
        notes: newNotes ? `${new Date().toLocaleDateString()}: ${newNotes}\n` + (lead.notes || '') : lead.notes
      });
      setLead(updated);
      setNewNotes('');
      alert('Lead status successfully updated!');
    } catch (e: any) {
      alert(e.message || 'Failed to update lead');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading student dossier...</div>;
  }

  if (!lead) {
    return <div className="py-12 text-center text-xs text-rose-500">Lead record not found or unauthorized.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/my-leads" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Leads</span>
      </Link>

      {/* Profile Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <User className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-blue-600">{lead.lead_code}</span>
                <StatusBadge status={lead.status} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{lead.student_name}</h2>
              <p className="text-xs text-slate-500">
                Parent: <strong className="text-slate-700">{lead.parent_name || 'N/A'}</strong> • Source: {lead.lead_source}
              </p>
            </div>
          </div>

          <button
            onClick={() => startOutboundCall(lead.phone, lead.student_name, lead.id)}
            className="flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Call Student ({lead.phone})</span>
          </button>
        </div>

        {/* Lead Details Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-5 text-xs">
          <div>
            <span className="text-slate-400">Course Interest</span>
            <div className="font-semibold text-slate-800 mt-0.5">{lead.course_interest}</div>
          </div>
          <div>
            <span className="text-slate-400">Primary Phone</span>
            <div className="font-mono font-semibold text-slate-800 mt-0.5">{lead.phone}</div>
          </div>
          <div>
            <span className="text-slate-400">Location</span>
            <div className="font-semibold text-slate-800 mt-0.5">{lead.city}, {lead.state}</div>
          </div>
          <div>
            <span className="text-slate-400">Email Address</span>
            <div className="font-semibold text-slate-800 mt-0.5">{lead.email || 'None provided'}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Update Status + Call Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Fast Status Update */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Update Lead Status</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Pipeline Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
            >
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Follow-up Required">Follow-up Required</option>
              <option value="Converted">Converted (Application Done)</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Invalid Number">Invalid Number</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Add Counseling Note</label>
            <textarea
              rows={3}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Record counseling milestone, fee discussion, college choice..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleUpdateStatus}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
          >
            Save Updates
          </button>

          {lead.notes && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historical Notes:</span>
              <pre className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl whitespace-pre-wrap font-sans">
                {lead.notes}
              </pre>
            </div>
          )}
        </div>

        {/* Right Column: Call History Timeline */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
            <History className="h-5 w-5 text-orange-600" />
            <h3 className="text-sm font-bold text-slate-900">Call History & Activity Timeline</h3>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {calls.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No calls have been logged for this lead yet. Click "Call Student" to initiate the first conversation.
              </div>
            ) : (
              calls.map((call) => (
                <div key={call.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">
                        {call.direction === 'outbound' ? 'Outbound Call' : 'Inbound Call'}
                      </span>
                      <StatusBadge status={call.status} type="call" />
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(call.start_time).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    Outcome: <strong className="text-slate-800">{call.call_outcome || 'Pending'}</strong> • 
                    Talk Time: <strong className="text-emerald-700">{Math.floor(call.connected_duration / 60)}m {call.connected_duration % 60}s</strong>
                  </div>

                  {call.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                      "{call.notes}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
