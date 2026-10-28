import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { 
  Settings, 
  Sparkles, 
  Radio, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Save,
  Server
} from 'lucide-react';

export const TelephonyConfig: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [demoMode, setDemoMode] = useState(true);
  const [virtualNumber, setVirtualNumber] = useState('+918047190000');
  const [accountSid, setAccountSid] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [subdomain, setSubdomain] = useState('api.exotel.com');
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    apiRequest<any>('/telephony/config').then((cfg) => {
      setConfig(cfg);
      setDemoMode(cfg.demo_mode);
      setVirtualNumber(cfg.virtual_number);
      setSubdomain(cfg.subdomain);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await apiRequest<any>('/telephony/config', 'POST', {
        demo_mode: demoMode,
        virtual_number: virtualNumber,
        account_sid: accountSid || undefined,
        api_key: apiKey || undefined,
        api_token: apiToken || undefined,
        subdomain: subdomain
      });
      setConfig(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update telephony configuration');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Cloud Telephony Integration & PBX Adapter</h2>
        <p className="text-xs text-slate-500">
          Provider abstraction layer configured for Exotel voice trunks and simulated demo engine
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center space-x-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Telephony configuration updated successfully!</span>
        </div>
      )}

      {/* Mode Switch Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Operational Mode Selection</h3>
            <p className="text-xs text-slate-500">Toggle between the interactive Demo Sandbox and Live Exotel Carrier Line</p>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`text-xs font-bold ${demoMode ? 'text-blue-600' : 'text-slate-400'}`}>
              Demo Mode
            </span>
            <button
              type="button"
              onClick={() => setDemoMode(!demoMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                demoMode ? 'bg-blue-600' : 'bg-emerald-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  demoMode ? 'translate-x-0' : 'translate-x-5'
                }`}
              />
            </button>
            <span className={`text-xs font-bold ${!demoMode ? 'text-emerald-600' : 'text-slate-400'}`}>
              Live Exotel Mode
            </span>
          </div>
        </div>

        {demoMode ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Demo Mode Active (Zero Telephony Cost)</span>
            </div>
            <p className="text-[11px] text-blue-800/80">
              Calls simulate realistic provider ring cadence, answer events, talk timers, and generate authentic WAV audio waveform recordings. Perfect for client presentations and user acceptance testing.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-900 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <Radio className="h-4 w-4 text-emerald-600" />
              <span>Live Carrier Telephony Active</span>
            </div>
            <p className="text-[11px] text-emerald-800/80">
              Direct API requests dispatched to Exotel voice endpoints. Calls bridge remote counselor phone numbers to student parents with virtual caller ID presentation.
            </p>
          </div>
        )}
      </div>

      {/* Exotel Trunk Settings Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Exotel API Credentials & Caller ID</h3>
          <a
            href="https://developer.exotel.com/docs/voice"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:underline"
          >
            <span>Exotel Developer Docs</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Company Caller ID (Virtual Number)</label>
            <input
              type="text"
              value={virtualNumber}
              onChange={(e) => setVirtualNumber(e.target.value)}
              placeholder="+918047190000"
              className="w-full rounded-xl border border-slate-300 p-2.5 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Exotel API Subdomain</label>
            <input
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="api.exotel.com"
              className="w-full rounded-xl border border-slate-300 p-2.5 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Account SID</label>
            <input
              type="text"
              value={accountSid}
              onChange={(e) => setAccountSid(e.target.value)}
              placeholder={config?.account_sid_masked || "Enter Exotel Account SID"}
              className="w-full rounded-xl border border-slate-300 p-2.5 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={config?.api_key_masked || "Enter Exotel API Key"}
              className="w-full rounded-xl border border-slate-300 p-2.5 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-600 mb-1">API Token</label>
            <input
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Enter Exotel API Token (leave empty to retain current)"
              className="w-full rounded-xl border border-slate-300 p-2.5 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Webhook Endpoint */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Inbound Webhook Callback URL:</span>
          <div className="mt-1 font-mono text-xs text-blue-700 bg-white p-2 rounded-lg border border-slate-200">
            https://your-domain.com/api/telephony/webhooks/exotel
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Telephony Setup Checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Pre-Flight Live Telephony Integration Checklist</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Exotel Enterprise Voice Account registered with KYC documentation</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Authorized virtual business caller ID (+91 8047190000) assigned and active</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Counselor mobile forwarding numbers verified in Exotel address book</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>StatusCallback URL configured to receive live event webhooks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
