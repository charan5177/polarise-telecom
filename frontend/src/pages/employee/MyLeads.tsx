import React, { useState, useEffect } from 'react';
import { apiRequest, Lead } from '../../services/api';
import { useCall } from '../../context/CallContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Search, 
  PhoneCall, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  FolderKanban,
  Sparkles,
  PhoneForwarded,
  UserCheck
} from 'lucide-react';

export const MyLeads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [downloadingSheet, setDownloadingSheet] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { startOutboundCall } = useCall();
  const { user } = useAuth();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const url = `/leads?status=${statusFilter}&search=${encodeURIComponent(search)}`;
      const data = await apiRequest<Lead[]>(url);
      setLeads(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    setCurrentPage(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
    setCurrentPage(1);
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

  // Dial Next Pending Lead
  const handleDialNext = () => {
    const nextLead = leads.find(l => l.status === 'New' || l.status === 'Assigned') || leads[0];
    if (nextLead) {
      startOutboundCall(nextLead.phone, nextLead.student_name, nextLead.id);
    } else {
      alert('All assigned leads have been contacted!');
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(leads.length / pageSize) || 1;
  const paginatedLeads = leads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const newCount = leads.filter(l => l.status === 'New' || l.status === 'Assigned').length;
  const inProgressCount = leads.filter(l => l.status === 'Contacted' || l.status === 'Interested' || l.status === 'Follow-up Required').length;
  const convertedCount = leads.filter(l => l.status === 'Converted').length;

  return (
    <div className="space-y-6">
      {/* 3D Header with KPI Cards */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 card-3d bg-white p-5 rounded-3xl border border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <FolderKanban className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">My Assigned Leads Pipeline</h2>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Exclusively assigned to <strong className="text-slate-900">{user?.name} ({user?.employee_id})</strong> • Private Counselor Partition
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadMyCallSheet}
            disabled={downloadingSheet}
            className="flex items-center space-x-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-800 hover:bg-slate-50 transition shadow-sm"
            title="Download personal Excel workbook for offline dialing"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>{downloadingSheet ? 'Exporting...' : 'Download My Calling Sheet (.xlsx)'}</span>
          </button>

          <button
            onClick={handleDialNext}
            className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 hover:opacity-95 transition btn-3d-primary"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Dial Next Pending Lead</span>
          </button>
        </div>
      </div>

      {/* 3D Workload Counter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 card-3d">
          <span className="text-[10px] font-black uppercase text-slate-400 block">Total Assigned Leads</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">{leads.length}</div>
          <span className="text-[11px] text-slate-500 font-semibold">100% Private Pipeline</span>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 card-3d">
          <span className="text-[10px] font-black uppercase text-amber-700 block">Uncontacted Leads</span>
          <div className="text-2xl font-black text-amber-800 font-mono mt-0.5">{newCount}</div>
          <span className="text-[11px] text-amber-700 font-semibold">Ready for first call</span>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 card-3d">
          <span className="text-[10px] font-black uppercase text-blue-700 block">In Counseling / Follow-up</span>
          <div className="text-2xl font-black text-blue-800 font-mono mt-0.5">{inProgressCount}</div>
          <span className="text-[11px] text-blue-700 font-semibold">Active negotiations</span>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 card-3d">
          <span className="text-[10px] font-black uppercase text-emerald-700 block">Admissions Converted</span>
          <div className="text-2xl font-black text-emerald-800 font-mono mt-0.5">{convertedCount}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Enrollments finalized</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 card-3d">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search your leads by student name, phone (+91), course, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-black text-slate-700 focus:border-blue-500 focus:outline-none"
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
                <th className="px-5 py-3.5">Lead Code</th>
                <th className="px-5 py-3.5">Student & Parent</th>
                <th className="px-5 py-3.5">Phone Number</th>
                <th className="px-5 py-3.5">Course Interest</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5 text-right">Direct Dial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-bold">
                    Loading your assigned leads...
                  </td>
                </tr>
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-bold">
                    No leads found in this filter.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-blue-50/40 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-600">
                      {lead.lead_code}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-black text-slate-900">{lead.student_name}</div>
                      {lead.parent_name && (
                        <div className="text-[11px] text-slate-500 font-medium">Parent: {lead.parent_name}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-800 font-black">{lead.phone}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">{lead.course_interest}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-semibold">{lead.city}, {lead.state}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        lead.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' :
                        lead.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        lead.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => startOutboundCall(lead.phone, lead.student_name, lead.id)}
                        className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-black uppercase text-white shadow-md hover:opacity-90 transition btn-3d-primary"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>Call</span>
                      </button>
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
            <span className="font-bold text-slate-900">{leads.length}</span> assigned leads
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
    </div>
  );
};
