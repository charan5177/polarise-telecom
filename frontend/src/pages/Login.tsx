import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, Sparkles, ArrowRight, AlertCircle, PhoneCall, Headphones, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FFF8EE] to-[#FFF1DE] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 relative select-none">
      {/* Decorative Warm Milk & Soft Orange Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-400/20 via-amber-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Login Box (Orange & Milk Theme) */}
      <div className="w-full max-w-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 opacity-60 blur-md animate-pulse" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-500 text-white shadow-2xl shadow-orange-500/40">
                <Shield className="h-9 w-9" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-950">
            POLARISE TELECOM TECHNOLOGY
          </h1>
          <p className="mt-1 text-xs font-black uppercase tracking-widest text-orange-600">
            POLARIS EDUCATIONAL CONSULTANCY
          </p>
          <div className="mt-2 inline-flex items-center space-x-1.5 rounded-full border border-orange-300/80 bg-orange-50/90 px-3.5 py-1 text-[11px] font-black text-orange-800 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-orange-600" />
            <span>CLOUD TELEPHONY & CRM STATION</span>
          </div>
        </div>

        {/* Error Alert Notice */}
        {error && (
          <div className="mb-5 flex items-start space-x-3 rounded-2xl border-2 border-rose-400 bg-rose-50 p-4 text-xs font-black text-rose-800 shadow-md animate-in fade-in zoom-in-95">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        {/* Milk Card Container with Bold Orange Accents */}
        <div className="rounded-3xl border-2 border-orange-200/90 bg-white p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(234,88,12,0.18)]">
          <div className="text-center pb-4 border-b border-orange-100 mb-6">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
              OPERATOR & ADMIN LOGIN
            </h2>
            <p className="mt-1 text-xs font-bold text-slate-500">
              Enter your corporate credentials or select a one-click terminal below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                STAFF CORPORATE EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-orange-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin1@polarisedu.in or emp01@polarisedu.in"
                  className="w-full rounded-2xl border-2 border-slate-200 bg-[#FFFDF9] py-3 pl-10 pr-4 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                SECURITY PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-orange-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border-2 border-slate-200 bg-[#FFFDF9] py-3 pl-10 pr-4 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-orange-500/35 active:scale-[0.98] disabled:opacity-50 transition border-b-4 border-orange-700"
            >
              <span>{loading ? 'AUTHENTICATING STATION...' : 'SIGN IN TO STATION'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Switcher Section (Styled in Milk & Orange) */}
          <div className="mt-7 pt-5 border-t-2 border-orange-100">
            <div className="flex items-center justify-between text-xs font-black text-slate-800 mb-3">
              <span className="flex items-center space-x-1.5 text-orange-600">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="uppercase tracking-wider">FAST DEMO TERMINAL SWITCHER</span>
              </span>
              <span className="text-[10px] font-mono font-black text-orange-800 bg-orange-100/80 px-2.5 py-0.5 rounded-full border border-orange-300">
                PASSWORD: Polaris@2026
              </span>
            </div>

            <div className="text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1.5">
              ADMINISTRATORS (3 ACCOUNTS):
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              <button
                type="button"
                onClick={() => selectDemoAccount('admin1@polarisedu.in')}
                className="rounded-xl border-2 border-orange-200 bg-[#FFFDF9] py-2 px-1 text-[11px] font-black text-slate-800 hover:border-orange-500 hover:bg-orange-50 transition truncate text-center shadow-sm"
              >
                SUPER ADMIN
              </button>
              <button
                type="button"
                onClick={() => selectDemoAccount('admin2@polarisedu.in')}
                className="rounded-xl border-2 border-orange-200 bg-[#FFFDF9] py-2 px-1 text-[11px] font-black text-slate-800 hover:border-orange-500 hover:bg-orange-50 transition truncate text-center shadow-sm"
              >
                OPERATIONS ADMIN
              </button>
              <button
                type="button"
                onClick={() => selectDemoAccount('admin3@polarisedu.in')}
                className="rounded-xl border-2 border-orange-200 bg-[#FFFDF9] py-2 px-1 text-[11px] font-black text-slate-800 hover:border-orange-500 hover:bg-orange-50 transition truncate text-center shadow-sm"
              >
                REPORTING ADMIN
              </button>
            </div>

            <div className="text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1.5">
              TELECALLING COUNSELORS (10 ACCOUNTS):
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const pad = num < 10 ? `0${num}` : `${num}`;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => selectDemoAccount(`emp${pad}@polarisedu.in`)}
                    className="rounded-xl border-2 border-orange-100 bg-[#FFFDF9] py-1.5 text-[10px] font-black text-slate-800 hover:border-orange-500 hover:bg-orange-50 transition text-center shadow-sm"
                  >
                    EMP {pad}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="text-center mt-5 text-[11px] font-black uppercase tracking-wider text-slate-400">
          CONFIDENTIAL • POLARIS EDUCATIONAL CONSULTANCY TELEPHONY GATEWAY
        </div>
      </div>
    </div>
  );
};
