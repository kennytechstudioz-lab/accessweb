'use client';

import React from 'react';
import { Key, X } from 'lucide-react';

interface TacVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  tacCode: string;
  setTacCode: (code: string) => void;
  onRequestTacCode: () => void;
  requestingTac: boolean;
  loading: boolean;
}

export default function TacVerificationModal({
  isOpen,
  onClose,
  onSubmit,
  tacCode,
  setTacCode,
  onRequestTacCode,
  requestingTac,
  loading,
}: TacVerificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full flex flex-col gap-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 bg-primary/10 text-primary rounded-full">
            <Key size={26} />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">TAC Code Verification</h3>
          <p className="text-xs text-slate-500 font-light leading-relaxed">
            A <b>Transaction Authorization Code (TAC)</b> clearance is required to complete this transfer.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-500 font-light">Don't have a TAC code?</span>
          <button
            type="button"
            disabled={requestingTac}
            onClick={onRequestTacCode}
            className="text-primary font-bold hover:underline cursor-pointer text-xs disabled:opacity-50"
          >
            {requestingTac ? 'Requesting...' : 'Request TAC Code'}
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-xs">
            <label className="font-bold text-slate-700 uppercase text-[10px]">Transaction Authorization Code (TAC)</label>
            <input
              type="text"
              required
              autoFocus
              value={tacCode}
              onChange={(e) => setTacCode(e.target.value)}
              placeholder="Enter 5-digit TAC code"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold tracking-widest text-center focus:outline-none focus:border-primary text-slate-800"
            />
          </div>

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
              disabled={loading || !tacCode.trim()}
              className="flex-1 py-3 bg-primary hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-all cursor-pointer disabled:bg-slate-300"
            >
              {loading ? 'Submitting...' : 'Submit & Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
