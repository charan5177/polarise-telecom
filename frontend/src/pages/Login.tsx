import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, Sparkles, ArrowRight, CheckCircle2, AlertCircle, Radio, Terminal, Server } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (['super_admin', 'operations_admin', 'reporting_admin'].includes(user.role)) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Polaris@2026');
    setError(null);
  };

  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-100 relative overflow-hidden select-none">
      {/* 3D Cybernetic Perspective Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.22),rgba(255,255,255,0))] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Left side brand presentation with 3D Holographic Vault styling */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 border-r border-slate-800/80 relative z-10">
        <div>
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-75 blur-sm animate-pulse" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white shadow-2xl shadow-blue-500/50">
                <Shield className="h-8 w-8" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center space-x-2">
                <span>Polarise Telecom</span>
                <span className="text-[10px] font-mono bg-blue-600/40 border border-blue-400/30 text-blue-300 px-2 py-0.5 rounded-full">
                  v2.6 3D
                </span>
              </h1>
              <p className="text-xs font-bold text-blue-400 tracking-wider uppercase">Cloud Telephony & Admissions CRM</p>
            </div>
          </div>

          <div className="mt-14 max-w-lg space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-300 shadow-inner">
              <Sparkles className="h-4 w-4 text-blue-400 animate-spin" />
              <span>Developed for Polaris Educational Consultancy</span>
            </div>

            <h2 className="text-4xl font-black leading-tight text-white tracking-tight text-shadow-3d">
              Enterprise Remote Counseling & Admissions Telecalling
            </h2>
            <p className="text-sm font-medium leading-relaxed text-slate-300">
              High-throughput telephony gateway handling 10 remote counselor pipelines, 1,500+ student & parent leads, 
              direct call forwarding, virtual caller ID (+91 8047190000), and automated Excel distribution.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>Exotel Telephony PBX Integration & Webhook Receiver</span>
              </div>
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-200">
                <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                <span>100-200 Assigned Student Contacts per Counselor Pipeline</span>
              </div>
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-200">
                <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>Automated Excel (.xlsx) Lead Ingestion & 10-Staff Round Robin</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D PBX Server Rack Node Indicator */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur shadow-2xl">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center space-x-1.5 text-blue-400 font-bold">
              <Server className="h-4 w-4" />
              <span>PRIMARY CLOUD TRUNK: ACTIVE</span>
            </span>
            <span className="text-emerald-400 font-bold">10/10 NODES READY</span>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <div key={n} className="rounded-md bg-slate-800 p-1 text-center border border-slate-700/60">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mx-auto animate-pulse" />
                <span className="text-[8px] font-mono font-bold text-slate-400 block mt-0.5">20{n-1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs font-bold text-slate-500 tracking-wide">
          Confidential • Polaris Educational Consultancy Security Gateway
        </div>
      </div>

      {/* Right side login form (3D Cyber Glassmorphic Portal) */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16 relative z-10">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center lg:text-left mb-6">
            <div className="inline-block lg:hidden mb-4">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white shadow-xl shadow-blue-500/30">
                <Shield className="h-8 w-8" />
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-400 mb-1">
              <Terminal className="h-3.5 w-3.5" />
              <span>STATION AUTHENTICATION PORTAL</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white uppercase">Operator Login</h2>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Sign in with your corporate credentials or choose a quick demo terminal.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start space-x-3 rounded-2xl border-2 border-rose-500/40 bg-rose-950/60 p-4 text-xs font-bold text-rose-200 animate-in fade-in zoom-in-95">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                  Staff Corporate Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin1@polarisedu.in or emp01@polarisedu.in"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 py-3 pl-10 pr-4 text-xs font-bold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 py-3 pl-10 pr-4 text-xs font-bold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-blue-500/30 hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition btn-3d-primary"
              >
                <span>{loading ? 'Authenticating Terminal...' : 'Sign In to Station'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Quick Demo Switcher Card for presentation convenience */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-black text-slate-200 mb-3">
                <span className="flex items-center space-x-1.5 text-blue-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="uppercase tracking-wider">Fast Demo Terminal Switcher</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  Pass: Polaris@2026
                </span>
              </div>

              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Administrators (3 Accounts):
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3.5">
                <button
                  type="button"
                  onClick={() => selectDemoAccount('admin1@polarisedu.in')}
                  className="rounded-xl border border-slate-700 bg-slate-800/90 py-2 px-1 text-[11px] font-extrabold text-slate-200 hover:border-blue-500 hover:bg-blue-950/40 transition truncate text-center"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => selectDemoAccount('admin2@polarisedu.in')}
                  className="rounded-xl border border-slate-700 bg-slate-800/90 py-2 px-1 text-[11px] font-extrabold text-slate-200 hover:border-blue-500 hover:bg-blue-950/40 transition truncate text-center"
                >
                  Operations Admin
                </button>
                <button
                  type="button"
                  onClick={() => selectDemoAccount('admin3@polarisedu.in')}
                  className="rounded-xl border border-slate-700 bg-slate-800/90 py-2 px-1 text-[11px] font-extrabold text-slate-200 hover:border-blue-500 hover:bg-blue-950/40 transition truncate text-center"
                >
                  Reporting Admin
                </button>
              </div>

              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Telecalling Counselors (10 Accounts):
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const pad = num < 10 ? `0${num}` : `${num}`;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => selectDemoAccount(`emp${pad}@polarisedu.in`)}
                      className="rounded-xl border border-slate-700 bg-slate-800 py-1.5 text-[10px] font-extrabold text-slate-300 hover:border-blue-500 hover:bg-blue-950/40 transition text-center"
                    >
                      EMP {pad}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
