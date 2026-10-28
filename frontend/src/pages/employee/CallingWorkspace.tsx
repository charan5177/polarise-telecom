import React, { useState, useEffect } from 'react';
import { useCall } from '../../context/CallContext';
import { useAuth } from '../../context/AuthContext';
import { apiRequest, Lead } from '../../services/api';
import { 
  PhoneCall, 
  Delete, 
  Sparkles, 
  FolderKanban, 
  ShieldCheck,
  Search,
  AlertTriangle,
  PhoneForwarded,
  PhoneIncoming,
  Download
} from 'lucide-react';

export const CallingWorkspace: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchLead, setSearchLead] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [downloadingSheet, setDownloadingSheet] = useState(false);

  const { startOutboundCall, triggerDemoInbound } = useCall();
  const { user } = useAuth();

  useEffect(() => {
    apiRequest<Lead[]>('/leads').then(setLeads).catch(console.error);
  }, []);

  const cleanDigits = (num: string) => {
    let digits = num.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) {
      digits = digits.slice(2);
    }
    return digits;
  };

  const validatePhone = (num: string) => {
    const digits = cleanDigits(num);
    if (digits.length > 10) {
      setValidationError('Invalid number: More than 10 digits entered. Standard Indian numbers must be exactly 10 digits.');
      return false;
    }
    if (digits.length > 0 && digits.length < 10) {
      setValidationError(`Incomplete number: ${digits.length}/10 digits entered.`);
      return false;
    }
    setValidationError(null);
    return digits.length === 10;
  };

  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    validatePhone(val);
  };

  const handleDigit = (digit: string) => {
    const digitsOnly = cleanDigits(phoneNumber);
    if (digitsOnly.length >= 10) {
      setValidationError('Invalid: Maximum 10 digits allowed. Cannot type more than 10 digits.');
      return;
    }
    const updated = phoneNumber + digit;
    setPhoneNumber(updated);
    validatePhone(updated);
  };

  const handleBackspace = () => {
    const updated = phoneNumber.slice(0, -1);
    setPhoneNumber(updated);
    validatePhone(updated);
  };

  const handleCallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cleanDigits(phoneNumber);
    if (digits.length > 10) {
      setValidationError('Invalid: More than 10 digits. Cannot initiate call.');
      return;
    }
    if (digits.length !== 10) {
      setValidationError('Invalid: Please enter exactly 10 digits before connecting.');
      return;
    }
    setValidationError(null);
    startOutboundCall(`+91${digits}`, customerName || 'Parent / Student');
  };

  const selectLeadToCall = (lead: Lead) => {
    const digits = cleanDigits(lead.phone);
    setPhoneNumber(digits);
    setCustomerName(lead.student_name);
    setValidationError(null);
    startOutboundCall(`+91${digits}`, lead.student_name, lead.id);
  };

  const handleDownloadSheet = async () => {
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
      a.download = `Polaris_CallingSheet_${user?.employee_id}_${new Date().toISOString().slice(0, 10)}.xlsx`;
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

  const filteredLeads = leads.filter(l => 
    l.student_name.toLowerCase().includes(searchLead.toLowerCase()) ||
    l.phone.includes(searchLead) ||
    l.course_interest.toLowerCase().includes(searchLead.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 3D Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 card-3d bg-white p-5 rounded-3xl border border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Softphone Calling Station</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Cloud PBX Console • Presenting authorized caller ID +91 8047190000
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Call Forwarding status indicator */}
          <div className="flex items-center space-x-1.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
            <PhoneForwarded className="h-4 w-4 text-emerald-600" />
            <span>
              {user?.forwarding_enabled ? `Forwarding Active (${user?.phone_number || '+91 98450 12345'})` : 'Direct Softphone'}
            </span>
          </div>

          {/* Test Incoming Call */}
          <button
            onClick={() => triggerDemoInbound()}
            className="flex items-center space-x-1.5 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 hover:bg-blue-100 transition shadow-sm"
            title="Simulate incoming parent call"
          >
            <PhoneIncoming className="h-3.5 w-3.5 text-blue-600 animate-bounce" />
            <span>Test Inbound Call</span>
          </button>

          {/* Export Personal Sheet */}
          <button
            onClick={handleDownloadSheet}
            disabled={downloadingSheet}
            className="flex items-center space-x-1.5 rounded-2xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-800 hover:bg-slate-50 transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-emerald-600" />
            <span>{downloadingSheet ? 'Exporting...' : 'Export Calling Sheet (.xlsx)'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Interactive Numpad Dialer */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl card-3d">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">Counselor Softphone Terminal</span>
            <div className="flex items-center space-x-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-black text-blue-700 border border-blue-200">
              <Sparkles className="h-3 w-3" />
              <span>Strict 10-Digit Guard</span>
            </div>
          </div>

          <form onSubmit={handleCallSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Parent or Student Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter contact name..."
                className="w-full rounded-2xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Phone Number (Exactly 10 Digits)
                </label>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {cleanDigits(phoneNumber).length}/10 Digits
                </span>
              </div>
              <div className={`flex items-center rounded-2xl border-2 px-3 py-2.5 transition ${
                validationError ? 'border-rose-500 bg-rose-50/40' : 'border-blue-500 bg-blue-50/20'
              }`}>
                <span className="text-slate-400 font-mono font-black mr-2 text-sm">+91</span>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="9845012345"
                  className="w-full bg-transparent font-mono text-xl font-black text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <Delete className="h-5 w-5" />
                </button>
              </div>

              {/* Validation Warning Notice */}
              {validationError && (
                <div className="mt-2 flex items-center space-x-1.5 text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 animate-in fade-in">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            {/* 3D Keypad Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {[
                { n: '1', sub: '' },
                { n: '2', sub: 'ABC' },
                { n: '3', sub: 'DEF' },
                { n: '4', sub: 'GHI' },
                { n: '5', sub: 'JKL' },
                { n: '6', sub: 'MNO' },
                { n: '7', sub: 'PQRS' },
                { n: '8', sub: 'TUV' },
                { n: '9', sub: 'WXYZ' },
                { n: '*', sub: '' },
                { n: '0', sub: '+' },
                { n: '#', sub: '' },
              ].map(({ n, sub }) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleDigit(n)}
                  className="flex flex-col items-center justify-center rounded-2xl dial-key-3d py-3 text-base font-black text-slate-800 transition hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 active:scale-95"
                >
                  <span>{n}</span>
                  {sub && <span className="text-[9px] font-semibold text-slate-400 tracking-wider">{sub}</span>}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={cleanDigits(phoneNumber).length !== 10}
              className="mt-4 flex w-full items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 py-3.5 font-black uppercase tracking-wider text-white shadow-xl shadow-blue-500/30 hover:opacity-95 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed btn-3d-primary"
            >
              <PhoneCall className="h-5 w-5" />
              <span>Connect Call (Caller ID: +91 8047190000)</span>
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center space-x-1.5 text-[11px] font-semibold text-slate-400 text-center border-t border-slate-100 pt-3">
            <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
            <span>Virtual Business Trunk: +91 8047190000</span>
          </div>
        </div>

        {/* Right Column: 3D Lead Directory */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl card-3d flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FolderKanban className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Your Assigned Student Leads ({leads.length})</h3>
              </div>
              <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {leads.length} Leads in Queue
              </span>
            </div>

            <div className="relative mt-3">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads by student name, course, phone number..."
                value={searchLead}
                onChange={(e) => setSearchLead(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs font-bold focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mt-3 divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
              {filteredLeads.map((l) => (
                <div key={l.id} className="flex items-center justify-between py-3 hover:bg-blue-50/30 transition px-2 rounded-xl">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-900">{l.student_name}</span>
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        {l.lead_code}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {l.course_interest} • <span className="font-mono font-bold text-slate-800">{l.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => selectLeadToCall(l)}
                    className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-black uppercase text-white hover:opacity-90 transition shadow-sm btn-3d-primary"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>Dial</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
