'use client';

import React from 'react';
import { ArrowRightLeft, X, Sparkles } from 'lucide-react';

interface InjectTxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedTxUser: any;
  txForm: any;
  setTxForm: React.Dispatch<React.SetStateAction<any>>;
  submittingTx: boolean;
}

export default function InjectTxModal({
  isOpen,
  onClose,
  onSubmit,
  selectedTxUser,
  txForm,
  setTxForm,
  submittingTx,
}: InjectTxModalProps) {
  if (!isOpen || !selectedTxUser) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-slideIn">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-emerald-400" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide">
              Manual Custom Transaction Injection
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Target Client Banner */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-semibold uppercase text-[10px]">Target Account</span>
          <span className="font-extrabold text-slate-800">
            {selectedTxUser.fullName || selectedTxUser.username} (@{selectedTxUser.username})
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit}>
          <div className="p-6 flex flex-col gap-4 text-xs max-h-[70vh] overflow-y-auto">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Transaction Type</label>
                <select
                  value={txForm.transactionType}
                  onChange={(e) => setTxForm({ ...txForm, transactionType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-primary text-slate-800"
                >
                  <option value="Credit">Credit (Deposit / Inward Transfer)</option>
                  <option value="Debit">Debit (Withdrawal / Outward Transfer)</option>
                  <option value="Internal-Transfer">Internal Transfer</option>
                  <option value="Local-Transfer">Local Bank Transfer</option>
                  <option value="Wire-Transfer">International Wire Transfer</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Currency</label>
                <select
                  value={txForm.currency}
                  onChange={(e) => setTxForm({ ...txForm, currency: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-primary text-slate-800 font-mono"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="BTC">BTC (₿)</option>
                  <option value="ETH">ETH (Ξ)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Amount</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono font-bold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Transaction Status</label>
                <select
                  value={txForm.status}
                  onChange={(e) => setTxForm({ ...txForm, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-primary text-slate-800"
                >
                  <option value="Approved">Approved / Completed</option>
                  <option value="Pending">Pending Audit</option>
                  <option value="Failed">Failed / Declined</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Sender Name (Origin)</label>
                <input
                  type="text"
                  value={txForm.senderName}
                  onChange={(e) => setTxForm({ ...txForm, senderName: e.target.value })}
                  placeholder="System / Bank Desk / External"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Receiver Name (Destination)</label>
                <input
                  type="text"
                  value={txForm.receiverName}
                  onChange={(e) => setTxForm({ ...txForm, receiverName: e.target.value })}
                  placeholder="Beneficiary Name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Receiver Bank Name</label>
                <input
                  type="text"
                  value={txForm.receiverBank}
                  onChange={(e) => setTxForm({ ...txForm, receiverBank: e.target.value })}
                  placeholder="Access National Bank"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Receiver Account Number</label>
                <input
                  type="text"
                  value={txForm.receiverAccountNumber}
                  onChange={(e) => setTxForm({ ...txForm, receiverAccountNumber: e.target.value })}
                  placeholder="10-digit account no"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono font-bold focus:outline-none focus:border-primary text-slate-800"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700 uppercase text-[10px]">Custom Reference Note / Description</label>
              <input
                type="text"
                value={txForm.description}
                onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                placeholder="e.g. Dividend Payout / Custom Wire Clearance"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingTx || !txForm.amount}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:bg-slate-300 flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>{submittingTx ? 'Injecting Ledger Record...' : 'Inject Transaction'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
