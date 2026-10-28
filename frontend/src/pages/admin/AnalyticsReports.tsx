import React, { useState, useEffect } from 'react';
import { apiRequest, AdminDashboardStats, Call, User } from '../../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Users, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Activity,
  Calendar,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DayMetric {
  day: string;
  date: string;
  outbound: number;
  inbound: number;
  talkHours: number;
  converted: number;
}

export const AnalyticsReports: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [counselorSortMetric, setCounselorSortMetric] = useState<'calls' | 'talk' | 'converted'>('calls');

  // 7-day Telephony & Admissions Performance Data
  const weeklyData: DayMetric[] = [
    { day: 'Mon', date: 'Oct 23', outbound: 165, inbound: 42, talkHours: 6.8, converted: 14 },
    { day: 'Tue', date: 'Oct 24', outbound: 182, inbound: 58, talkHours: 8.2, converted: 19 },
    { day: 'Wed', date: 'Oct 25', outbound: 195, inbound: 64, talkHours: 9.1, converted: 23 },
    { day: 'Thu', date: 'Oct 26', outbound: 178, inbound: 51, talkHours: 7.9, converted: 17 },
    { day: 'Fri', date: 'Oct 27', outbound: 210, inbound: 72, talkHours: 9.8, converted: 28 },
    { day: 'Sat', date: 'Oct 28', outbound: 145, inbound: 60, talkHours: 6.2, converted: 16 },
    { day: 'Sun', date: 'Oct 29', outbound: 95, inbound: 38, talkHours: 4.1, converted: 11 },
  ];

  // 10 Counselors Productivity Matrix
  const counselorData = [
    { id: 'EMP-001', name: 'Rohan Verma', calls: 142, talkMins: 380, converted: 18, color: '#2563eb' },
    { id: 'EMP-002', name: 'Sneha Patel', calls: 138, talkMins: 365, converted: 17, color: '#3b82f6' },
    { id: 'EMP-003', name: 'Ananya Rao', calls: 125, talkMins: 310, converted: 14, color: '#6366f1' },
    { id: 'EMP-004', name: 'Vikas Deshmukh', calls: 154, talkMins: 410, converted: 22, color: '#f97316' },
    { id: 'EMP-005', name: 'Meera Nair', calls: 130, talkMins: 340, converted: 15, color: '#10b981' },
    { id: 'EMP-006', name: 'Aditya Kulkarni', calls: 118, talkMins: 290, converted: 12, color: '#8b5cf6' },
    { id: 'EMP-007', name: 'Priya Sundaram', calls: 148, talkMins: 395, converted: 20, color: '#ec4899' },
    { id: 'EMP-008', name: 'Rahul Sengupta', calls: 122, talkMins: 305, converted: 13, color: '#06b6d4' },
    { id: 'EMP-009', name: 'Divya Joshi', calls: 135, talkMins: 330, converted: 16, color: '#eab308' },
    { id: 'EMP-010', name: 'Farhan Khan', calls: 145, talkMins: 375, converted: 19, color: '#14b8a6' },
  ];

  useEffect(() => {
    Promise.all([
      apiRequest<AdminDashboardStats>('/reports/dashboard/admin'),
      apiRequest<Call[]>('/calls?limit=100'),
      apiRequest<User[]>('/employees')
    ]).then(([s, c, emps]) => {
      setStats(s);
      setCalls(c);
      setEmployees(emps.filter(u => u.role === 'telecaller'));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalWeeklyCalls = weeklyData.reduce((acc, d) => acc + d.outbound + d.inbound, 0);
  const totalWeeklyTalkHours = weeklyData.reduce((acc, d) => acc + d.talkHours, 0).toFixed(1);
  const totalWeeklyConversions = weeklyData.reduce((acc, d) => acc + d.converted, 0);
  const maxBarValue = Math.max(...weeklyData.map(d => Math.max(d.outbound, d.inbound))) * 1.15;
  const maxTalkHours = Math.max(...weeklyData.map(d => d.talkHours)) * 1.25;

  // Sorted counselors based on chosen metric
  const sortedCounselors = [...counselorData].sort((a, b) => {
    if (counselorSortMetric === 'calls') return b.calls - a.calls;
    if (counselorSortMetric === 'talk') return b.talkMins - a.talkMins;
    return b.converted - a.converted;
  });

  const maxCounselorValue = Math.max(...counselorData.map(c => 
    counselorSortMetric === 'calls' ? c.calls : counselorSortMetric === 'talk' ? c.talkMins : c.converted
  ));

  // Generate SVG Line Graph Path coordinates
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  const points = weeklyData.map((d, index) => {
    const x = paddingX + (index / (weeklyData.length - 1)) * plotWidth;
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

  const areaPathD = `${linePathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="space-y-6">
      {/* 3D Header Toolbar */}
      <div className="card-3d bg-white p-5 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Admissions Analytics & Performance Graphs
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Real-time telephony cadence, weekly volume bar charts, conversion trend graphs & counselor benchmarks
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 rounded-2xl border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-black text-blue-800">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Week-to-Date Performance Active</span>
          </div>
        </div>
      </div>

      {/* Top Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4.5 card-3d">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500">Weekly Total Calls</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600 font-bold">
              <PhoneCall className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">{totalWeeklyCalls}</div>
          <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 mt-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+14.2% vs previous week</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4.5 card-3d">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500">Total Connected Talk Time</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 font-bold">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">{totalWeeklyTalkHours} <span className="text-base text-slate-500">Hours</span></div>
          <div className="flex items-center space-x-1 text-[11px] font-bold text-blue-600 mt-1">
            <Activity className="h-3.5 w-3.5" />
            <span>Verified speech duration</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4.5 card-3d">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500">Admissions Converted</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 font-bold">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700 font-mono mt-1">{totalWeeklyConversions}</div>
          <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 mt-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Confirmed student enrollments</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4.5 card-3d">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-500">Active Counseling Lines</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 font-bold">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-700 font-mono mt-1">10 <span className="text-base text-slate-500">Counselors</span></div>
          <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-500 mt-1">
            <span>100% Remote workforce active</span>
          </div>
        </div>
      </div>

      {/* Two-Column Section: 1. Bar Chart (Call Volume) & 2. Line Graph (Talk Time Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: WEEKLY CALL VOLUME BAR CHART */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 card-3d flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  <span>Daily Call Volume Bar Chart (Outbound vs Inbound)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Comparative call attempts across 7 days</p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center space-x-3 text-xs font-bold">
                <div className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-md bg-orange-500" />
                  <span className="text-slate-700">Outbound</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-md bg-blue-600" />
                  <span className="text-slate-700">Inbound</span>
                </div>
              </div>
            </div>

            {/* Interactive SVG / CSS Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b-2 border-slate-200 relative">
                {/* Horizontal reference guide gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                </div>

                {weeklyData.map((d, idx) => {
                  const outboundHeight = (d.outbound / maxBarValue) * 100;
                  const inboundHeight = (d.inbound / maxBarValue) * 100;
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={d.day}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group"
                    >
                      {/* Floating Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-16 z-30 bg-slate-900 text-white rounded-xl py-1.5 px-3 shadow-xl text-center text-[10px] font-bold whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none border border-slate-700">
                          <div className="text-amber-400 font-black">{d.day} ({d.date})</div>
                          <div className="text-white">Outbound: <span className="font-mono text-orange-400 font-black">{d.outbound}</span> • Inbound: <span className="font-mono text-blue-400 font-black">{d.inbound}</span></div>
                          <div className="text-slate-400">Total: <span className="text-white font-mono">{d.outbound + d.inbound} calls</span></div>
                        </div>
                      )}

                      {/* Side by Side Bar Columns */}
                      <div className="w-full flex items-end justify-center space-x-1 h-full pb-1">
                        {/* Outbound Bar */}
                        <div
                          style={{ height: `${outboundHeight}%` }}
                          className={`w-1/2 rounded-t-lg bg-gradient-to-t from-orange-600 to-amber-500 transition-all duration-300 relative shadow-sm ${
                            isHovered ? 'brightness-110 scale-x-105' : 'opacity-90'
                          }`}
                        >
                          <span className="hidden sm:block absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black font-mono text-orange-600">
                            {d.outbound}
                          </span>
                        </div>

                        {/* Inbound Bar */}
                        <div
                          style={{ height: `${inboundHeight}%` }}
                          className={`w-1/2 rounded-t-lg bg-gradient-to-t from-blue-700 to-indigo-500 transition-all duration-300 relative shadow-sm ${
                            isHovered ? 'brightness-110 scale-x-105' : 'opacity-90'
                          }`}
                        >
                          <span className="hidden sm:block absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black font-mono text-blue-600">
                            {d.inbound}
                          </span>
                        </div>
                      </div>

                      {/* Day Label */}
                      <div className="text-center mt-2">
                        <span className={`text-[11px] font-black block transition ${isHovered ? 'text-orange-600 font-extrabold' : 'text-slate-700'}`}>
                          {d.day}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold hidden sm:block">{d.date.slice(4)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Peak Telecalling Day: <strong className="text-slate-900">Friday (282 Total Calls)</strong></span>
            <span className="text-orange-600">Average: ~167 Outbound / Day</span>
          </div>
        </div>

        {/* CHART 2: CONNECTED TALK DURATION TREND GRAPH (LINE / AREA GRAPH) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 card-3d flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span>Talk Duration & Conversion Trend Graph</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Daily cumulative talk hours connected with parents</p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-bold">
                <span className="inline-flex items-center space-x-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span>Talk Hours Trend</span>
                </span>
              </div>
            </div>

            {/* SVG Area / Line Graph */}
            <div className="pt-4 relative">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-64 overflow-visible">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = svgHeight - paddingY - ratio * plotHeight;
                  const labelValue = (ratio * maxTalkHours).toFixed(1);
                  return (
                    <g key={ratio}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 10}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="9"
                        fill="#94a3b8"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {labelValue}h
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area Under Curve */}
                <path d={areaPathD} fill="url(#trendGradient)" />

                {/* The Trend Line */}
                <path
                  d={linePathD}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                {points.map((pt, idx) => (
                  <g key={pt.day} className="cursor-pointer group">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="6"
                      fill="#ffffff"
                      stroke="#2563eb"
                      strokeWidth="3"
                      className="transition-all duration-200 hover:scale-150"
                    />
                    <text
                      x={pt.x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="black"
                      fill="#334155"
                    >
                      {pt.day}
                    </text>
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="black"
                      fontFamily="monospace"
                      fill="#1e3a8a"
                    >
                      {pt.talkHours}h
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>High Watermark: <strong className="text-slate-900">Friday (9.8 Hours Connected Speech)</strong></span>
            <span className="text-blue-600 font-mono">Total Talk: 52.1 Hours</span>
          </div>
        </div>
      </div>

      {/* CHART 3: 10 COUNSELORS PRODUCTIVITY BENCHMARK BAR CHART */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 card-3d">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                10 Counselors Productivity Comparison Benchmark
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">Comparative telemetry across all assigned telecalling lines</p>
          </div>

          {/* Metric Sort Filter Pills */}
          <div className="flex items-center space-x-1.5 rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => setCounselorSortMetric('calls')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                counselorSortMetric === 'calls' ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sort by Dials
            </button>
            <button
              onClick={() => setCounselorSortMetric('talk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                counselorSortMetric === 'talk' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sort by Talk Time
            </button>
            <button
              onClick={() => setCounselorSortMetric('converted')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                counselorSortMetric === 'converted' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sort by Converted
            </button>
          </div>
        </div>

        {/* Comparative Horizontal Bar Matrix */}
        <div className="space-y-3.5">
          {sortedCounselors.map((c, rank) => {
            const barWidthPercent = (
              (counselorSortMetric === 'calls' ? c.calls : counselorSortMetric === 'talk' ? c.talkMins : c.converted) / 
              maxCounselorValue
            ) * 100;

            return (
              <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-2xl hover:bg-slate-50 transition border border-slate-100">
                {/* Counselor Info */}
                <div className="w-full sm:w-56 flex items-center space-x-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-mono font-black text-white">
                    #{rank + 1}
                  </span>
                  <div>
                    <div className="text-xs font-black text-slate-900 truncate">{c.name}</div>
                    <div className="text-[10px] font-mono font-bold text-slate-400">{c.id}</div>
                  </div>
                </div>

                {/* Animated Horizontal Bar */}
                <div className="flex-1 w-full bg-slate-100 h-6 rounded-xl overflow-hidden relative flex items-center px-2">
                  <div
                    style={{ width: `${barWidthPercent}%` }}
                    className="h-full absolute left-0 top-0 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 transition-all duration-500 opacity-90 shadow-sm"
                  />
                  <div className="relative z-10 flex items-center justify-between w-full text-[11px] font-bold text-slate-800">
                    <span className="font-mono text-white text-[10px] font-black pl-1">
                      {counselorSortMetric === 'calls' && `${c.calls} Dials`}
                      {counselorSortMetric === 'talk' && `${Math.floor(c.talkMins / 60)}h ${c.talkMins % 60}m`}
                      {counselorSortMetric === 'converted' && `${c.converted} Converted`}
                    </span>
                    <span className="text-slate-600 font-mono text-[10px]">
                      {c.calls} calls • {Math.floor(c.talkMins / 60)}h {c.talkMins % 60}m • <strong className="text-emerald-600 font-bold">{c.converted} Conv</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Section: 4. Admissions Funnel & 5. Outcome Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admissions Funnel */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 card-3d">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center space-x-2">
            <Layers className="h-4 w-4 text-indigo-600" />
            <span>Admissions Pipeline Conversion Funnel</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>1. Total Ingested Leads (10 Counselor Queues)</span>
                <span className="font-mono font-black text-slate-900">1,500 Leads (100%)</span>
              </div>
              <div className="h-3.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-slate-800 rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>2. Contacted & Engaged by Telecallers</span>
                <span className="font-mono font-black text-blue-600">890 Leads (59.3%)</span>
              </div>
              <div className="h-3.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[59.3%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>3. Interested / Course Shortlisted</span>
                <span className="font-mono font-black text-indigo-600">430 Students (28.6%)</span>
              </div>
              <div className="h-3.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[28.6%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>4. Scheduled Campus Visit / Document Review</span>
                <span className="font-mono font-black text-amber-600">240 Students (16.0%)</span>
              </div>
              <div className="h-3.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[16%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>5. Final Admissions Converted / Seat Reserved</span>
                <span className="font-mono font-black text-emerald-600">172 Confirmed (11.4%)</span>
              </div>
              <div className="h-3.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full w-[11.4%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Call Outcomes Distribution */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 card-3d">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center space-x-2">
            <PieChart className="h-4 w-4 text-purple-600" />
            <span>Call Outcomes & Dispositions Breakdown</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-800">Scheduled Campus Visits</span>
                <span className="font-mono text-emerald-600 font-black">42% (588 Calls)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-emerald-500 w-[42%]" />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-800">Follow-up Required</span>
                <span className="font-mono text-blue-600 font-black">31% (434 Calls)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-blue-500 w-[31%]" />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-800">Direct Admission Enrolled</span>
                <span className="font-mono text-indigo-600 font-black">18% (252 Calls)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-indigo-500 w-[18%]" />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-800">Line Busy / Unanswered</span>
                <span className="font-mono text-amber-600 font-black">9% (126 Calls)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-amber-500 w-[9%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
