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
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div>
        <div className="mb-4 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {isAdmin ? 'Administrative Control' : 'Telecalling Station'}
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
                      ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-black'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-[11px] text-slate-500">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Engine Status</span>
          <span className="flex items-center space-x-1 text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Ready</span>
          </span>
        </div>
        <p className="mt-1 text-[10px] leading-tight text-slate-400">
          Cloud Telephony PBX: Exotel Provider Candidate
        </p>
      </div>
    </aside>
  );
};
