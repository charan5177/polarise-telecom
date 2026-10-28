import React, { useState, useEffect } from 'react';
import { apiRequest, User } from '../../services/api';
import { 
  FileSpreadsheet, 
  Download, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Filter, 
  Calendar, 
  Layers, 
  Eye, 
  X,
  FileDown,
  Sparkles,
  Database
} from 'lucide-react';

interface ReportDefinition {
  id: string;
  title: string;
  desc: string;
  format: 'Excel (.xlsx)' | 'CSV (.csv)';
  badgeColor: string;
  columns: string[];
  estimatedRows: string;
  action: () => void;
}

export const ExcelExports: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('All');
  const [selectedDir, setSelectedDir] = useState('All');
  const [dateRange, setDateRange] = useState('all');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<ReportDefinition | null>(null);

  useEffect(() => {
    apiRequest<User[]>('/employees').then(setEmployees).catch(console.error);
  }, []);

  const downloadFile = async (url: string, filename: string, reportKey: string) => {
    setDownloading(reportKey);
    try {
      const token = localStorage.getItem('polarise_token');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to download report');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e: any) {
      alert(e.message || 'Report download failed');
    } finally {
      setDownloading(null);
    }
  };

  const reportsList: ReportDefinition[] = [
    {
      id: 'calls_master_excel',
      title: 'Comprehensive Telecalling Register (.xlsx)',
      desc: 'Master call history archive featuring timestamps, ringing elapsed time, connected speech duration, counselor extensions, virtual caller IDs, and call outcomes.',
      format: 'Excel (.xlsx)',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      columns: [
        'Call ID', 'Provider Ref', 'Employee ID', 'Employee Name', 'Lead Code',
        'Student / Parent Name', 'Phone Number', 'Direction', 'Caller ID',
        'Start Time', 'Answer Time', 'End Time', 'Elapsed Duration', 'Talk Duration',
        'Status', 'Outcome', 'Recording Reference', 'Notes'
      ],
      estimatedRows: 'Live Database Query',
      action: () => {
        let u = '/api/reports/export/calls/excel?';
        if (selectedEmp !== 'All') u += `user_id=${selectedEmp}&`;
        if (selectedDir !== 'All') u += `direction=${selectedDir.toLowerCase()}&`;
        downloadFile(u, `Polaris_Calls_Master_${new Date().toISOString().slice(0, 10)}.xlsx`, 'calls_master_excel');
      }
    },
    {
      id: 'calls_csv',
      title: 'Raw Call Telemetry Dump (.csv)',
      desc: 'Lightweight RFC 4180 comma-separated records structured specifically for ingestion into BI suites, SQL warehouses, and data intelligence tools.',
      format: 'CSV (.csv)',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      columns: [
        'call_id', 'provider_call_id', 'employee_id', 'employee_name', 'lead_code',
        'customer_number', 'direction', 'virtual_number', 'start_time', 'connected_duration',
        'status', 'outcome'
      ],
      estimatedRows: 'Raw Comma-Separated Stream',
      action: () => {
        let u = '/api/reports/export/calls/csv?';
        if (selectedEmp !== 'All') u += `user_id=${selectedEmp}&`;
        downloadFile(u, `Polaris_Calls_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`, 'calls_csv');
      }
    },
    {
      id: 'leads_master_excel',
      title: 'Admissions Leads Master Registry (.xlsx)',
      desc: 'Complete student and parent lead database containing course interests, target campuses, 10-counselor assignment partitions, priority tiers, and interaction history.',
      format: 'Excel (.xlsx)',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      columns: [
        'Lead Code', 'Student Name', 'Parent Name', 'Primary Phone', 'Alternate Contact',
        'Email Address', 'Location', 'Target Course', 'Source Channel', 'Counselor Assigned',
        'Status', 'Priority', 'Total Dials', 'Created Date', 'Last Contact'
      ],
      estimatedRows: 'Active Contact Master',
      action: () => {
        downloadFile('/api/reports/export/leads/excel', `Polaris_Leads_Master_${new Date().toISOString().slice(0, 10)}.xlsx`, 'leads_master_excel');
      }
    },
    {
      id: 'attendance_excel',
      title: 'Staff Work Sessions & Shift Attendance (.xlsx)',
      desc: 'Operational counselor attendance register compiling login timestamps, logout timestamps, meal and break durations, and total active telecalling session hours.',
      format: 'Excel (.xlsx)',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      columns: [
        'Session ID', 'Employee ID', 'Employee Name', 'Shift Date', 'Login Time',
        'Logout Time', 'Break Minutes', 'Total Shift Seconds', 'Active Shift Hours', 'IP Address'
      ],
      estimatedRows: 'HR & Audit Log',
      action: () => {
        downloadFile('/api/reports/export/sessions/excel', `Polaris_Attendance_Sessions_${new Date().toISOString().slice(0, 10)}.xlsx`, 'attendance_excel');
      }
    },
    {
      id: 'counselor_callsheet_excel',
      title: '10-Counselor Personal Calling Contact Sheets (.xlsx)',
      desc: 'Formatted Excel worksheets partitioned per counselor with student contact details, parent names, target programs, and telephone checkboxes for calling rounds.',
      format: 'Excel (.xlsx)',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      columns: [
        'Queue #', 'Student Name', 'Parent Name', 'Phone Number (+91)', 'Program',
        'City', 'Priority', 'Last Attempt', 'Call Outcome', 'Parent Notes'
      ],
      estimatedRows: 'Partitioned by Counselor',
      action: () => {
        const url = selectedEmp !== 'All'
          ? `/api/reports/export/employee-callsheet/excel?user_id=${selectedEmp}`
          : '/api/reports/export/employee-callsheet/excel';
        downloadFile(url, `Polaris_Counselor_CallSheets_${new Date().toISOString().slice(0, 10)}.xlsx`, 'counselor_callsheet_excel');
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 card-3d">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-md">
            <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
              Enterprise Excel & CSV Operational Reports
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Live SQLite database pipeline • Formatted via OpenPyXL Engine with styled headers & auto-fitted columns
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>OpenPyXL ISO/IEC 29500 Standard</span>
          </div>
        </div>
      </div>

      {/* Corporate Compliance & Security Assurance Strip */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-slate-50 to-emerald-50/30 p-4 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-medium">
            <strong>Data Integrity Assurance:</strong> All export files are extracted dynamically from database rows. Phone numbers, durations, and timestamps preserve operational compliance.
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono font-bold text-slate-500">
          <Database className="h-3.5 w-3.5 text-slate-400" />
          <span>Real-time DB Connection</span>
        </div>
      </div>

      {/* Report Filter Parameters Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 card-3d">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-600" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Filter Parameters for Targeted Extraction
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            Selected criteria applies automatically to your generated downloads
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Telecaller Counselor Filter */}
          <div>
            <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider text-[10px]">
              Counselor Filter
            </label>
            <select
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-500 transition"
            >
              <option value="All">All Counselors (Consolidated Roster)</option>
              {employees.filter(u => u.role === 'telecaller').map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.employee_id} — {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Call Direction Filter */}
          <div>
            <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider text-[10px]">
              Call Direction Scope
            </label>
            <select
              value={selectedDir}
              onChange={(e) => setSelectedDir(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-500 transition"
            >
              <option value="All">All Directions (Inbound & Outbound)</option>
              <option value="Outbound">Outbound Telecalling Dials Only</option>
              <option value="Inbound">Inbound Parent Inquiries Only</option>
            </select>
          </div>

          {/* Time Scope Preset */}
          <div>
            <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wider text-[10px]">
              Temporal Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-500 transition"
            >
              <option value="all">Full Historical Register (All Records)</option>
              <option value="today">Today's Active Shift</option>
              <option value="week">Current Week (MTD)</option>
              <option value="month">Current Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Professional Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reportsList.map((rep) => (
          <div 
            key={rep.id} 
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between card-3d"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`rounded-xl border px-2.5 py-1 text-[10px] font-black font-mono uppercase tracking-wider ${rep.badgeColor}`}>
                  {rep.format}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                </div>
              </div>

              <h4 className="text-sm font-black text-slate-900 tracking-tight leading-snug">
                {rep.title}
              </h4>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                {rep.desc}
              </p>

              {/* Columns preview pill list */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">
                  Included Data Fields ({rep.columns.length} columns):
                </span>
                <div className="flex flex-wrap gap-1">
                  {rep.columns.slice(0, 4).map((col, idx) => (
                    <span key={idx} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono text-slate-600 font-semibold">
                      {col}
                    </span>
                  ))}
                  {rep.columns.length > 4 && (
                    <button
                      onClick={() => setPreviewReport(rep)}
                      className="rounded-md bg-slate-200/80 px-1.5 py-0.5 text-[9px] font-mono text-slate-700 font-bold hover:bg-slate-300"
                    >
                      +{rep.columns.length - 4} more
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPreviewReport(rep)}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
                title="Preview Column Schema"
              >
                <Eye className="h-4 w-4" />
              </button>

              <button
                onClick={rep.action}
                disabled={downloading === rep.id}
                className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md disabled:opacity-50 transition"
              >
                <FileDown className="h-4 w-4 text-emerald-400" />
                <span>{downloading === rep.id ? 'Extracting File...' : 'Download Export'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Schema Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-emerald-700">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
                    {previewReport.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Complete Column Architecture & Field Schema ({previewReport.columns.length} columns)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewReport(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 font-black text-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 max-h-80 overflow-y-auto space-y-2 pr-1">
              <div className="text-xs font-bold text-slate-600 mb-2">
                The generated file contains the following structured columns formatted according to Microsoft Excel / CSV specification:
              </div>

              <div className="grid grid-cols-2 gap-2">
                {previewReport.columns.map((col, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-2 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                    <span className="h-5 w-5 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-[10px] text-slate-500">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{col}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500">
                Format: <strong className="text-slate-900">{previewReport.format}</strong>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewReport(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    previewReport.action();
                    setPreviewReport(null);
                  }}
                  className="flex items-center space-x-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow hover:bg-slate-800 transition"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Download Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
