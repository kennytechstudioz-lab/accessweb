'use client';

import React from 'react';
import { Landmark, X, Save, Ban, Check, ShieldCheck } from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: any;
  editForm: any;
  setEditForm: React.Dispatch<React.SetStateAction<any>>;
  selectedUserAccounts: any[];
  accountBalances: Record<string, number>;
  setAccountBalances: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onSaveDetails: (e: React.FormEvent) => void;
  onSaveBalances: (e: React.FormEvent) => void;
  onToggleSuspensionFromModal: (status: boolean) => void;
  onToggleKycFromModal: (status: boolean) => void;
}

export default function UserDetailModal({
  isOpen,
  onClose,
  selectedUser,
  editForm,
  setEditForm,
  selectedUserAccounts,
  accountBalances,
  setAccountBalances,
  onSaveDetails,
  onSaveBalances,
  onToggleSuspensionFromModal,
  onToggleKycFromModal,
}: UserDetailModalProps) {
  if (!isOpen || !selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-slideIn">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
              {selectedUser.fullName ? selectedUser.fullName[0] : 'U'}
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide">
                {selectedUser.fullName || selectedUser.username}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                @{selectedUser.username} | Account: {selectedUser.accountNumber || 'N/A'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
          
          {/* Quick Actions Bar */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                selectedUser.suspended ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {selectedUser.suspended ? 'Suspended Account' : 'Active Account'}
              </span>

              <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                selectedUser.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {selectedUser.isVerified ? 'KYC Verified' : 'KYC Unverified'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleSuspensionFromModal(!selectedUser.suspended)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedUser.suspended 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {selectedUser.suspended ? <Check size={14} /> : <Ban size={14} />}
                <span>{selectedUser.suspended ? 'Unsuspend' : 'Suspend'}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleKycFromModal(!selectedUser.isVerified)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck size={14} />
                <span>{selectedUser.isVerified ? 'Revoke KYC' : 'Approve KYC'}</span>
              </button>
            </div>
          </div>

          {/* Section 1: User Profile Details Edit */}
          <form onSubmit={onSaveDetails} className="flex flex-col gap-4">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
              Client Demographic & Clearance Profile
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Country</label>
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Transaction PIN</label>
                <input
                  type="text"
                  value={editForm.pin}
                  onChange={(e) => setEditForm({ ...editForm, pin: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">TAC Code</label>
                <input
                  type="text"
                  value={editForm.tacCode}
                  onChange={(e) => setEditForm({ ...editForm, tacCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
              >
                <Save size={14} />
                <span>Save Profile Info</span>
              </button>
            </div>
          </form>

          {/* Section 2: Multi-Currency Account Balances Adjustment */}
          <form onSubmit={onSaveBalances} className="flex flex-col gap-4 border-t border-slate-100 pt-5">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <Landmark size={14} className="text-primary" />
              Adjust Account Balances
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {selectedUserAccounts.map((acc) => (
                <div key={acc.currency} className="flex flex-col gap-1 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="font-bold text-slate-700 uppercase text-[10px] flex justify-between">
                    <span>{acc.currency} Wallet</span>
                    <span className="text-primary font-mono">{acc.symbol}</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={accountBalances[acc.currency] !== undefined ? accountBalances[acc.currency] : acc.balance}
                    onChange={(e) => setAccountBalances({ ...accountBalances, [acc.currency]: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
              >
                <Save size={14} />
                <span>Update Account Balances</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
