import React, { useState, useEffect } from 'react';
import { apiRequest, User } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Link } from 'react-router-dom';
import { Users, Lock, Unlock, ArrowUpRight, ShieldCheck, Mail, Phone, CheckCircle2 } from 'lucide-react';

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const data = await apiRequest<User[]>('/employees');
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const toggleLock = async (user: User) => {
    try {
      await apiRequest(`/employees/${user.id}/toggle-lock`, 'PATCH');
      await fetchEmployees();
    } catch (e: any) {
      alert(e.message || 'Failed to toggle account lock');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Accounts & Role Permissions</h2>
          <p className="text-xs text-slate-500">13 Provisioned accounts (3 Administrators + 10 Admissions Counselors)</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">ID</th>
              <th className="px-5 py-3.5">Name & Email</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Forwarding Line</th>
              <th className="px-5 py-3.5">PBX Ext</th>
              <th className="px-5 py-3.5">Live Presence</th>
              <th className="px-5 py-3.5">Access Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center text-slate-400">Loading accounts...</td></tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5 font-mono font-bold text-blue-600">{emp.employee_id}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{emp.name}</div>
                    <div className="text-[11px] text-slate-400">{emp.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      emp.role.includes('admin') ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {emp.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-700">{emp.phone_number || 'N/A'}</td>
                  <td className="px-5 py-3.5 font-mono text-blue-600">{emp.extension || 'N/A'}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={emp.profile?.current_status || 'offline'} type="employee" />
                  </td>
                  <td className="px-5 py-3.5">
                    {emp.is_locked ? (
                      <span className="inline-flex items-center space-x-1 text-rose-600 font-bold text-[11px]">
                        <Lock className="h-3.5 w-3.5" />
                        <span>Locked</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-emerald-600 font-bold text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Active</span>
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => toggleLock(emp)}
                      className={`inline-flex items-center space-x-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                        emp.is_locked
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {emp.is_locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      <span>{emp.is_locked ? 'Unlock' : 'Lock'}</span>
                    </button>
                    <Link
                      to={`/admin/employees/${emp.id}`}
                      className="inline-flex items-center space-x-1 rounded-xl bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      <span>Profile</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
