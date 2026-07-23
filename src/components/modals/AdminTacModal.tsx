'use client';

import React from 'react';
import { Key, X } from 'lucide-react';

interface AdminTacModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  adminTacCode: string;
  setAdminTacCode: (code: string) => void;
  savingTacCode: boolean;
  targetUser: any;
  selectedUserCount: number;
}

export default function AdminTacModal({
  isOpen,
  onClose,
  onSubmit,
  adminTacCode,
  setAdminTacCode,
  savingTacCode,
  targetUser,
  selectedUserCount,
}: AdminTacModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-slideIn p-6 sm:p-8 flex flex-col gap-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3.5 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
            <Key size={30} />
          </div>
          
          <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
            Set / Approve TAC Code
          </h3>
          
          <p className="text-xs text-slate-600 font-light leading-relaxed">
            Set or approve the <b>Transaction Authorization Code (TAC)</b> for {selectedUserCount > 0 ? `${selectedUserCount} selected client(s)` : `@${targetUser?.username || 'user'}`}. An approval notification containing the code will be dispatched automatically.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-xs">
            <label className="font-bold text-slate-700 uppercase text-[10px]">TAC Clearance Code</label>
            <input
              type="text"
              required
              autoFocus
              value={adminTacCode}
              onChange={(e) => setAdminTacCode(e.target.value)}
              placeholder="Enter 5-digit TAC Code (e.g. 84920)"
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
              disabled={savingTacCode || !adminTacCode.trim()}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {savingTacCode ? 'Saving...' : 'Save & Approve'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
