import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { Phone, CheckCircle2, PhoneForwarded, ShieldCheck, AlertTriangle, Save } from 'lucide-react';

export const MyProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [forwardingNumber, setForwardingNumber] = useState(
    user?.phone_number ? user.phone_number.replace(/^\+91/, '') : ''
  );
  const [forwardingEnabled, setForwardingEnabled] = useState(
    (user as any)?.forwarding_enabled ?? true
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const cleanDigits = (num: string) => {
    let digits = num.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) {
      digits = digits.slice(2);
    }
    return digits;
  };

  const handlePhoneChange = (val: string) => {
    setForwardingNumber(val);
    const digits = cleanDigits(val);
    if (digits.length > 10) {
      setError('Invalid number: More than 10 digits entered. Must be exactly 10 digits.');
    } else if (digits.length > 0 && digits.length < 10) {
      setError(`Incomplete: ${digits.length}/10 digits.`);
    } else {
      setError(null);
    }
  };

  const handleSaveForwarding = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cleanDigits(forwardingNumber);
    if (digits.length > 10) {
      setError('Invalid: Phone number contains more than 10 digits.');
      return;
    }
    if (digits.length !== 10) {
      setError('Invalid: Phone number must be exactly 10 digits (Standard Indian format).');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await apiRequest('/auth/call-forwarding', 'POST', {
        phone_number: `+91${digits}`,
        forwarding_enabled: forwardingEnabled
      });
      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update call forwarding preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Counselor Station Profile</h2>
        <p className="text-xs text-slate-500 font-medium">Your telecalling station credentials and call forwarding configurations</p>
      </div>

      {/* Staff ID Card */}
      <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-400 to-rose-400 text-white font-black text-2xl shadow-md">
            {user?.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black text-slate-900">{user?.name}</h3>
              <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-mono font-black text-orange-700">
                {user?.employee_id}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{user?.profile?.designation} • {user?.profile?.department}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Corporate Email</div>
            <div className="mt-1 font-black text-slate-800">{user?.email}</div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">PBX Extension</div>
            <div className="mt-1 font-black font-mono text-orange-600">Ext #{user?.extension || '201'}</div>
          </div>
        </div>
      </div>

      {/* Call Forwarding Configuration Card */}
      <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <PhoneForwarded className="h-5 w-5 text-orange-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Call Forwarding Option</h3>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
            forwardingEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {forwardingEnabled ? 'Forwarding Enabled' : 'Forwarding Disabled'}
          </span>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          When an outbound call is placed or an inbound parent call is routed, our PBX connects to this authorized 10-digit forwarding phone number.
        </p>

        {saveSuccess && (
          <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Call forwarding settings saved and synchronized with PBX router!</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">
            <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSaveForwarding} className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <div>
              <span className="font-bold text-slate-800">Forward Calls to Counselor Phone</span>
              <p className="text-[11px] text-slate-400">Enable receiving and making calls through your external mobile number</p>
            </div>
            <input
              type="checkbox"
              checked={forwardingEnabled}
              onChange={(e) => setForwardingEnabled(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-600 font-black uppercase tracking-wider text-[11px]">
                Authorized Forwarding Mobile Number (10 Digits)
              </label>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {cleanDigits(forwardingNumber).length}/10 Digits
              </span>
            </div>
            <div className="flex items-center rounded-xl border-2 border-orange-500 bg-orange-50/20 px-3 py-2.5">
              <span className="text-slate-400 font-mono font-black mr-2 text-sm">+91</span>
              <input
                type="text"
                value={forwardingNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="9876543201"
                className="w-full bg-transparent font-mono text-base font-black text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving || cleanDigits(forwardingNumber).length !== 10}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 font-black uppercase tracking-wider text-white shadow-md shadow-orange-500/20 hover:opacity-95 active:scale-95 transition disabled:opacity-40"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Updating...' : 'Save Forwarding Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
