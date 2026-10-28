import React, { useState } from 'react';
import { useCall } from '../context/CallContext';
import { 
  PhoneOff, 
  PhoneCall, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  User, 
  Sparkles,
  Calendar,
  FileText
} from 'lucide-react';

export const CallingModal: React.FC = () => {
  const { 
    activeCall, 
    callState, 
    elapsedSeconds, 
    talkSeconds, 
    hangupCall, 
    submitOutcome, 
    dismissModal 
  } = useCall();

  const [outcome, setOutcome] = useState('Interested - Scheduled Visit');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  if (!activeCall && callState === 'idle') return null;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOutcomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitOutcome(outcome, notes, followUpDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className={`p-4 text-white ${
          callState === 'ringing' 
            ? 'bg-amber-600' 
            : callState === 'connected' 
            ? 'bg-emerald-600' 
            : 'bg-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="flex h-3 w-3 rounded-full bg-white animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {callState === 'ringing' && 'Ringing Customer...'}
                {callState === 'connected' && 'Call Connected & Recording'}
                {callState === 'wrapup' && 'Call Completed — Wrap Up'}
              </span>
            </div>
            {/* Demo indicator tag */}
            <div className="flex items-center space-x-1 rounded-full bg-black/20 px-2.5 py-0.5 text-[10px] font-bold">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>{activeCall?.is_demo ? 'SIMULATED DEMO' : 'LIVE EXOTEL'}</span>
            </div>
          </div>
        </div>

        {/* Call Info Content */}
        <div className="p-6">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-inner">
              <User className="h-8 w-8" />
            </div>
            <h3 className="mt-3 text-xl font-bold text-slate-900">
              {activeCall?.customer_name || 'Parent / Student'}
            </h3>
            <div className="mt-1 flex items-center justify-center space-x-2 text-sm text-slate-500 font-medium">
              <span>{activeCall?.customer_number}</span>
              <span>•</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-mono">
                Caller ID: {activeCall?.caller_id}
              </span>
            </div>
          </div>

          {/* Durations Counter Card */}
          <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
            <div>
              <div className="text-[11px] font-semibold uppercase text-slate-400">Total Ring + Call</div>
              <div className="text-lg font-mono font-bold text-slate-700">
                {formatTimer(elapsedSeconds)}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase text-slate-400">Connected Talk Time</div>
              <div className="text-lg font-mono font-bold text-emerald-600">
                {formatTimer(talkSeconds)}
              </div>
            </div>
          </div>

          {/* Animated Waveform Visualizer during Connected State */}
          {callState === 'connected' && (
            <div className="mt-4 flex items-center justify-center space-x-1 py-2">
              <span className="h-3 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-6 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-8 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="h-5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '450ms' }} />
              <span className="h-7 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '200ms' }} />
              <span className="h-4 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '350ms' }} />
              <span className="text-xs text-emerald-600 font-medium pl-2">Speech Channel Active</span>
            </div>
          )}

          {/* Action button: Hang Up (during active/ringing call) */}
          {(callState === 'ringing' || callState === 'connected') && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={hangupCall}
                className="flex items-center space-x-2 rounded-full bg-rose-600 px-6 py-3 font-bold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-700 active:scale-95"
              >
                <PhoneOff className="h-5 w-5" />
                <span>End Call</span>
              </button>
            </div>
          )}

          {/* Wrap Up Form (after call ends) */}
          {callState === 'wrapup' && (
            <form onSubmit={handleOutcomeSubmit} className="mt-5 space-y-4 text-left border-t border-slate-200 pt-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Post-Call Disposition & Notes</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Call Outcome</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Interested - Scheduled Visit">Interested - Scheduled Campus Visit</option>
                  <option value="Converted / Admission Done">Converted / Admission Confirmed</option>
                  <option value="Follow-up Required">Follow-up Required</option>
                  <option value="Call Back Requested">Call Back Requested</option>
                  <option value="Fee Details Sent">Fee Details Sent</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Ringing / No Answer">Ringing / No Answer</option>
                  <option value="Busy">Line Busy</option>
                  <option value="Invalid Number">Invalid / Wrong Number</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Next Follow-up Date & Time</label>
                <input
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Counselor Discussion Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail student academic background, budget preferences, or parent questions..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition active:scale-95"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Mandatory Call Outcome</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
