import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Page Not Found</h2>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        The requested routing destination does not exist within the Polarise Telecom workspace.
      </p>
      <Link
        to="/"
        className="mt-6 flex items-center space-x-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
      >
        <Home className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
