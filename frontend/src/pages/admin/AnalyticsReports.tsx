import React, { useState, useEffect } from 'react';
import { apiRequest, AdminDashboardStats, Call, User, Lead } from '../../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Activity,
  Calendar,
  Sparkles,
  PhoneIncoming,
  PhoneOutgoing,
  FolderKanban,
  Eye,
  X
} from 'lucide-react';

export type TimeframeType = 'daily' | 'weekly' | 'monthly';

interface PerformanceMetric {
  id: string;
  label: string;
  sublabel: string;
  startDate: Date;
  endDate: Date;
  outbound: number;
  inbound: number;
  talkHours: number;
  converted: number;
  colorGradient: string;
  inboundColorGradient: string;
  dotColor: string;
}

export const AnalyticsReports: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<TimeframeType>('daily');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetric | null>(null);
  const [counselorSortMetric, setCounselorSortMetric] = useState<'calls' | 'talk' | 'converted'>('calls');

  // Palette array for distinct bar colors
  const colorPalettes = [
    { out: 'from-orange-500 to-amber-500', in: 'from-amber-400 to-yellow-300', dot: '#f97316' },
    { out: 'from-blue-600 to-indigo-500', in: 'from-sky-400 to-cyan-300', dot: '#2563eb' },
    { out: 'from-emerald-600 to-teal-500', in: 'from-teal-400 to-emerald-300', dot: '#059669' },
    { out: 'from-purple-600 to-fuchsia-500', in: 'from-fuchsia-400 to-pink-300', dot: '#9333ea' },
    { out: 'from-rose-600 to-pink-500', in: 'from-pink-400 to-rose-300', dot: '#e11d48' },
    { out: 'from-amber-600 to-yellow-500', in: 'from-yellow-400 to-amber-300', dot: '#d97706' },
    { out: 'from-cyan-600 to-teal-500', in: 'from-teal-400 to-cyan-300', dot: '#0891b2' },
  ];

  useEffect(() => {
    Promise.all([
      apiRequest<AdminDashboardStats>('/reports/dashboard/admin'),
      apiRequest<Call[]>('/calls?limit=500'),
      apiRequest<Lead[]>('/leads'),
      apiRequest<User[]>('/employees')
    ]).then(([s, c, l, emps]) => {
      setStats(s);
      setCalls(c);
      setLeads(l);
      setEmployees(emps.filter(u => u.role === 'telecaller'));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Compute Day-wise metrics (Past 7 Days calculated from actual DB)
  const computeDailyMetrics = (): PerformanceMetric[] => {
    const today = new Date();
    const days: PerformanceMetric[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayCalls = calls.filter(c => {
        const cDate = new Date(c.start_time);
        return cDate >= startOfDay && cDate <= endOfDay;
      });

      const dayLeadsConverted = leads.filter(l => {
        if (l.status !== 'Converted') return false;
        const lDate = new Date(l.updated_at || l.created_at);
        return lDate >= startOfDay && lDate <= endOfDay;
      }).length;

      const outbound = dayCalls.filter(c => c.direction === 'outbound').length;
      const inbound = dayCalls.filter(c => c.direction === 'inbound').length;
      const talkSec = dayCalls.reduce((sum, c) => sum + (c.connected_duration || 0), 0);
      const talkHours = Number((talkSec / 3600).toFixed(1));

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const palette = colorPalettes[(6 - i) % colorPalettes.length];

      days.push({
        id: `day-${i}`,
        label: dayNames[d.getDay()],
        sublabel: `${monthNames[d.getMonth()]} ${d.getDate()}`,
        startDate: startOfDay,
        endDate: endOfDay,
        outbound,
        inbound,
        talkHours,
        converted: dayLeadsConverted,
        colorGradient: palette.out,
        inboundColorGradient: palette.in,
        dotColor: palette.dot,
      });
    }

    return days;
  };

  // Compute Weekly metrics (Weeks of the current month from actual DB)
  const computeWeeklyMetrics = (): PerformanceMetric[] => {
    const today = new Date();
    const weeks: PerformanceMetric[] = [];
    const weekLabels = [
      { label: 'Week 1', sub: '1st - 7th', s: 1, e: 7 },
      { label: 'Week 2', sub: '8th - 14th', s: 8, e: 14 },
      { label: 'Week 3', sub: '15th - 21st', s: 15, e: 21 },
      { label: 'Week 4', sub: '22nd - End', s: 22, e: 31 },
    ];

    weekLabels.forEach((w, idx) => {
      const start = new Date(today.getFullYear(), today.getMonth(), w.s, 0, 0, 0);
      const end = new Date(today.getFullYear(), today.getMonth(), w.e, 23, 59, 59);

      const weekCalls = calls.filter(c => {
        const cDate = new Date(c.start_time);
        return cDate >= start && cDate <= end;
      });

      const weekLeadsConverted = leads.filter(l => {
        if (l.status !== 'Converted') return false;
        const lDate = new Date(l.updated_at || l.created_at);
        return lDate >= start && lDate <= end;
      }).length;

      const outbound = weekCalls.filter(c => c.direction === 'outbound').length;
      const inbound = weekCalls.filter(c => c.direction === 'inbound').length;
      const talkSec = weekCalls.reduce((sum, c) => sum + (c.connected_duration || 0), 0);
      const talkHours = Number((talkSec / 3600).toFixed(1));
      const palette = colorPalettes[idx % colorPalettes.length];

      weeks.push({
        id: `week-${idx}`,
        label: w.label,
        sublabel: w.sub,
        startDate: start,
        endDate: end,
        outbound,
        inbound,
        talkHours,
        converted: weekLeadsConverted,
        colorGradient: palette.out,
        inboundColorGradient: palette.in,
        dotColor: palette.dot,
      });
    });

    return weeks;
  };

  // Compute Monthly metrics (Past 6 months from actual DB)
  const computeMonthlyMetrics = (): PerformanceMetric[] => {
    const today = new Date();
    const months: PerformanceMetric[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthCalls = calls.filter(c => {
        const cDate = new Date(c.start_time);
        return cDate >= start && cDate <= end;
      });

      const monthLeadsConverted = leads.filter(l => {
        if (l.status !== 'Converted') return false;
        const lDate = new Date(l.updated_at || l.created_at);
        return lDate >= start && lDate <= end;
      }).length;

      const outbound = monthCalls.filter(c => c.direction === 'outbound').length;
      const inbound = monthCalls.filter(c => c.direction === 'inbound').length;
      const talkSec = monthCalls.reduce((sum, c) => sum + (c.connected_duration || 0), 0);
      const talkHours = Number((talkSec / 3600).toFixed(1));
      const palette = colorPalettes[(5 - i) % colorPalettes.length];

      months.push({
        id: `month-${i}`,
        label: monthNames[d.getMonth()],
        sublabel: `${d.getFullYear()}`,
        startDate: start,
        endDate: end,
        outbound,
        inbound,
        talkHours,
        converted: monthLeadsConverted,
        colorGradient: palette.out,
        inboundColorGradient: palette.in,
        dotColor: palette.dot,
      });
    }

    return months;
  };

  const currentDataset = timeframe === 'daily' 
    ? computeDailyMetrics() 
    : timeframe === 'weekly' 
    ? computeWeeklyMetrics() 
    : computeMonthlyMetrics();

  // Aggregate stats across current dataset
  const totalPeriodCalls = currentDataset.reduce((acc, d) => acc + d.outbound + d.inbound, 0);
  const totalOutbound = currentDataset.reduce((acc, d) => acc + d.outbound, 0);
  const totalInbound = currentDataset.reduce((acc, d) => acc + d.inbound, 0);
  const totalTalkHours = currentDataset.reduce((acc, d) => acc + d.talkHours, 0).toFixed(1);
  const totalConversions = currentDataset.reduce((acc, d) => acc + d.converted, 0);
  const conversionRate = totalPeriodCalls > 0 ? ((totalConversions / totalPeriodCalls) * 100).toFixed(1) : '0';

  // Calculate highest bar value for chart scaling (minimum 5 to keep axes clean)
  const maxRawBarValue = Math.max(...currentDataset.map(d => Math.max(d.outbound, d.inbound)));
  const maxBarValue = maxRawBarValue > 0 ? maxRawBarValue * 1.25 : 10;

  const maxRawTalkHours = Math.max(...currentDataset.map(d => d.talkHours));
  const maxTalkHours = maxRawTalkHours > 0 ? maxRawTalkHours * 1.35 : 5;

  // Real 10 Counselors Productivity Matrix computed from actual DB records
  const counselorData = employees.map((emp, index) => {
    const empCalls = calls.filter(c => c.user_id === emp.id);
    const empDials = empCalls.length;
    const talkSec = empCalls.reduce((sum, c) => sum + (c.connected_duration || 0), 0);
    const empTalkMins = Math.round(talkSec / 60);
    const empConverted = leads.filter(l => l.assigned_user_id === emp.id && l.status === 'Converted').length;

    const colors = [
      '#f97316', '#2563eb', '#10b981', '#8b5cf6', '#ec4899',
      '#06b6d4', '#eab308', '#14b8a6', '#6366f1', '#f43f5e'
    ];

    return {
      id: emp.employee_id,
      name: emp.name,
      calls: empDials,
      talkMins: empTalkMins,
      converted: empConverted,
      color: colors[index % colors.length]
    };
  });

  const sortedCounselors = [...counselorData].sort((a, b) => {
    if (counselorSortMetric === 'calls') return b.calls - a.calls;
    if (counselorSortMetric === 'talk') return b.talkMins - a.talkMins;
    return b.converted - a.converted;
  });

  const maxRawCounselorValue = Math.max(0, ...counselorData.map(c => 
    counselorSortMetric === 'calls' ? c.calls : counselorSortMetric === 'talk' ? c.talkMins : c.converted
  ));
  const maxCounselorValue = maxRawCounselorValue > 0 ? maxRawCounselorValue : 10;

  // SVG Line Graph Coordinate Calculations
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 30;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  const points = currentDataset.map((d, index) => {
    const x = paddingX + (index / (currentDataset.length - 1 || 1)) * plotWidth;
    const y = svgHeight - paddingY - (d.talkHours / maxTalkHours) * plotHeight;
    return { x, y, ...d };
  });

  const linePathD = points.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[idx - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaPathD = points.length > 0
    ? `${linePathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : '';

  // Get real calls filtered by the clicked inspection period
  const inspectedCalls = selectedMetric
    ? calls.filter(c => {
        const cDate = new Date(c.start_time);
        return cDate >= selectedMetric.startDate && cDate <= selectedMetric.endDate;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="card-3d bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-800 to-emerald-600 text-white shadow-md">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Admissions Telephony Analytics & Visual Reports
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Genuine Database Records • Day-wise, Weekly & Monthly Telemetry
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Timeframe Selector Tabs */}
        <div className="flex items-center space-x-1.5 rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5 shadow-sm">
          <button
            onClick={() => {
              setTimeframe('daily');
              setSelectedMetric(null);
            }}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
              timeframe === 'daily'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Day-wise (Daily)</span>
          </button>

          <button
            onClick={() => {
              setTimeframe('weekly');
              setSelectedMetric(null);
            }}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
              timeframe === 'weekly'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Weekly (4 Weeks)</span>
          </button>

          <button
            onClick={() => {
              setTimeframe('monthly');
              setSelectedMetric(null);
            }}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
              timeframe === 'monthly'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Monthly (6 Mo)</span>
          </button>
        </div>
      </div>

      {/* Top Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4.5 card-3d shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500">
              {timeframe === 'daily' ? '7-Day' : timeframe === 'weekly' ? 'Monthly' : 'Half-Year'} Total Dials
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600 font-bold">
              <PhoneCall className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">{totalPeriodCalls}</div>
          <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-600 mt-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
            <span>Outbound: {totalOutbound} | Inbound: {totalInbound}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4.5 card-3d shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500">Connected Speech Time</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 font-bold">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">{totalTalkHours} hrs</div>
          <div className="text-[11px] font-bold text-slate-500 mt-1">
            Real logged talk duration from call history
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4.5 card-3d shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500">Admissions Closed</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 font-bold">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 font-mono mt-1">{totalConversions}</div>
          <div className="text-[11px] font-bold text-emerald-700 mt-1">
            Conversion Rate: {conversionRate}%
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4.5 card-3d shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500">Active Staff</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-600 font-bold">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">{employees.length} Staff</div>
          <div className="text-[11px] font-bold text-slate-500 mt-1">
            10 Counselors Assigned
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Multi-Colored Bar Chart & Multi-Colored Trend Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. MULTI-COLORED BAR CHART: Call Volume (Outbound vs Inbound in Different Colors) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 card-3d flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    {timeframe === 'daily' ? 'Daily' : timeframe === 'weekly' ? 'Weekly' : 'Monthly'} Call Volume Bar Chart
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Click on any bar to inspect exact calls logged for that period
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-3 text-xs font-bold">
                <div className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-sm bg-gradient-to-t from-orange-500 to-amber-500" />
                  <span className="text-slate-700">Outbound</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-sm bg-gradient-to-t from-amber-300 to-yellow-200" />
                  <span className="text-slate-700">Inbound</span>
                </div>
              </div>
            </div>

            {/* Interactive Grouped Multi-Colored Bar Chart */}
            <div className="relative mt-6 pt-2 pb-2">
              <div className="h-64 flex items-end justify-between gap-2 sm:gap-3 px-2 border-b-2 border-slate-200 relative">
                
                {/* Horizontal reference lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                </div>

                {currentDataset.map((item, idx) => {
                  const outHeightPct = Math.max(4, Math.round((item.outbound / maxBarValue) * 100));
                  const inHeightPct = Math.max(4, Math.round((item.inbound / maxBarValue) * 100));
                  const isHovered = hoveredBarIndex === idx;
                  const isSelected = selectedMetric?.id === item.id;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      onClick={() => setSelectedMetric(item)}
                    >
                      {/* Hover Tooltip Popup */}
                      {isHovered && (
                        <div className="absolute -top-16 z-20 rounded-xl bg-slate-900 text-white px-3 py-1.5 text-xs shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95">
                          <div className="font-black text-amber-300">{item.label} ({item.sublabel})</div>
                          <div className="text-[11px] font-mono">
                            Outbound: <span className="text-orange-300 font-bold">{item.outbound}</span> • Inbound: <span className="text-sky-300 font-bold">{item.inbound}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Click to inspect period calls</div>
                        </div>
                      )}

                      {/* Side-by-side vertical bars with distinct color gradients per column */}
                      <div className={`w-full flex items-end justify-center space-x-1 sm:space-x-1.5 h-full pb-1 rounded-t-xl transition-all ${
                        isSelected ? 'ring-2 ring-orange-500 bg-orange-50/50' : ''
                      }`}>
                        {/* Outbound Bar (Unique column color) */}
                        <div
                          style={{ height: `${outHeightPct}%` }}
                          className={`w-1/2 rounded-t-md bg-gradient-to-t ${item.colorGradient} transition-all duration-300 shadow-sm ${
                            isHovered ? 'brightness-125 scale-y-105' : ''
                          }`}
                        />
                        {/* Inbound Bar (Complementary lighter column color) */}
                        <div
                          style={{ height: `${inHeightPct}%` }}
                          className={`w-1/2 rounded-t-md bg-gradient-to-t ${item.inboundColorGradient} transition-all duration-300 shadow-sm ${
                            isHovered ? 'brightness-125 scale-y-105' : ''
                          }`}
                        />
                      </div>

                      {/* X-axis Label */}
                      <div className="mt-2 text-center">
                        <span className={`block text-[11px] font-black uppercase ${
                          isSelected ? 'text-orange-600' : 'text-slate-800'
                        }`}>
                          {item.label}
                        </span>
                        <span className="block text-[9px] font-mono text-slate-400 font-semibold">{item.sublabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Period Total: <strong className="text-slate-900 font-mono">{totalPeriodCalls} Calls</strong></span>
            <span className="text-orange-600 font-bold">Click any bar to inspect call logs</span>
          </div>
        </div>

        {/* 2. MULTI-COLORED GRAPH: Talk Duration & Conversions Trend Curve */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 card-3d flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    {timeframe === 'daily' ? 'Daily' : timeframe === 'weekly' ? 'Weekly' : 'Monthly'} Speech Duration & Closure Curve
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Multi-colored chromatic trend spline • Connected talk hours & closed admissions
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-bold">
                <div className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-6 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-600" />
                  <span className="text-slate-700">Speech (Hrs)</span>
                </div>
              </div>
            </div>

            {/* SVG Spline Trend Area / Line Graph with Chromatic Gradient */}
            <div className="relative mt-6">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-64 overflow-visible">
                <defs>
                  {/* Chromatic Multi-stop Gradient */}
                  <linearGradient id="chromaWaveGraphGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
                    <stop offset="25%" stopColor="#ec4899" stopOpacity="0.35" />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.40" />
                    <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.45" />
                  </linearGradient>

                  <linearGradient id="chromaStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ea580c" />
                    <stop offset="25%" stopColor="#db2777" />
                    <stop offset="50%" stopColor="#7c3aed" />
                    <stop offset="75%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                {[0.25, 0.5, 0.75, 1].map((pct, idx) => (
                  <line
                    key={idx}
                    x1={paddingX}
                    y1={svgHeight - paddingY - pct * plotHeight}
                    x2={svgWidth - paddingX}
                    y2={svgHeight - paddingY - pct * plotHeight}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Filled Area below spline curve */}
                {areaPathD && <path d={areaPathD} fill="url(#chromaWaveGraphGradient)" />}

                {/* Spline Line Path in Chromatic Gradient */}
                {linePathD && (
                  <path
                    d={linePathD}
                    fill="none"
                    stroke="url(#chromaStrokeGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points with individual column colors */}
                {points.map((pt, idx) => (
                  <g 
                    key={idx} 
                    className="group cursor-pointer"
                    onClick={() => setSelectedMetric(pt)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={selectedMetric?.id === pt.id ? 8 : 6}
                      fill={pt.dotColor}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="transition-all duration-200 group-hover:scale-125 shadow-md"
                    />
                    {/* Tag showing talk hours */}
                    <text
                      x={pt.x}
                      y={pt.y - 12}
                      textAnchor="middle"
                      fill={pt.dotColor}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {pt.talkHours}h
                    </text>
                    {/* Label */}
                    <text
                      x={pt.x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Cumulative Talk: <strong className="text-slate-900 font-mono">{totalTalkHours} Hours</strong></span>
            <span className="text-emerald-600 font-bold">Total Converted: {totalConversions} Admissions</span>
          </div>
        </div>
      </div>

      {/* Interactive Period Telephony Inspection Panel ("if I click on it it should show to me") */}
      {selectedMetric && (
        <div className="rounded-3xl border-2 border-orange-300 bg-white p-6 shadow-xl card-3d animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div 
                style={{ backgroundColor: selectedMetric.dotColor }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow"
              >
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-slate-900 flex items-center space-x-2">
                  <span>Selected Period Telemetry: {selectedMetric.label} ({selectedMetric.sublabel})</span>
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Date Range: {selectedMetric.startDate.toLocaleDateString()} — {selectedMetric.endDate.toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedMetric(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Close inspection drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick period KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <span className="text-[10px] font-black uppercase text-slate-400">Total Dials</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                {selectedMetric.outbound + selectedMetric.inbound}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <span className="text-[10px] font-black uppercase text-slate-400">Outbound Calls</span>
              <div className="text-xl font-black text-orange-600 font-mono mt-0.5">
                {selectedMetric.outbound}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <span className="text-[10px] font-black uppercase text-slate-400">Inbound Queries</span>
              <div className="text-xl font-black text-sky-600 font-mono mt-0.5">
                {selectedMetric.inbound}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <span className="text-[10px] font-black uppercase text-slate-400">Converted Admissions</span>
              <div className="text-xl font-black text-emerald-600 font-mono mt-0.5">
                {selectedMetric.converted}
              </div>
            </div>
          </div>

          {/* Individual Calls in this timeframe */}
          <div className="mt-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              Calls Logged in This Period ({inspectedCalls.length} records)
            </h4>

            {inspectedCalls.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center">
                <PhoneCall className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">
                  No calls logged on {selectedMetric.label} ({selectedMetric.sublabel}) in the database yet.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When counselors place calls or when incoming parent calls ring, they will instantly appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2.5">Call ID</th>
                      <th className="px-3 py-2.5">Counselor</th>
                      <th className="px-3 py-2.5">Customer / Parent Phone</th>
                      <th className="px-3 py-2.5">Type</th>
                      <th className="px-3 py-2.5">Duration</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspectedCalls.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-700">{c.call_sid}</td>
                        <td className="px-3 py-2.5 font-bold text-slate-900">{c.employee_name || 'Staff'}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-800">{c.customer_number}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.direction === 'inbound' ? 'bg-sky-100 text-sky-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {c.direction}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono">{c.connected_duration || 0}s</td>
                        <td className="px-3 py-2.5 font-bold text-slate-700">{c.status}</td>
                        <td className="px-3 py-2.5 text-slate-400 font-mono">{new Date(c.start_time).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. 10-Counselor Comparative Benchmark Bar Chart (Multi-colored per counselor) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 card-3d shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                10-Counselor Comparative Productivity Benchmark
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live ranking computed directly from stored telecalling logs and lead conversions
            </p>
          </div>

          {/* Metric Sort Switcher */}
          <div className="flex items-center space-x-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setCounselorSortMetric('calls')}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                counselorSortMetric === 'calls'
                  ? 'bg-orange-500 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Total Dials
            </button>
            <button
              onClick={() => setCounselorSortMetric('talk')}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                counselorSortMetric === 'talk'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Talk Minutes
            </button>
            <button
              onClick={() => setCounselorSortMetric('converted')}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                counselorSortMetric === 'converted'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admissions Closed
            </button>
          </div>
        </div>

        {/* 10 Ranked Counselor Bars */}
        <div className="space-y-3.5 mt-5">
          {sortedCounselors.map((c, idx) => {
            const val = counselorSortMetric === 'calls' ? c.calls : counselorSortMetric === 'talk' ? c.talkMins : c.converted;
            const pct = Math.max(3, Math.round((val / (maxCounselorValue || 1)) * 100));

            return (
              <div key={c.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-xs font-mono font-black text-slate-400">#{idx + 1}</span>
                <div className="w-36 shrink-0">
                  <div className="text-xs font-black text-slate-900 truncate">{c.name}</div>
                  <div className="text-[10px] font-mono text-slate-400 font-bold">{c.id}</div>
                </div>

                {/* Horizontal Progress Bar in Counselor's Distinct Color */}
                <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
                  <div
                    style={{ width: `${pct}%`, backgroundColor: c.color }}
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 shadow-sm"
                  />
                </div>

                {/* Numeric Metric Value */}
                <div className="w-24 text-right shrink-0">
                  <span className="text-xs font-mono font-black text-slate-900">
                    {val} {counselorSortMetric === 'calls' ? 'calls' : counselorSortMetric === 'talk' ? 'mins' : 'adm'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
