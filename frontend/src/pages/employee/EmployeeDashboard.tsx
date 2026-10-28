import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import { apiRequest, EmployeeDashboardStats, Call, Lead } from '../../services/api';
import { StatsCard } from '../../components/StatsCard';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  PhoneForwarded,
  Download,
  PhoneIncoming,
  FolderKanban,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { startOutboundCall, triggerDemoInbound } = useCall();
  const [stats, setStats] = useState<EmployeeDashboardStats | null>(null);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [assignedLeads, setAssignedLeads] = useState<Lead[]>([]);
  const [totalLeadsCount, setTotalLeadsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [downloadingSheet, setDownloadingSheet] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [s, c, l] = await Promise.all([
        apiRequest<EmployeeDashboardStats>('/reports/dashboard/employee'),
        apiRequest<Call[]>('/calls?limit=5'),
        apiRequest<Lead[]>('/leads')
      ]);
      setStats(s);
      setRecentCalls(c);
      setAssignedLeads(l.slice(0, 6));
      setTotalLeadsCount(l.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatSec = (sec?: number) => {
    if (!sec) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  // Download personal calling sheet (.xlsx)
  const handleDownloadMyCallSheet = async () => {
    setDownloadingSheet(true);
    try {
      const token = localStorage.getItem('polarise_token');
      const response = await fetch('/api/reports/export/employee-callsheet/excel', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Polaris_My_Assigned_Leads_${user?.employee_id}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || 'Failed to download calling sheet');
    } finally {
      setDownloadingSheet(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs font-bold text-blue-600">
        <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
        Loading your telecalling terminal...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 3D Top Banner: Executive Operations Cockpit Header */}
      <div className="rounded-3xl border border-blue-800/80 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl card-3d">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-xl bg-blue-500/20 border border-blue-400/40 px-3 py-1 text-xs font-mono font-black text-blue-300">
                TERMINAL: {user?.employee_id}
              </span>
              <span className="text-xs font-black text-blue-200 uppercase tracking-wider">
                Admissions Telecalling Station
              </span>
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">{user?.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
              <span>
                Assigned Contacts: <strong className="text-amber-400 font-mono font-black text-sm">{totalLeadsCount || stats?.assigned_leads_count || 140} Leads</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span>
                Pending Follow-ups: <strong className="text-blue-300 font-mono font-bold">{stats?.pending_followups_count || 0}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center space-x-1.5">
                <PhoneForwarded className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  Forwarding:{' '}
                  <strong className="text-emerald-300 font-bold">
                    {user?.forwarding_enabled ? (user?.phone_number || '+91 98450 12345') : 'Direct Softphone'}
                  </strong>
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Download Personal Excel Calling Sheet */}
            <button
              onClick={handleDownloadMyCallSheet}
              disabled={downloadingSheet}
              className="flex items-center space-x-2 rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-xs font-black text-slate-200 hover:bg-slate-700 hover:border-slate-500 transition shadow"
              title="Download your assigned student contact list in Excel format"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span>{downloadingSheet ? 'Generating...' : 'Download My Calling Sheet (.xlsx)'}</span>
            </button>

            {/* Test Inbound Call */}
            <button
              onClick={() => triggerDemoInbound()}
              className="flex items-center space-x-1.5 rounded-2xl border border-blue-400/40 bg-blue-600/30 px-3.5 py-2.5 text-xs font-black text-blue-200 hover:bg-blue-600/50 transition"
              title="Test receiving an incoming parent call"
            >
              <PhoneIncoming className="h-4 w-4 text-blue-300" />
              <span>Test Inbound Call</span>
            </button>

            {/* Softphone Link */}
            <Link
              to="/calling"
              className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 hover:opacity-95 transition btn-3d-primary"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Open Softphone Console</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3D Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Today's Dials"
          value={stats?.today_total_calls || 0}
          subtitle="Outbound & Inbound calls"
          icon={PhoneCall}
          variant="amber"
        />
        <StatsCard
          title="Connected Calls"
          value={stats?.today_answered_calls || 0}
          subtitle={`Connect rate: ${stats?.today_total_calls ? Math.round((stats.today_answered_calls / stats.today_total_calls) * 100) : 0}%`}
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatsCard
          title="Connected Talk Time"
          value={formatSec(stats?.today_connected_talk_seconds)}
          subtitle={`Avg: ${formatSec(stats?.average_connected_seconds)}/call`}
          icon={Clock}
          variant="indigo"
        />
        <StatsCard
          title="Shift Working Time"
          value={formatSec(stats?.total_working_seconds)}
          subtitle={`Console Status: ${stats?.current_status?.toUpperCase() || 'ONLINE'}`}
          icon={TrendingUp}
          variant="rose"
        />
      </div>

      {/* Calls Breakdown Summary */}
      <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-white p-4 card-3d">
        <div className="flex items-center space-x-3 border-r border-slate-100 pr-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 font-bold">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800 font-mono">{stats?.today_unanswered_calls || 0}</div>
            <div className="text-[11px] font-bold text-slate-500">Ringing / No Answer</div>
          </div>
        </div>
        <div className="flex items-center space-x-3 border-r border-slate-100 pr-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 font-bold">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800 font-mono">{stats?.today_busy_calls || 0}</div>
            <div className="text-[11px] font-bold text-slate-500">Line Busy</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-bold">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800 font-mono">{stats?.pending_followups_count || 0}</div>
            <div className="text-[11px] font-bold text-slate-500">Scheduled Follow-ups</div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Priority Assigned Leads & Recent Call Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assigned Leads */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 card-3d">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <FolderKanban className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Your Assigned Student Leads</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {totalLeadsCount} allocated student & parent contacts to contact
              </p>
            </div>
            <Link to="/my-leads" className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center space-x-1">
              <span>View All ({totalLeadsCount})</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {assignedLeads.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-bold">No leads assigned yet.</div>
            ) : (
              assignedLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-3 hover:bg-slate-50/60 transition rounded-xl px-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-900">{lead.student_name}</span>
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {lead.lead_code}
                      </span>
                      <StatusBadge status={lead.status} />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {lead.course_interest} • <span className="font-mono font-bold text-slate-700">{lead.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => startOutboundCall(lead.phone, lead.student_name, lead.id)}
                    className="flex items-center space-x-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-black uppercase text-white shadow-md hover:opacity-90 transition btn-3d-primary"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>Dial</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Calls History */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 card-3d">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Recent Call Conversations</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">Your latest call dispositions and durations</p>
            </div>
            <Link to="/call-history" className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center space-x-1">
              <span>Full Log</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recentCalls.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-bold">No calls made yet today.</div>
            ) : (
              recentCalls.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3 hover:bg-slate-50/60 transition rounded-xl px-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-900">{c.customer_name}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-600">
                        {c.direction}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {c.call_outcome || c.status} • Talk: <strong className="text-slate-800 font-mono font-bold">{formatSec(c.connected_duration)}</strong>
                    </div>
                  </div>
                  <StatusBadge status={c.status} type="call" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
