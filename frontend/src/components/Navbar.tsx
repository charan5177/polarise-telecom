import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import { useTheme, ThemeType } from '../context/ThemeContext';
import { 
  PhoneIncoming, 
  LogOut, 
  Coffee, 
  CheckCircle2, 
  Sparkles, 
  Shield, 
  Clock, 
  Palette, 
  ChevronDown,
  PhoneForwarded
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, updateStatus } = useAuth();
  const { triggerDemoInbound, activeCall } = useCall();
  const { theme, setTheme } = useTheme();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  if (!user) return null;

  const isAdmin = ['super_admin', 'operations_admin', 'reporting_admin'].includes(user.role);

  const statusColor = {
    available: 'bg-emerald-500',
    on_call: 'bg-amber-500 animate-pulse',
    on_break: 'bg-orange-500',
    offline: 'bg-slate-400',
    online: 'bg-emerald-500'
  }[user.profile?.current_status || 'offline'];

  const themeOptions: { id: ThemeType; label: string; preview: string }[] = [
    { id: 'royal', label: 'Executive Royal Navy (Professional)', preview: 'from-blue-700 via-blue-600 to-indigo-600' },
    { id: 'sunset', label: 'Sunrise Sunset (Orange-Amber-Pink)', preview: 'from-orange-500 via-amber-400 to-rose-400' },
    { id: 'emerald', label: 'Emerald Mint (Clean Tech)', preview: 'from-emerald-700 via-teal-600 to-emerald-500' },
    { id: 'cyber', label: 'Cyber Violet (Purple-Pink)', preview: 'from-purple-700 via-fuchsia-600 to-pink-500' },
  ];

  const brandGradient = isAdmin
    ? 'from-teal-800 via-teal-700 to-emerald-600 shadow-teal-700/25'
    : 'from-pink-500 via-rose-400 to-sky-500 shadow-pink-400/25';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur shadow-sm transition-colors">
      {/* Brand title */}
      <Link to={isAdmin ? "/admin" : "/"} className="flex items-center space-x-3 hover:opacity-90 transition group">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr ${brandGradient} text-white shadow-md group-hover:scale-105 transition-transform`}>
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-black tracking-tight text-slate-900">Polarise Telecom</h1>
            {isAdmin ? (
              <span className="rounded-full bg-gradient-to-r from-teal-800 to-emerald-600 px-2.5 py-0.5 text-[10px] font-black text-emerald-100 uppercase tracking-wider shadow-sm">
                Executive Portal
              </span>
            ) : (
              <span className="rounded-full bg-gradient-to-r from-pink-500 to-sky-500 px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-sm">
                Counselor Suite
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-500">Polaris Educational Consultancy</p>
        </div>
      </Link>

      {/* Center Actions: Demo Mode Indicator & Inbound Simulator Button */}
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-2 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-1 text-xs text-blue-950 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-spin" />
          <span className="font-bold">Telephony PBX Sandbox</span>
          <span className="text-blue-300">|</span>
          <span className="text-slate-600 font-semibold">Exotel Engine</span>
        </div>

        {/* Call Forwarding status indicator for telecallers */}
        {user.role === 'telecaller' && (
          <div className="hidden md:flex items-center space-x-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
            <PhoneForwarded className="h-3.5 w-3.5 text-emerald-600" />
            <span>{user.forwarding_enabled ? `Fwd: ${user.phone_number || '+91 98450 12345'}` : 'Fwd: Direct'}</span>
          </div>
        )}

        {/* Demo Incoming Call trigger button */}
        <button
          onClick={() => triggerDemoInbound()}
          disabled={!!activeCall}
          className={`flex items-center space-x-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-black text-white shadow-md transition disabled:opacity-50 ${
            isAdmin
              ? 'border-teal-500/50 bg-gradient-to-r from-teal-700 to-emerald-600 shadow-teal-700/20 hover:from-teal-800 hover:to-emerald-700'
              : 'border-pink-300/80 bg-gradient-to-r from-pink-500 to-sky-500 shadow-pink-500/20 hover:from-pink-600 hover:to-sky-600'
          }`}
          title="Simulate an incoming phone call from a parent"
        >
          <PhoneIncoming className="h-3.5 w-3.5 text-white animate-bounce" />
          <span>Simulate Incoming Call</span>
        </button>
      </div>

      {/* Right User menu */}
      <div className="flex items-center space-x-3">
        {/* Admin Theme Switcher */}
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => { setShowThemeMenu(!showThemeMenu); setShowStatusMenu(false); }}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              title="Change Website Theme"
            >
              <Palette className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden md:inline">Theme</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[11px] font-black uppercase text-slate-400">Website Theme Palette</div>
                <div className="space-y-1 mt-1">
                  {themeOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { setTheme(opt.id); setShowThemeMenu(false); }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition ${
                        theme === opt.id ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`h-3 w-3 rounded-full bg-gradient-to-r ${opt.preview}`} />
                        <span>{opt.label}</span>
                      </div>
                      {theme === opt.id && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Availability Status Badge & Switcher */}
        <div className="relative">
          <button
            onClick={() => { setShowStatusMenu(!showStatusMenu); setShowThemeMenu(false); }}
            className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
          >
            <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
            <span className="capitalize">{user.profile?.current_status?.replace('_', ' ') || 'Available'}</span>
          </button>

          {showStatusMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-black/5 z-50">
              <button
                onClick={() => { updateStatus('available'); setShowStatusMenu(false); }}
                className="flex w-full items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Available (Ready to Dial)</span>
              </button>
              <button
                onClick={() => { updateStatus('on_break'); setShowStatusMenu(false); }}
                className="flex w-full items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Coffee className="h-4 w-4 text-orange-500" />
                <span>Take a Break</span>
              </button>
              <button
                onClick={() => { updateStatus('offline'); setShowStatusMenu(false); }}
                className="flex w-full items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Offline</span>
              </button>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
          <div className="hidden md:block text-right">
            <div className="text-xs font-black text-slate-900">{user.name}</div>
            <div className="text-[10px] text-blue-600 uppercase tracking-wider font-extrabold">
              {user.employee_id} • {user.role.replace('_', ' ')}
            </div>
          </div>
          <button
            onClick={logout}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
