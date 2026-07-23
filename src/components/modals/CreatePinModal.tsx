'use client';

import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface CreatePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newPin: string;
  setNewPin: (pin: string) => void;
  confirmNewPin: string;
  setConfirmNewPin: (pin: string) => void;
  loading: boolean;
}

export default function CreatePinModal({
  isOpen,
  onClose,
  onSubmit,
  newPin,
  setNewPin,
  confirmNewPin,
  setConfirmNewPin,
  loading,
}: CreatePinModalProps) {
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

        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
            <ShieldCheck size={28} />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">Create Transaction PIN</h3>
          <p className="text-xs text-slate-500 font-light leading-relaxed">
            You have not created a Transaction PIN yet. Please create a 6-digit PIN to authorize this transfer and protect your account.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700 uppercase text-[10px]">Create 6-Digit PIN</label>
            <input
              type="password"
              required
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Enter 6-digit PIN"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs font-mono font-bold tracking-widest focus:outline-none focus:border-primary text-slate-800"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700 uppercase text-[10px]">Confirm 6-Digit PIN</label>
            <input
              type="password"
              required
              maxLength={6}
              value={confirmNewPin}
              onChange={(e) => setConfirmNewPin(e.target.value)}
              placeholder="Re-enter 6-digit PIN"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs font-mono font-bold tracking-widest focus:outline-none focus:border-primary text-slate-800"
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
              disabled={loading}
              className="flex-1 py-3 bg-primary hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-all cursor-pointer disabled:bg-slate-300"
            >
              {loading ? 'Creating PIN...' : 'Save PIN & Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
