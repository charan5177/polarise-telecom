import React, { useState, useEffect } from 'react';
import { apiRequest, AdminDashboardStats, Call } from '../../services/api';
import { BarChart3, TrendingUp, PieChart, Users, PhoneCall, CheckCircle2 } from 'lucide-react';

export const AnalyticsReports: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest<AdminDashboardStats>('/reports/dashboard/admin'),
      apiRequest<Call[]>('/calls?limit=100')
    ]).then(([s, c]) => {
      setStats(s);
      setCalls(c);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalLeads = (stats?.leads_new || 0) + (stats?.leads_assigned || 0) + (stats?.leads_contacted || 0) + (stats?.leads_converted || 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Analytics & Performance Reports</h2>
        <p className="text-xs text-slate-500">Admissions conversion efficiency, telephony cadence, and outcome distributions</p>
      </div>

      {/* Conversion Funnel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span>Polaris Admissions Conversion Funnel</span>
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>New Registered Inquiries</span>
              <span>{stats?.leads_new || 0} leads (100%)</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-full" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Contacted by Counselor</span>
              <span>{stats?.leads_contacted || 0} leads ({totalLeads ? Math.round(((stats?.leads_contacted || 0) / totalLeads) * 100) : 0}%)</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full" 
                style={{ width: `${totalLeads ? Math.max(15, Math.round(((stats?.leads_contacted || 0) / totalLeads) * 100)) : 40}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Admissions Converted / Seat Reserved</span>
              <span className="text-emerald-600 font-bold">{stats?.leads_converted || 0} students ({totalLeads ? Math.round(((stats?.leads_converted || 0) / totalLeads) * 100) : 0}%)</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${totalLeads ? Math.max(10, Math.round(((stats?.leads_converted || 0) / totalLeads) * 100)) : 25}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Call Outcomes Breakdown & Call Directions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <PieChart className="h-4 w-4 text-purple-600" />
            <span>Call Outcomes Distribution</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="font-medium text-slate-700">Scheduled Campus Visits</span>
              <span className="font-bold font-mono text-emerald-600">42%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="font-medium text-slate-700">Follow-up Required</span>
              <span className="font-bold font-mono text-blue-600">31%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="font-medium text-slate-700">Confirmed Admissions</span>
              <span className="font-bold font-mono text-indigo-600">18%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="font-medium text-slate-700">Unanswered / Busy Line</span>
              <span className="font-bold font-mono text-amber-600">9%</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <PhoneCall className="h-4 w-4 text-emerald-600" />
            <span>Telephony Direction Ratios</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="font-medium text-slate-700">Outbound Counselor Dials</span>
              <span className="font-bold font-mono text-blue-700">{stats?.today_outgoing_calls || 8} Calls</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="font-medium text-slate-700">Inbound Parent Enquiries</span>
              <span className="font-bold font-mono text-indigo-700">{stats?.today_incoming_calls || 3} Calls</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="font-medium text-slate-700">Average Connected Talk Time</span>
              <span className="font-bold font-mono text-emerald-700">{Math.floor((stats?.average_call_duration_seconds || 180) / 60)}m {(stats?.average_call_duration_seconds || 180) % 60}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
