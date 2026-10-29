import React, { useState, useEffect } from 'react';
import { apiRequest, Lead, User } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  FolderKanban, 
  Search, 
  FileSpreadsheet, 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Download, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Sparkles,
  PhoneCall,
  UserCheck
} from 'lucide-react';

export const LeadManagement: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [counselorFilter, setCounselorFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modals
  const [showMultiModal, setShowMultiModal] = useState(false);
  const [showCreateSingleModal, setShowCreateSingleModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [downloadingCallSheet, setDownloadingCallSheet] = useState(false);
  const [selectedExportEmpId, setSelectedExportEmpId] = useState<string>('all');

  // Single Lead Form state
  const [singleLeadForm, setSingleLeadForm] = useState({
    student_name: '',
    parent_name: '',
    phone: '',
    alt_phone: '',
    email: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    course_interest: 'Computer Science & AI Engineering',
    priority: 'High',
    assigned_user_id: '',
    notes: 'Direct new lead registered by admin.'
  });

  // Excel Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [allocationMode, setAllocationMode] = useState<'auto_10' | 'selected' | 'unassigned'>('auto_10');
  const [uploadTargetIds, setUploadTargetIds] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Multiple Leads rows state
  const [batchRows, setBatchRows] = useState([
    { student_name: '', parent_name: '', phone: '', course_interest: 'B.Tech Computer Science', city: 'Bengaluru' },
    { student_name: '', parent_name: '', phone: '', course_interest: 'MBBS Guidance', city: 'Bengaluru' },
    { student_name: '', parent_name: '', phone: '', course_interest: 'MBA Marketing', city: 'Bengaluru' },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const assignedParam = counselorFilter !== 'All' ? `&assigned_user_id=${counselorFilter}` : '';
      const [l, e] = await Promise.all([
        apiRequest<Lead[]>(`/leads?status=${statusFilter}&search=${encodeURIComponent(search)}${assignedParam}`),
        apiRequest<User[]>('/employees')
      ]);
      setLeads(l);
      setEmployees(e.filter(u => u.role === 'telecaller'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [statusFilter, counselorFilter]);

  // Lead selection
  const toggleSelectLead = (id: number) => {
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllCurrentPage = () => {
    const pageIds = paginatedLeads.map(l => l.id);
    const allSelected = pageIds.every(id => selectedLeadIds.includes(id));
    if (allSelected) {
      setSelectedLeadIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedLeadIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectEmployee = (id: number) => {
    setSelectedEmployeeIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllEmployees = () => {
    if (selectedEmployeeIds.length === employees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(employees.map(e => e.id));
    }
  };

  const handleBulkAssign = async () => {
    if (selectedEmployeeIds.length === 0 || selectedLeadIds.length === 0) {
      alert('Please select at least one lead AND at least one counselor to allocate.');
      return;
    }
    try {
      const res = await apiRequest<{ message: string; count: number }>('/leads/bulk-assign', 'POST', {
        lead_ids: selectedLeadIds,
        assigned_to_ids: selectedEmployeeIds,
        notes: `Allocated by Admin across ${selectedEmployeeIds.length} counselors`
      });
      alert(res.message);
      setSelectedLeadIds([]);
      setSelectedEmployeeIds([]);
      fetchData();
    } catch (e: any) {
      alert(e.message || 'Bulk assignment failed');
    }
  };

  // Add Row in Batch Modal
  const addBatchRow = () => {
    setBatchRows([
      ...batchRows,
      { student_name: '', parent_name: '', phone: '', course_interest: 'B.Tech AI & ML', city: 'Bengaluru' }
    ]);
  };

  const updateBatchRow = (index: number, field: string, val: string) => {
    const updated = [...batchRows];
    (updated[index] as any)[field] = val;
    setBatchRows(updated);
  };

  const removeBatchRow = (index: number) => {
    if (batchRows.length <= 1) return;
    setBatchRows(batchRows.filter((_, i) => i !== index));
  };

  // Create Single Lead
  const handleCreateSingleLead = async (e: React.FormEvent) => {
    e.preventDefault();
    let cleanPhone = singleLeadForm.phone.replace(/\D/g, '');
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.slice(2);
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.slice(1);
    }
    if (cleanPhone.length !== 10) {
      alert('Phone number must be exactly 10 digits (e.g. 9876543210).');
      return;
    }
    try {
      await apiRequest('/leads', 'POST', {
        student_name: singleLeadForm.student_name.trim(),
        parent_name: singleLeadForm.parent_name.trim() || undefined,
        phone: cleanPhone,
        alt_phone: singleLeadForm.alt_phone.trim() || undefined,
        email: singleLeadForm.email.trim() || undefined,
        city: singleLeadForm.city,
        state: singleLeadForm.state,
        course_interest: singleLeadForm.course_interest,
        priority: singleLeadForm.priority,
        assigned_user_id: singleLeadForm.assigned_user_id ? Number(singleLeadForm.assigned_user_id) : undefined,
        notes: singleLeadForm.notes
      });
      alert(`Lead for "${singleLeadForm.student_name}" created successfully!`);
      setShowCreateSingleModal(false);
      setSingleLeadForm({
        student_name: '',
        parent_name: '',
        phone: '',
        alt_phone: '',
        email: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        course_interest: 'Computer Science & AI Engineering',
        priority: 'High',
        assigned_user_id: '',
        notes: ''
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create lead');
    }
  };

  const handleCreateMultipleLeads = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = batchRows
      .filter(r => r.student_name.trim() && r.phone.trim())
      .map(r => {
        let p = r.phone.replace(/\D/g, '');
        if (p.length === 12 && p.startsWith('91')) p = p.slice(2);
        else if (p.length === 11 && p.startsWith('0')) p = p.slice(1);
        return { ...r, phone: p };
      });
    if (validRows.length === 0) {
      alert('Please enter at least one lead with Student Name and 10-digit Phone Number.');
      return;
    }

    try {
      const res = await apiRequest<{ created_count: number; skipped_count: number }>('/leads/bulk-create', 'POST', validRows);
      alert(`Successfully added ${res.created_count} leads to the registry! (Skipped/Duplicate: ${res.skipped_count})`);
      setShowMultiModal(false);
      setBatchRows([
        { student_name: '', parent_name: '', phone: '', course_interest: 'B.Tech Computer Science', city: 'Bengaluru' },
        { student_name: '', parent_name: '', phone: '', course_interest: 'MBBS Guidance', city: 'Bengaluru' },
      ]);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to batch create leads');
    }
  };

  // Download Template Excel
  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('polarise_token');
      const response = await fetch('/api/leads/template-excel', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Polaris_Leads_Intake_Template.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || 'Failed to download template');
    }
  };

  // Upload Excel File
  const handleUploadExcelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select an Excel (.xlsx) or CSV file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', uploadFile);

    const params = new URLSearchParams();
    params.append('allocation_mode', allocationMode);
    if (allocationMode === 'selected' && uploadTargetIds.length > 0) {
      params.append('target_employee_ids', uploadTargetIds.join(','));
    }

    try {
      const token = localStorage.getItem('polarise_token');
      const response = await fetch(`/api/leads/upload-excel?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed');
      }

      setUploadResult(data);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Download Employee Calling Sheet Excel
  const handleDownloadCallSheet = async () => {
    setDownloadingCallSheet(true);
    try {
      const token = localStorage.getItem('polarise_token');
      const queryParam = selectedExportEmpId !== 'all' ? `?user_id=${selectedExportEmpId}` : '';
      const response = await fetch(`/api/reports/export/employee-callsheet/excel${queryParam}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Polaris_CallingSheet_${selectedExportEmpId === 'all' ? 'All_Counselors' : `EMP_${selectedExportEmpId}`}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || 'Failed to download call sheet');
    } finally {
      setDownloadingCallSheet(false);
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(leads.length / pageSize) || 1;
  const paginatedLeads = leads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Count leads per employee
  const employeeLeadCounts: Record<number, number> = {};
  leads.forEach(l => {
    if (l.assigned_user_id) {
      employeeLeadCounts[l.assigned_user_id] = (employeeLeadCounts[l.assigned_user_id] || 0) + 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 card-3d bg-white p-5 rounded-3xl border border-teal-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-600"></span>
            </span>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Admissions Leads & Parent CRM</h2>
          </div>
          <p className="text-xs text-teal-800 font-semibold mt-0.5">
            Real-time contact registry • {leads.length} student & parent leads registered • High-speed 10-counselor allocation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download Call Sheet per Employee with selector */}
          <div className="flex items-center rounded-2xl border border-teal-200 bg-teal-50/50 p-1 shadow-sm">
            <select
              value={selectedExportEmpId}
              onChange={(e) => setSelectedExportEmpId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 px-2 py-1 outline-none"
            >
              <option value="all">All Counselors (Consolidated)</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.employee_id} - {e.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleDownloadCallSheet}
              disabled={downloadingCallSheet}
              className="flex items-center space-x-1.5 rounded-xl bg-teal-700 px-3 py-1.5 text-xs font-black text-white hover:bg-teal-800 transition"
              title="Export calling contact sheet formatted for Excel"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{downloadingCallSheet ? 'Exporting...' : 'Export Call Sheet (.xlsx)'}</span>
            </button>
          </div>

          {/* Upload Excel Button */}
          <button
            onClick={() => {
              setUploadFile(null);
              setUploadResult(null);
              setShowExcelModal(true);
            }}
            className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/25 btn-3d-emerald"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Upload Excel (.xlsx / .csv)</span>
          </button>

          {/* Create Single Lead Button */}
          <button
            onClick={() => setShowCreateSingleModal(true)}
            className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-teal-800 to-emerald-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-teal-700/25"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Lead</span>
          </button>

          {/* Add Multiple Leads Button */}
          <button
            onClick={() => setShowMultiModal(true)}
            className="flex items-center space-x-2 rounded-2xl border-2 border-teal-300 bg-white hover:bg-teal-50 px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-teal-900 transition shadow-sm"
          >
            <Plus className="h-4 w-4 text-teal-700" />
            <span>Batch Add Leads</span>
          </button>
        </div>
      </div>

      {/* 3D Interactive Telecalling Counselor Workload Hub */}
      <div className="card-3d bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-5 rounded-3xl text-white border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white">10 Remote Telecalling Counselors — Workload & Allocation</span>
          </div>
          <span className="text-[11px] font-bold text-blue-300">
            Total Staff: 10 Telecallers • 100-140 Assigned Leads per Counselor
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
          {employees.map(emp => {
            const count = employeeLeadCounts[emp.id] || 0;
            const isFilterActive = counselorFilter === String(emp.id);
            const isAvailable = emp.profile?.current_status === 'available';

            return (
              <div
                key={emp.id}
                onClick={() => setCounselorFilter(isFilterActive ? 'All' : String(emp.id))}
                className={`relative flex flex-col items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all duration-200 border ${
                  isFilterActive
                    ? 'bg-blue-600/40 border-blue-400 shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 hover:-translate-y-0.5'
                }`}
              >
                <div className="relative mb-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-700 font-mono text-xs font-black text-white">
                    {emp.employee_id.slice(-2)}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${
                      isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </div>

                <div className="text-center w-full">
                  <div className="text-[11px] font-extrabold text-white truncate w-full">{emp.name.split(' ')[0]}</div>
                  <div className="text-[9px] font-mono font-bold text-slate-400">{emp.employee_id}</div>
                </div>

                <div className="mt-2 w-full rounded-lg bg-slate-900/90 py-1 text-center border border-slate-700/60">
                  <span className="text-xs font-black text-amber-400 font-mono">{count}</span>
                  <span className="text-[9px] font-semibold text-slate-400 block -mt-0.5">Leads</span>
                </div>
              </div>
            );
          })}
        </div>

        {counselorFilter !== 'All' && (
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-blue-300 font-bold">
              Filtering table to Counselor {employees.find(e => String(e.id) === counselorFilter)?.name} ({employees.find(e => String(e.id) === counselorFilter)?.employee_id})
            </span>
            <button
              onClick={() => setCounselorFilter('All')}
              className="text-amber-400 hover:underline font-bold text-xs"
            >
              Reset Filter (Show All 10 Counselors)
            </button>
          </div>
        )}
      </div>

      {/* Advanced Multi-Counselor Allocation Bar */}
      {selectedLeadIds.length > 0 && (
        <div className="rounded-3xl border-2 border-blue-500 bg-blue-50/95 p-5 animate-in fade-in duration-200 card-3d shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-blue-200 pb-3">
            <div>
              <span className="text-xs font-black text-blue-950 uppercase tracking-wider">
                Allocate Selected Leads to Selected Counselors
              </span>
              <p className="text-[11px] text-blue-800 font-semibold mt-0.5">
                {selectedLeadIds.length} leads selected. Select one or more counselors below to distribute leads evenly among them.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={selectAllEmployees}
                className="text-xs font-black text-blue-700 underline"
              >
                {selectedEmployeeIds.length === employees.length ? 'Deselect All Staff' : 'Select All 10 Counselors'}
              </button>
            </div>
          </div>

          {/* Counselor Selection Chips */}
          <div>
            <div className="text-[11px] font-bold text-blue-900 mb-2">Choose Target Counselors:</div>
            <div className="flex flex-wrap gap-2">
              {employees.map(emp => {
                const isSelected = selectedEmployeeIds.includes(emp.id);
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => toggleSelectEmployee(emp.id)}
                    className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400'
                        : 'bg-white border border-blue-200 text-slate-700 hover:bg-blue-100/50'
                    }`}
                  >
                    <span>{emp.name}</span>
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                      ({emp.employee_id})
                    </span>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-blue-900">
              {selectedEmployeeIds.length > 0
                ? `Will assign ${selectedLeadIds.length} leads across ${selectedEmployeeIds.length} selected counselor(s) (~${Math.ceil(selectedLeadIds.length / selectedEmployeeIds.length)} per counselor)`
                : 'Please select at least 1 counselor chip above to proceed.'}
            </span>

            <button
              onClick={handleBulkAssign}
              disabled={selectedEmployeeIds.length === 0}
              className="flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:bg-blue-700 transition disabled:opacity-40 btn-3d-primary"
            >
              <span>Distribute & Allocate Leads</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 card-3d">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by student name, parent name, phone (+91), city, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-black text-slate-700 focus:outline-none"
        >
          <option value="All">All Statuses ({leads.length})</option>
          <option value="New">New</option>
          <option value="Assigned">Assigned</option>
          <option value="Contacted">Contacted</option>
          <option value="Interested">Interested</option>
          <option value="Follow-up Required">Follow-up Required</option>
          <option value="Converted">Converted</option>
        </select>

        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none"
        >
          <option value="25">25 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white card-3d">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/90 font-black text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-10">
                  <button onClick={selectAllCurrentPage} className="text-slate-500 hover:text-slate-800">
                    {paginatedLeads.length > 0 && paginatedLeads.every(l => selectedLeadIds.includes(l.id)) ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3.5">Lead Code</th>
                <th className="px-4 py-3.5">Student & Parent Details</th>
                <th className="px-4 py-3.5">Calling Phone</th>
                <th className="px-4 py-3.5">Course Interest</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Assigned Counselor</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={9} className="py-16 text-center text-slate-400 font-bold">Loading master registry ({leads.length} records)...</td></tr>
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-teal-50 text-teal-700 mx-auto border-2 border-teal-200 shadow-sm">
                        <FolderKanban className="h-7 w-7" />
                      </div>
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                        {leads.length === 0 ? 'Lead Registry is Clean (0 Leads)' : 'No Leads Matched Criteria'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {leads.length === 0
                          ? 'All fake leads have been successfully removed. Ready for you to create a new lead or upload an Excel contact sheet!'
                          : 'Try modifying your search filter or clear your counselor selection.'}
                      </p>
                      {leads.length === 0 && (
                        <div className="flex items-center justify-center space-x-3 pt-2">
                          <button
                            onClick={() => setShowCreateSingleModal(true)}
                            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-teal-800 to-emerald-600 px-4 py-2 text-xs font-black uppercase text-white shadow-md hover:from-teal-900 hover:to-emerald-700 transition"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Create New Lead</span>
                          </button>
                          <button
                            onClick={() => setShowExcelModal(true)}
                            className="flex items-center space-x-1.5 rounded-xl border border-teal-300 bg-white px-4 py-2 text-xs font-black uppercase text-teal-800 hover:bg-teal-50 transition"
                          >
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                            <span>Upload Excel Sheet</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-blue-50/40 transition">
                    <td className="px-4 py-3.5">
                      <button onClick={() => toggleSelectLead(l.id)} className="text-slate-400 hover:text-blue-600">
                        {selectedLeadIds.includes(l.id) ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{l.lead_code}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-black text-slate-900">{l.student_name}</div>
                      {l.parent_name && <div className="text-[11px] text-slate-500 font-semibold">Parent: {l.parent_name}</div>}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-800 font-black">{l.phone}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">{l.course_interest}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-semibold">{l.city}, {l.state}</td>
                    <td className="px-4 py-3.5">
                      {l.assigned_employee_name ? (
                        <div className="flex items-center space-x-1 font-black text-slate-800">
                          <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                          <span>{l.assigned_employee_name}</span>
                        </div>
                      ) : (
                        <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                          Unassigned Pool
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        l.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' :
                        l.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        l.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {l.priority}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 bg-slate-50/70 p-4 gap-2">
          <div className="text-xs font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-900">{Math.min(leads.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
            <span className="font-bold text-slate-900">{Math.min(leads.length, currentPage * pageSize)}</span> of{' '}
            <span className="font-bold text-slate-900">{leads.length}</span> leads in database
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            <span className="text-xs font-black text-slate-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Excel Upload & Batch Allocation Modal */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 card-3d">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Upload Excel Leads & Distribute</h3>
                  <p className="text-xs text-slate-500 font-medium">Ingest 100 to 2,000 leads and distribute across the 10 remote counselors</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center space-x-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 hover:bg-blue-100 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Sample Template (.xlsx)</span>
              </button>
            </div>

            {uploadResult ? (
              <div className="space-y-4 py-3 animate-in zoom-in-95">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <div className="flex items-center space-x-2 font-black text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>Upload & Allocation Completed!</span>
                  </div>
                  <p className="text-xs mt-1 text-emerald-800">{uploadResult.message}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3 text-center border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold">Total Imported</span>
                    <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{uploadResult.imported}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-center border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold">Duplicates Skipped</span>
                    <div className="text-xl font-black text-amber-600 font-mono mt-0.5">{uploadResult.skipped_duplicates}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-center border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold">Total In File</span>
                    <div className="text-xl font-black text-blue-600 font-mono mt-0.5">{uploadResult.total_parsed}</div>
                  </div>
                </div>

                {uploadResult.distribution && Object.keys(uploadResult.distribution).length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2 block">
                      Counselor Allocation Breakdown:
                    </span>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.entries(uploadResult.distribution).map(([empCode, count]) => (
                        <div key={empCode} className="rounded-xl bg-white p-2 border border-slate-200 text-center">
                          <span className="text-[10px] font-bold text-slate-500">{empCode}</span>
                          <div className="text-xs font-black text-blue-600 font-mono">+{String(count)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => {
                      setShowExcelModal(false);
                      setUploadResult(null);
                    }}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-black uppercase text-white shadow-md hover:bg-blue-700 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadExcelSubmit} className="space-y-4">
                {/* File Dropzone */}
                <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-blue-500 transition bg-slate-50/50">
                  <UploadCloud className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-xs font-bold text-blue-600 hover:underline">
                      {uploadFile ? uploadFile.name : 'Click to select Excel (.xlsx) or CSV file'}
                    </span>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Accepts Microsoft Excel (.xlsx) and CSV files up to 2,000 rows
                  </p>
                </div>

                {/* Allocation Mode Options */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                    Lead Allocation Strategy:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition ${
                      allocationMode === 'auto_10'
                        ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="alloc_mode"
                          checked={allocationMode === 'auto_10'}
                          onChange={() => setAllocationMode('auto_10')}
                          className="text-blue-600"
                        />
                        <span className="text-xs font-black text-slate-900">Auto-Distribute (10 Staff)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">
                        Evenly shares contacts across EMP-001 to EMP-010 in round-robin.
                      </p>
                    </label>

                    <label className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition ${
                      allocationMode === 'selected'
                        ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="alloc_mode"
                          checked={allocationMode === 'selected'}
                          onChange={() => setAllocationMode('selected')}
                          className="text-blue-600"
                        />
                        <span className="text-xs font-black text-slate-900">Selected Staff Only</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">
                        Distribute among chosen active counselors.
                      </p>
                    </label>

                    <label className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition ${
                      allocationMode === 'unassigned'
                        ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="alloc_mode"
                          checked={allocationMode === 'unassigned'}
                          onChange={() => setAllocationMode('unassigned')}
                          className="text-blue-600"
                        />
                        <span className="text-xs font-black text-slate-900">Keep Unassigned</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">
                        Store in central pool for manual allocation later.
                      </p>
                    </label>
                  </div>
                </div>

                {allocationMode === 'selected' && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">Choose Target Counselors:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {employees.map(emp => {
                        const isSel = uploadTargetIds.includes(emp.id);
                        return (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => {
                              setUploadTargetIds(prev =>
                                prev.includes(emp.id) ? prev.filter(x => x !== emp.id) : [...prev, emp.id]
                              );
                            }}
                            className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                              isSel ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'
                            }`}
                          >
                            {emp.name} ({emp.employee_id})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowExcelModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!uploadFile || isUploading}
                    className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/30 hover:opacity-95 transition disabled:opacity-50 btn-3d-emerald"
                  >
                    <span>{isUploading ? 'Parsing & Allocating...' : 'Upload & Allocate Leads'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Batch Add Multiple Leads Modal */}
      {showMultiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 card-3d">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Batch Add Multiple Admission Leads</h3>
                <p className="text-xs text-slate-500 font-medium">Add multiple student and parent inquiries simultaneously into the database</p>
              </div>
              <button
                type="button"
                onClick={addBatchRow}
                className="flex items-center space-x-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs font-black text-blue-700 hover:bg-blue-100 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Another Row</span>
              </button>
            </div>

            <form onSubmit={handleCreateMultipleLeads} className="space-y-4">
              <div className="space-y-3">
                {batchRows.map((row, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-2xl border border-slate-200 bg-slate-50/70">
                    <span className="text-xs font-mono font-bold text-slate-400 w-6">#{idx + 1}</span>

                    <input
                      type="text"
                      required
                      placeholder="Student Name *"
                      value={row.student_name}
                      onChange={(e) => updateBatchRow(idx, 'student_name', e.target.value)}
                      className="flex-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                    />

                    <input
                      type="text"
                      placeholder="Parent Name"
                      value={row.parent_name}
                      onChange={(e) => updateBatchRow(idx, 'parent_name', e.target.value)}
                      className="flex-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                    />

                    <input
                      type="text"
                      required
                      placeholder="10-Digit Phone *"
                      value={row.phone}
                      onChange={(e) => updateBatchRow(idx, 'phone', e.target.value)}
                      className="w-full sm:w-36 rounded-xl border border-slate-200 bg-white p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                    />

                    <input
                      type="text"
                      placeholder="Course Interest"
                      value={row.course_interest}
                      onChange={(e) => updateBatchRow(idx, 'course_interest', e.target.value)}
                      className="flex-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() => removeBatchRow(idx)}
                      disabled={batchRows.length <= 1}
                      className="text-slate-400 hover:text-rose-600 p-1.5 disabled:opacity-30"
                      title="Remove Row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500">
                  {batchRows.length} rows prepared for batch intake
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowMultiModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition btn-3d-primary"
                  >
                    <span>Save All Leads</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Lead Creation Modal */}
      {showCreateSingleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border-2 border-teal-300 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-800 to-emerald-600 text-white shadow-md">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
                    Create New Student & Parent Lead
                  </h3>
                  <p className="text-xs text-teal-800 font-semibold">
                    Direct entry into Polaris admissions telecalling pipeline
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateSingleModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-xl p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSingleLead} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={singleLeadForm.student_name}
                    onChange={(e) => setSingleLeadForm({ ...singleLeadForm, student_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    Parent / Guardian Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Sharma"
                    value={singleLeadForm.parent_name}
                    onChange={(e) => setSingleLeadForm({ ...singleLeadForm, parent_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    10-Digit Primary Phone *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="9845012345"
                    value={singleLeadForm.phone}
                    onChange={(e) => setSingleLeadForm({ ...singleLeadForm, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    Alternate Contact / WhatsApp
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="Optional 10 digits"
                    value={singleLeadForm.alt_phone}
                    onChange={(e) => setSingleLeadForm({ ...singleLeadForm, alt_phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    Target Course / Program
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech Computer Science & AI"
                    value={singleLeadForm.course_interest}
                    onChange={(e) => setSingleLeadForm({ ...singleLeadForm, course_interest: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={singleLeadForm.city}
                    onChange={(e) => setSingleLeadForm({ ...singleLeadForm, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={singleLeadForm.priority}
                    onChange={(e) => setSingleLeadForm({ ...singleLeadForm, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Urgent">Urgent (Immediate Callback)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                    Assign To Telecaller (10 Staff)
                  </label>
                  <select
                    value={singleLeadForm.assigned_user_id}
                    onChange={(e) => setSingleLeadForm({ ...singleLeadForm, assigned_user_id: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">-- Unassigned (General Pool) --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employee_id} - {emp.name} ({emp.profile?.current_status || 'offline'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Counselor Intake Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Parent requirements, entrance score, preferred campus..."
                  value={singleLeadForm.notes}
                  onChange={(e) => setSingleLeadForm({ ...singleLeadForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateSingleModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-teal-800 to-emerald-600 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-teal-700/25 hover:from-teal-900 hover:to-emerald-700 transition"
                >
                  <span>Save & Register Lead</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
