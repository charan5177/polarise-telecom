import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Call, apiRequest } from '../services/api';
import { useAuth } from './AuthContext';

interface CallContextType {
  activeCall: Call | null;
  callState: 'idle' | 'ringing' | 'connected' | 'wrapup';
  elapsedSeconds: number;
  talkSeconds: number;
  inboundCallAlert: Call | null;
  startOutboundCall: (phone: string, name?: string, leadId?: number) => Promise<void>;
  answerInboundCall: () => Promise<void>;
  rejectInboundCall: () => Promise<void>;
  hangupCall: () => Promise<void>;
  submitOutcome: (outcome: string, notes: string, followUpDate?: string) => Promise<void>;
  triggerDemoInbound: (phone?: string, name?: string) => Promise<void>;
  dismissModal: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected' | 'wrapup'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [talkSeconds, setTalkSeconds] = useState<number>(0);
  const [inboundCallAlert, setInboundCallAlert] = useState<Call | null>(null);

  const timerRef = useRef<any>(null);

  // Timers management
  useEffect(() => {
    if (callState === 'ringing' || callState === 'connected') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        if (callState === 'connected') {
          setTalkSeconds(prev => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Outbound Call
  const startOutboundCall = async (phone: string, name?: string, leadId?: number) => {
    try {
      const call = await apiRequest<Call>('/calls/initiate', 'POST', {
        customer_number: phone,
        customer_name: name || 'Parent / Student',
        lead_id: leadId
      });
      setActiveCall(call);
      setCallState('ringing');
      setElapsedSeconds(0);
      setTalkSeconds(0);
      refreshUser();

      // In Demo Mode, simulate customer answering after 3.5 seconds
      if (call.is_demo) {
        setTimeout(async () => {
          try {
            const updated = await apiRequest<Call>(`/calls/${call.id}/status`, 'PATCH', {
              status: 'in-progress'
            });
            setActiveCall(updated);
            setCallState('connected');
          } catch (e) {
            console.error("Failed to transition demo call:", e);
          }
        }, 3500);
      }
    } catch (err: any) {
      alert(err.message || 'Call initiation failed');
    }
  };

  // Answer Inbound Call
  const answerInboundCall = async () => {
    if (!inboundCallAlert) return;
    const call = inboundCallAlert;
    setInboundCallAlert(null);
    try {
      const updated = await apiRequest<Call>(`/calls/${call.id}/status`, 'PATCH', {
        status: 'in-progress'
      });
      setActiveCall(updated);
      setCallState('connected');
      setElapsedSeconds(0);
      setTalkSeconds(0);
      refreshUser();
    } catch (e: any) {
      alert(e.message || 'Failed to answer call');
    }
  };

  // Reject Inbound Call
  const rejectInboundCall = async () => {
    if (!inboundCallAlert) return;
    const call = inboundCallAlert;
    setInboundCallAlert(null);
    try {
      await apiRequest<Call>(`/calls/${call.id}/status`, 'PATCH', {
        status: 'busy',
        call_outcome: 'Missed / Rejected'
      });
      refreshUser();
    } catch (e) {
      console.error(e);
    }
  };

  // Hangup call
  const hangupCall = async () => {
    if (!activeCall) return;
    try {
      const updated = await apiRequest<Call>(`/calls/${activeCall.id}/status`, 'PATCH', {
        status: 'completed'
      });
      setActiveCall(updated);
      setCallState('wrapup');
      refreshUser();
    } catch (e: any) {
      alert(e.message || 'Failed to complete call');
      setCallState('wrapup');
    }
  };

  // Submit outcome & notes
  const submitOutcome = async (outcome: string, notes: string, followUpDate?: string) => {
    if (!activeCall) return;
    try {
      await apiRequest<Call>(`/calls/${activeCall.id}/status`, 'PATCH', {
        status: 'completed',
        call_outcome: outcome,
        notes: notes,
        follow_up_date: followUpDate ? new Date(followUpDate).toISOString() : undefined
      });
      setActiveCall(null);
      setCallState('idle');
      setElapsedSeconds(0);
      setTalkSeconds(0);
      refreshUser();
    } catch (e: any) {
      alert(e.message || 'Failed to save call outcome');
    }
  };

  // Demo Inbound Simulator
  const triggerDemoInbound = async (phone?: string, name?: string) => {
    try {
      const call = await apiRequest<Call>('/calls/demo-simulate-inbound', 'POST', {
        customer_phone: phone,
        customer_name: name
      });
      setInboundCallAlert(call);
    } catch (e: any) {
      alert(e.message || 'Demo incoming call simulation failed');
    }
  };

  const dismissModal = () => {
    setActiveCall(null);
    setCallState('idle');
    setElapsedSeconds(0);
    setTalkSeconds(0);
  };

  return (
    <CallContext.Provider
      value={{
        activeCall,
        callState,
        elapsedSeconds,
        talkSeconds,
        inboundCallAlert,
        startOutboundCall,
        answerInboundCall,
        rejectInboundCall,
        hangupCall,
        submitOutcome,
        triggerDemoInbound,
        dismissModal
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within a CallProvider');
  return ctx;
};
