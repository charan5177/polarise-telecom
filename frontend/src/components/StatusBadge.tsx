import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'lead' | 'call' | 'employee' | 'recording';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'lead' }) => {
  const getBadgeStyle = () => {
    const s = status.toLowerCase();

    // Employee Statuses
    if (s === 'available' || s === 'online') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
    }
    if (s === 'on_call') {
      return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse ring-amber-500/20';
    }
    if (s === 'on_break') {
      return 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/20';
    }
    if (s === 'offline') {
      return 'bg-slate-100 text-slate-600 border-slate-200';
    }

    // Lead & Call Statuses
    if (s.includes('convert') || s === 'completed') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s.includes('interest') || s === 'in-progress') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (s.includes('follow') || s === 'ringing') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s.includes('contacted') || s === 'assigned') {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    if (s === 'new') {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (s.includes('not') || s === 'busy' || s === 'no-answer') {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (s.includes('invalid') || s === 'failed') {
      return 'bg-slate-100 text-slate-700 border-slate-300';
    }

    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getBadgeStyle()}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
};
