import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  History, 
  CalendarClock, 
  Clock, 
  UserCheck, 
  Settings, 
  BarChart3, 
  FileSpreadsheet, 
  Radio, 
  FileAudio, 
  ShieldCheck, 
  FolderKanban
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const isAdmin = ['super_admin', 'operations_admin', 'reporting_admin'].includes(user.role);

  const employeeLinks = [
    { to: '/', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/my-leads', label: 'Assigned Leads', icon: FolderKanban },
    { to: '/calling', label: 'Calling Workspace', icon: PhoneCall },
    { to: '/call-history', label: 'Call History', icon: History },
    { to: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
    { to: '/work-sessions', label: 'My Work Sessions', icon: Clock },
    { to: '/profile', label: 'My Profile', icon: UserCheck },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Central Dashboard', icon: LayoutDashboard },
    { to: '/admin/employees', label: 'Employee Monitor', icon: Users },
    { to: '/admin/leads', label: 'Lead CRM Master', icon: FolderKanban },
    { to: '/admin/calls', label: 'Live Call Logs', icon: Radio },
    { to: '/admin/recordings', label: 'Recording Vault', icon: FileAudio },
    { to: '/admin/attendance', label: 'Attendance & Activity', icon: Clock },
    { to: '/admin/analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/admin/exports', label: 'Excel & CSV Exports', icon: FileSpreadsheet },
    { to: '/admin/telephony', label: 'Telephony Config', icon: Settings },
    { to: '/admin/audit', label: 'Audit Security Logs', icon: ShieldCheck },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <aside className={`w-64 shrink-0 border-r min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between ${
      isAdmin ? 'border-teal-100 bg-white' : 'border-pink-100 bg-white'
    }`}>
      <div>
        <div className={`mb-4 px-3 text-[11px] font-black uppercase tracking-wider ${
          isAdmin ? 'text-teal-700' : 'text-pink-600'
        }`}>
          {isAdmin ? 'Luxury Mint & Teal Admin Suite' : 'Pastel Pink & Blue Telecaller Hub'}
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/' || link.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? isAdmin
                        ? 'bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-600 text-white shadow-md shadow-teal-700/25 font-black'
                        : 'bg-gradient-to-r from-pink-500 via-rose-400 to-sky-400 text-white shadow-md shadow-pink-400/25 font-black'
                      : isAdmin
                      ? 'text-slate-600 hover:bg-teal-50/60 hover:text-teal-900'
                      : 'text-slate-600 hover:bg-pink-50/60 hover:text-pink-900'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Status info at bottom of sidebar */}
      <div className={`rounded-2xl border p-3.5 text-[11px] ${
        isAdmin
          ? 'border-teal-200/80 bg-gradient-to-br from-teal-50/70 to-emerald-50/40 text-teal-900'
          : 'border-pink-200/80 bg-gradient-to-br from-pink-50/60 to-sky-50/50 text-slate-700'
      }`}>
        <div className="flex items-center justify-between font-black">
          <span className={isAdmin ? 'text-teal-950 uppercase tracking-wider text-[10px]' : 'text-pink-950 uppercase tracking-wider text-[10px]'}>
            Telephony PBX
          </span>
          <span className="flex items-center space-x-1.5 text-emerald-600 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Ready</span>
          </span>
        </div>
        <p className="mt-1 text-[10px] leading-tight text-slate-500 font-medium">
          {isAdmin ? 'Exotel Virtual PBX • Luxury Mint & Teal Edition' : 'Exotel Virtual Carrier • Pastel Soft Edition'}
        </p>
      </div>
    </aside>
  );
};
