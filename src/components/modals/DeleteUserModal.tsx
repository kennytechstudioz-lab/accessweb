'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteUserModalProps {
  isSingleOpen: boolean;
  isBulkOpen: boolean;
  onCloseSingle: () => void;
  onCloseBulk: () => void;
  onConfirmSingle: () => void;
  onConfirmBulk: () => void;
  deleteTargetUser: any;
  selectedUserCount: number;
  deletingUser: boolean;
}

export default function DeleteUserModal({
  isSingleOpen,
  isBulkOpen,
  onCloseSingle,
  onCloseBulk,
  onConfirmSingle,
  onConfirmBulk,
  deleteTargetUser,
  selectedUserCount,
  deletingUser,
}: DeleteUserModalProps) {
  if (isSingleOpen && deleteTargetUser) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl border border-red-100 w-full max-w-md overflow-hidden animate-slideIn p-6 sm:p-8 flex flex-col gap-6 relative">
          <button 
            onClick={onCloseSingle}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3.5 rounded-full bg-red-100 text-red-600 border border-red-200 animate-pulse">
              <AlertTriangle size={34} />
            </div>
            
            <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
              Delete Account & Purge Data?
            </h3>
            
            <p className="text-xs text-slate-600 font-light leading-relaxed">
              Are you sure you want to permanently delete client account <span className="font-bold text-slate-900">@{deleteTargetUser.username}</span> ({deleteTargetUser.fullName || 'User'})? 
              <br /><br />
              <span className="text-red-600 font-semibold">Warning:</span> All associated multi-currency balances, transactions, cards, and notification records will be permanently purged. <span className="font-bold text-slate-900">This action cannot be undone.</span>
            </p>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onCloseSingle}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deletingUser}
              onClick={onConfirmSingle}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {deletingUser ? 'Purging Data...' : 'Confirm Permanent Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isBulkOpen) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl border border-red-100 w-full max-w-md overflow-hidden animate-slideIn p-6 sm:p-8 flex flex-col gap-6 relative">
          <button 
            onClick={onCloseBulk}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3.5 rounded-full bg-red-100 text-red-600 border border-red-200 animate-pulse">
              <AlertTriangle size={34} />
            </div>
            
            <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
              Delete {selectedUserCount} Selected Accounts?
            </h3>
            
            <p className="text-xs text-slate-600 font-light leading-relaxed">
              Are you sure you want to permanently delete <span className="font-bold text-slate-900">{selectedUserCount} selected client accounts</span>?
              <br /><br />
              <span className="text-red-600 font-semibold">Warning:</span> All associated balances, transactions, cards, and notification records will be purged. <span className="font-bold text-slate-900">This action cannot be undone.</span>
            </p>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onCloseBulk}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deletingUser}
              onClick={onConfirmBulk}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {deletingUser ? 'Deleting...' : 'Confirm Bulk Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
