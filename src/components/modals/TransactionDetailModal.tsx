'use client';

import React from 'react';
import { 
  FileText, 
  X, 
  CheckCircle2, 
  Clock, 
  XCircle 
} from 'lucide-react';

interface TransactionDetailModalProps {
  selectedTx: any;
  onClose: () => void;
  getFormatDate: (tx: any) => string;
}

export default function TransactionDetailModal({
  selectedTx,
  onClose,
  getFormatDate,
}: TransactionDetailModalProps) {
  if (!selectedTx) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide">Transaction Receipt</h3>
              <p className="text-[11px] text-slate-400 font-mono">{selectedTx._id || selectedTx.txHash || 'N/A'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
          {/* Amount Display */}
          <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-100 gap-1.5 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {selectedTx.transactionType || selectedTx.type || 'Transaction'} Amount
            </span>
            <div className="text-3xl font-extrabold font-mono text-slate-900">
              {selectedTx.symbol || '$'}{Math.abs(selectedTx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-xs text-slate-400 ml-1 font-sans">{selectedTx.currency || 'USD'}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {(selectedTx.status === 'Approved' || selectedTx.status === 'Completed' || selectedTx.status === 'Successful') ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                  <CheckCircle2 size={12} /> Approved
                </span>
              ) : selectedTx.status === 'Pending' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                  <Clock size={12} /> Pending
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                  <XCircle size={12} /> {selectedTx.status || 'Failed'}
                </span>
              )}
            </div>
          </div>

          {/* Transaction Properties Grid */}
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Transaction Type</span>
              <span className="font-bold text-slate-800">{selectedTx.transactionType || selectedTx.type || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Date & Time</span>
              <span className="font-bold text-slate-800">{getFormatDate(selectedTx)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Sender Name</span>
              <span className="font-bold text-slate-800">{selectedTx.senderName || selectedTx.sender || 'System Deposit'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Recipient Name</span>
              <span className="font-bold text-slate-800">{selectedTx.receiverName || selectedTx.receiver || 'N/A'}</span>
            </div>

            {selectedTx.receiverAccountNumber && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Recipient Account No.</span>
                <span className="font-bold font-mono text-slate-800">{selectedTx.receiverAccountNumber}</span>
              </div>
            )}

            {selectedTx.receiverBank && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Bank Name</span>
                <span className="font-bold text-slate-800">{selectedTx.receiverBank}</span>
              </div>
            )}

            {selectedTx.swiftCode && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">SWIFT / BIC Code</span>
                <span className="font-bold font-mono text-slate-800">{selectedTx.swiftCode}</span>
              </div>
            )}

            {selectedTx.routineNumber && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Routing Number</span>
                <span className="font-bold font-mono text-slate-800">{selectedTx.routineNumber}</span>
              </div>
            )}

            {selectedTx.receiverAddress && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Recipient Address</span>
                <span className="font-bold text-slate-800">{selectedTx.receiverAddress}</span>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
