import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        You do not possess the required administrator credentials to inspect this resource.
      </p>
      <Link
        to="/"
        className="mt-6 flex items-center space-x-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Authorized Station</span>
      </Link>
    </div>
  );
};
