'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface SuspensionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetUser: any;
  togglingSuspension: boolean;
}

export default function SuspensionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  targetUser,
  togglingSuspension,
}: SuspensionConfirmModalProps) {
  if (!isOpen || !targetUser) return null;

  const isSuspending = !targetUser.suspended;

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
          <div className={`p-3.5 rounded-full ${
            isSuspending ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
          }`}>
            <AlertTriangle size={30} />
          </div>
          
          <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
            {isSuspending ? 'Suspend Client Account?' : 'Reactivate Client Account?'}
          </h3>
          
          <p className="text-xs text-slate-600 font-light leading-relaxed">
            {isSuspending ? (
              <>Are you sure you want to suspend <span className="font-bold text-slate-900">@{targetUser.username}</span> ({targetUser.fullName || 'User'})? The user will be blocked from logging into their dashboard and executing wire transfers.</>
            ) : (
              <>Are you sure you want to reactivate access for <span className="font-bold text-slate-900">@{targetUser.username}</span> ({targetUser.fullName || 'User'})? Full dashboard clearance will be restored.</>
            )}
          </p>
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
            type="button"
            disabled={togglingSuspension}
            onClick={onConfirm}
            className={`flex-1 py-3 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 ${
              isSuspending ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
            }`}
          >
            {togglingSuspension ? 'Updating Status...' : isSuspending ? 'Confirm Suspension' : 'Confirm Reactivation'}
          </button>
        </div>
      </div>
    </div>
  );
}
