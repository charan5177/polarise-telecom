import React, { useState, useEffect } from 'react';
import { apiRequest, AdminDashboardStats, User } from '../../services/api';
import { StatsCard } from '../../components/StatsCard';
import { StatusBadge } from '../../components/StatusBadge';
import { Link } from 'react-router-dom';
import { 
  Users, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  Radio, 
  FileSpreadsheet, 
  Sparkles, 
  ArrowUpRight, 
  Filter,
  Check,
  RefreshCw
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const [s, emps] = await Promise.all([
        apiRequest<AdminDashboardStats>('/reports/dashboard/admin'),
        apiRequest<User[]>('/employees')
      ]);
      setStats(s);
      setEmployees(emps.filter(u => u.role === 'telecaller'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 8000); // 8s heartbeat
    return () => clearInterval(interval);
  }, []);

  const formatSec = (sec?: number) => {
    if (!sec) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  // Filter employees based on clicked status card
  const filteredEmployees = employees.filter(emp => {
    if (!activeStatusFilter) return true;
    const currentStatus = emp.profile?.current_status || 'offline';
    if (activeStatusFilter === 'not_logged_in') {
      return currentStatus === 'offline' && !emp.profile?.last_active_at;
    }
    return currentStatus === activeStatusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner with Luxury Mint & Teal Gradient */}
      <div className="rounded-3xl border border-teal-800/50 bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl shadow-teal-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-xs font-black text-emerald-300 uppercase tracking-wider">
                Luxury Mint & Teal Admin Command
              </span>
              <span className="text-xs text-teal-200/80 font-bold">Polaris Educational Consultancy</span>
            </div>
            <h2 className="mt-1.5 text-3xl font-black tracking-tight">Central Telecalling Monitor</h2>
            <p className="mt-1 text-xs text-slate-300 font-medium">
              Live oversight across 10 counselor lines with real-time status telemetry and admissions pipeline metrics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/exports"
              className="flex items-center space-x-1.5 rounded-xl bg-teal-900/60 border border-teal-400/30 px-4 py-2.5 text-xs font-black text-teal-100 shadow hover:bg-teal-800/80 transition"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-300" />
              <span>Export Excel Reports</span>
            </Link>
            <Link
              to="/admin/calls"
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow hover:from-teal-700 hover:to-emerald-700 transition"
            >
              <Radio className="h-4 w-4 text-emerald-200" />
              <span>Live Call Logs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Registered Staff"
          value={`${stats?.total_employees || 10} Staff`}
          subtitle="10 Counselors • 3 Admins"
          icon={Users}
          variant="amber"
        />
        <StatsCard
          title="Active Calls Now"
          value={stats?.active_calls_count || 0}
          subtitle="Live connected / ringing"
          icon={Radio}
          variant="rose"
        />
        <StatsCard
          title="Today's Connected Time"
          value={formatSec(stats?.today_connected_talk_seconds)}
          subtitle={`Average: ${formatSec(stats?.average_call_duration_seconds)} / call`}
          icon={Clock}
          variant="emerald"
        />
        <StatsCard
          title="Admissions Converted"
          value={stats?.leads_converted || 0}
          subtitle={`Total leads: ${(stats?.leads_new || 0) + (stats?.leads_assigned || 0) + (stats?.leads_contacted || 0) + (stats?.leads_converted || 0)}`}
          icon={CheckCircle2}
          variant="indigo"
        />
      </div>

      {/* Interactive Clickable Live Status Cards */}
      <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Counselor Live Status Surveillance
            </h3>
            <p className="text-xs text-slate-500 font-medium">Click on any live status card below to inspect who is currently in that state</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black text-emerald-700 font-mono">
              {stats?.employees_online || 0} Live Staff Logged In
            </span>
          </div>
        </div>

        {/* 5 Interactive Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* 1. Available */}
          <button
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'available' ? null : 'available')}
            className={`rounded-2xl border-2 p-3 text-center transition-all ${
              activeStatusFilter === 'available'
                ? 'border-emerald-600 bg-emerald-100/80 shadow-md ring-2 ring-emerald-400'
                : 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/50'
            }`}
          >
            <div className="text-3xl font-black text-emerald-700">{stats?.employees_available || 0}</div>
            <div className="text-xs font-black text-emerald-900 uppercase tracking-wider mt-0.5">Available</div>
            <div className="text-[10px] text-emerald-700 font-bold">Ready to Dial</div>
            {activeStatusFilter === 'available' && (
              <span className="mt-1 inline-flex items-center text-[10px] font-black text-emerald-800">
                <Check className="h-3 w-3 mr-0.5" /> Filtering
              </span>
            )}
          </button>

          {/* 2. On Call */}
          <button
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'on_call' ? null : 'on_call')}
            className={`rounded-2xl border-2 p-3 text-center transition-all ${
              activeStatusFilter === 'on_call'
                ? 'border-amber-600 bg-amber-100/80 shadow-md ring-2 ring-amber-400'
                : 'border-amber-200 bg-amber-50/60 hover:bg-amber-100/50'
            }`}
          >
            <div className="text-3xl font-black text-amber-700">{stats?.employees_on_call || 0}</div>
            <div className="text-xs font-black text-amber-900 uppercase tracking-wider mt-0.5">On Call</div>
            <div className="text-[10px] text-amber-700 font-bold">Active Speech</div>
            {activeStatusFilter === 'on_call' && (
              <span className="mt-1 inline-flex items-center text-[10px] font-black text-amber-800">
                <Check className="h-3 w-3 mr-0.5" /> Filtering
              </span>
            )}
          </button>

          {/* 3. On Break */}
          <button
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'on_break' ? null : 'on_break')}
            className={`rounded-2xl border-2 p-3 text-center transition-all ${
              activeStatusFilter === 'on_break'
                ? 'border-orange-600 bg-orange-100/80 shadow-md ring-2 ring-orange-400'
                : 'border-orange-200 bg-orange-50/60 hover:bg-orange-100/50'
            }`}
          >
            <div className="text-3xl font-black text-orange-700">{stats?.employees_on_break || 0}</div>
            <div className="text-xs font-black text-orange-900 uppercase tracking-wider mt-0.5">On Break</div>
            <div className="text-[10px] text-orange-700 font-bold">Rest / Meal</div>
            {activeStatusFilter === 'on_break' && (
              <span className="mt-1 inline-flex items-center text-[10px] font-black text-orange-800">
                <Check className="h-3 w-3 mr-0.5" /> Filtering
              </span>
            )}
          </button>

          {/* 4. Offline */}
          <button
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'offline' ? null : 'offline')}
            className={`rounded-2xl border-2 p-3 text-center transition-all ${
              activeStatusFilter === 'offline'
                ? 'border-slate-600 bg-slate-200 shadow-md ring-2 ring-slate-400'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className="text-3xl font-black text-slate-700">{stats?.employees_offline || 0}</div>
            <div className="text-xs font-black text-slate-800 uppercase tracking-wider mt-0.5">Offline</div>
            <div className="text-[10px] text-slate-500 font-bold">Signed Off</div>
            {activeStatusFilter === 'offline' && (
              <span className="mt-1 inline-flex items-center text-[10px] font-black text-slate-800">
                <Check className="h-3 w-3 mr-0.5" /> Filtering
              </span>
            )}
          </button>

          {/* 5. Not Logged In */}
          <button
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'not_logged_in' ? null : 'not_logged_in')}
            className={`rounded-2xl border-2 p-3 text-center transition-all ${
              activeStatusFilter === 'not_logged_in'
                ? 'border-rose-600 bg-rose-100/80 shadow-md ring-2 ring-rose-400'
                : 'border-rose-200 bg-rose-50/60 hover:bg-rose-100/50'
            }`}
          >
            <div className="text-3xl font-black text-rose-700">{stats?.employees_not_logged_in || 0}</div>
            <div className="text-xs font-black text-rose-900 uppercase tracking-wider mt-0.5">Not Logged In</div>
            <div className="text-[10px] text-rose-700 font-bold">Pending Check-in</div>
            {activeStatusFilter === 'not_logged_in' && (
              <span className="mt-1 inline-flex items-center text-[10px] font-black text-rose-800">
                <Check className="h-3 w-3 mr-0.5" /> Filtering
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filtered Employee Roster Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Live Employee Roster
              </h3>
              {activeStatusFilter ? (
                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800">
                  Showing: {activeStatusFilter.toUpperCase()} ({filteredEmployees.length} staff)
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                  All 10 Counselors
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live status, station presence, and forwarding routing per counselor
            </p>
          </div>

          {activeStatusFilter && (
            <button
              onClick={() => setActiveStatusFilter(null)}
              className="text-xs font-bold text-orange-600 hover:text-orange-800 underline"
            >
              Reset Filter (Show All)
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-black text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Counselor Name</th>
                <th className="px-5 py-3.5">Live Presence</th>
                <th className="px-5 py-3.5">Status Message</th>
                <th className="px-5 py-3.5">Forwarding Line</th>
                <th className="px-5 py-3.5">Ext</th>
                <th className="px-5 py-3.5 text-right">Inspect Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs font-bold text-slate-400">
                    No employees currently in "{activeStatusFilter}" status.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/40 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-600">{emp.employee_id}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-black text-slate-900">{emp.name}</div>
                      <div className="text-[11px] text-slate-400 font-semibold">{emp.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={emp.profile?.current_status || 'offline'} type="employee" />
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">
                      {emp.profile?.status_message || 'Active on station'}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 font-bold">
                      {emp.phone_number || 'Internal Softphone'}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-blue-600 font-bold">
                      #{emp.extension || '201'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/admin/employees/${emp.id}`}
                        className="inline-flex items-center space-x-1 rounded-xl bg-blue-50 px-3 py-1.5 font-bold text-blue-700 hover:bg-blue-100 transition"
                      >
                        <span>Profile</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
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
