'use client';

import React from 'react';
import { Lock, X } from 'lucide-react';

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  enteredPin: string;
  setEnteredPin: (pin: string) => void;
  amount: string;
  recipientName: string;
  loading: boolean;
}

export default function PinVerificationModal({
  isOpen,
  onClose,
  onSubmit,
  enteredPin,
  setEnteredPin,
  amount,
  recipientName,
  loading,
}: PinVerificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full flex flex-col gap-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 bg-red-50 text-primary rounded-full">
            <Lock size={24} />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">Authorize Transaction</h3>
          <p className="text-xs text-slate-500 font-light leading-relaxed">
            Enter your 6-digit Transaction PIN to complete sending <span className="font-bold text-slate-900">${amount}</span> to <span className="font-bold text-slate-900">{recipientName}</span>.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            required
            autoFocus
            maxLength={6}
            value={enteredPin}
            onChange={(e) => setEnteredPin(e.target.value)}
            placeholder="Enter 6-digit PIN"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold tracking-widest text-center focus:outline-none focus:border-primary text-slate-800"
          />

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !enteredPin}
              className="flex-1 py-3 bg-primary hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-all cursor-pointer disabled:bg-slate-300"
            >
              {loading ? 'Authorizing...' : 'Authorize & Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
