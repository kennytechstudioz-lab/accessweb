'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, ArrowRightLeft, Loader2, Ban } from 'lucide-react';

interface DeclineTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDecline: (reason: string) => void;
  transaction: any;
  submitting?: boolean;
}

export default function DeclineTransferModal({
  isOpen,
  onClose,
  onConfirmDecline,
  transaction,
  submitting = false,
}: DeclineTransferModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmDecline(reason);
  };

  const isWire = transaction.transactionType === 'Wire-Transfer';
  const typeLabel = isWire ? 'International Wire Transfer' : 'Local Bank Transfer';

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-slideIn flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-rose-950 text-white px-5 py-4 border-b border-rose-900 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
              <ShieldAlert size={18} />
            </div>
            <h3 className="font-extrabold text-sm uppercase tracking-wide">
              Decline Transfer Clearance
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1 text-slate-400 hover:text-white transition-colors rounded-lg cursor-pointer hover:bg-rose-900 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">
          
          {/* Transaction Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2 font-mono">
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-200 pb-1.5 uppercase">
              <span className="flex items-center gap-1">
                <ArrowRightLeft size={12} className="text-primary" />
                {typeLabel}
              </span>
              <span className="text-slate-700">@{transaction.username}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-sans">Transfer Amount:</span>
              <span className="text-sm font-black text-rose-600">
                {transaction.symbol || '$'}{transaction.amount ? transaction.amount.toLocaleString() : '0'} {transaction.currency || 'USD'}
              </span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-600 font-sans">
              <span className="text-slate-400">Recipient:</span>
              <span className="font-semibold truncate max-w-[200px]">
                {transaction.receiverName || 'External Account'} ({transaction.receiverBank || 'Bank'})
              </span>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-[11px] leading-relaxed font-light">
            Declining this transfer will mark it as <strong className="font-bold uppercase text-amber-900">Declined</strong> and automatically refund the debited amount back to client <strong className="font-bold">@{transaction.username}</strong>'s available balance.
          </div>

          {/* Decline Reason Textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700 uppercase text-[10px] flex justify-between">
              <span>Reason for declining</span>
              <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Write reason for declining (e.g. Account name mismatch, AML security review)..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary resize-none font-sans"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Declining & Refund...</span>
                </>
              ) : (
                <>
                  <Ban size={14} />
                  <span>Decline & Refund Account</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
