import React, { useEffect } from 'react';
import { useCall } from '../context/CallContext';
import { useAuth } from '../context/AuthContext';
import { PhoneIncoming, Phone, PhoneOff, User, Sparkles, PhoneForwarded } from 'lucide-react';

export const InboundCallNotification: React.FC = () => {
  const { inboundCallAlert, answerInboundCall, rejectInboundCall } = useCall();
  const { user } = useAuth();

  useEffect(() => {
    if (inboundCallAlert) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc1.frequency.value = 440;
        osc2.frequency.value = 480;
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        osc1.start();
        osc2.start();
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
            audioCtx.close();
          } catch (_) {}
        }, 1200);
      } catch (err) {
        // Autoplay policy fallback
      }
    }
  }, [inboundCallAlert]);

  if (!inboundCallAlert) return null;

  const isForwarded = user?.forwarding_enabled;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 rounded-3xl border-2 border-blue-500 bg-white p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 ring-8 ring-blue-500/20 card-3d">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-blue-900">Incoming Parent Call</span>
        </div>
        <div className="flex items-center space-x-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">
          <Sparkles className="h-3 w-3" />
          <span>Exotel PBX Virtual Line</span>
        </div>
      </div>

      <div className="my-4 flex items-center space-x-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 animate-call-pulse">
          <PhoneIncoming className="h-7 w-7" />
        </div>
        <div className="overflow-hidden">
          <h4 className="text-sm font-black text-slate-900 truncate">
            {inboundCallAlert.customer_name || 'Admissions Parent / Student'}
          </h4>
          <p className="text-xs font-mono font-bold text-slate-600">{inboundCallAlert.customer_number}</p>
          {inboundCallAlert.lead_code ? (
            <span className="inline-block mt-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
              Matched Student Lead: {inboundCallAlert.lead_code}
            </span>
          ) : (
            <span className="inline-block mt-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              New Admissions Caller
            </span>
          )}
        </div>
      </div>

      {/* Call Forwarding Notice if enabled */}
      {isForwarded && (
        <div className="mb-3 flex items-center space-x-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-2 text-[11px] font-bold text-emerald-800">
          <PhoneForwarded className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Call Forwarding Active: Routing to mobile {user?.phone_number || '+91 98450 12345'}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={rejectInboundCall}
          className="flex items-center justify-center space-x-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-black text-rose-700 transition hover:bg-rose-100"
        >
          <PhoneOff className="h-4 w-4" />
          <span>Decline</span>
        </button>
        <button
          onClick={answerInboundCall}
          className="flex items-center justify-center space-x-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95 btn-3d-emerald"
        >
          <Phone className="h-4 w-4" />
          <span>Accept Call</span>
        </button>
      </div>
    </div>
  );
};
