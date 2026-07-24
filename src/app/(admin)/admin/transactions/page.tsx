'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, Search, Check, X, DollarSign, Send, Plus } from 'lucide-react';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useToastStore } from '@/store/toastStore';
import { api } from '@/util/api';

import DeclineTransferModal from '@/components/modals/DeclineTransferModal';

export default function TransactionsAdminPage() {
  const { transactions, loading, fetchTransactions } = useTransactionsStore();
  const { showToast } = useToastStore();

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  // Decline Transfer Modal state
  const [selectedTxToDecline, setSelectedTxToDecline] = useState<any>(null);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [submittingDecline, setSubmittingDecline] = useState(false);

  const [depositForm, setDepositForm] = useState({
    username: '',
    amount: '',
    currency: 'USD',
    description: 'Bank Deposit Desk Credit',
  });

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleResolveTransaction = async (id: string, statusValue: 'Approved' | 'Declined') => {
    setActionLoadingId(id);

    try {
      await api.put(`/admin/transactions/${id}/resolve`, { status: statusValue });
      showToast(`Transaction reference ${id} has been ${statusValue === 'Approved' ? 'approved & cleared' : 'declined & refunded'}.`, 'success');
      fetchTransactions();
    } catch (err: any) {
      showToast(err.message || 'Error occurred.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenDeclineModal = (tx: any) => {
    setSelectedTxToDecline(tx);
    setIsDeclineModalOpen(true);
  };

  const handleConfirmDecline = async (reason: string) => {
    if (!selectedTxToDecline) return;
    setSubmittingDecline(true);

    try {
      await api.put(`/admin/transactions/${selectedTxToDecline._id}/resolve`, {
        status: 'Declined',
        reason,
      });
      showToast(`Transfer reference ${selectedTxToDecline._id} has been declined and refunded back to user @${selectedTxToDecline.username}'s account.`, 'success');
      setIsDeclineModalOpen(false);
      setSelectedTxToDecline(null);
      fetchTransactions();
    } catch (err: any) {
      showToast(err.message || 'Error declining transaction.', 'error');
    } finally {
      setSubmittingDecline(false);
    }
  };

  const handleCustomDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDeposit(true);

    try {
      await api.post('/admin/transactions/deposit', depositForm);
      showToast(`Successfully credited ${depositForm.amount} ${depositForm.currency} to user @${depositForm.username}.`, 'success');
      
      setDepositForm({
        username: '',
        amount: '',
        currency: 'USD',
        description: 'Bank Deposit Desk Credit',
      });
      setIsDepositModalOpen(false);
      fetchTransactions();
    } catch (err: any) {
      showToast(err.message || 'Error processing manual deposit.', 'error');
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const filteredTx = transactions.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.username?.toLowerCase().includes(q) ||
      t.transactionType?.toLowerCase().includes(q) ||
      t.receiverName?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q) ||
      t._id?.includes(q)
    );
  });

  if (loading && transactions.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-505 text-xs font-semibold uppercase tracking-wider">Syncing Ledger Records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header bar with Action Button */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Transactions Desk</h2>
          <p className="text-slate-555 text-xs font-light">Approve pending client dispatches or credit accounts manually.</p>
        </div>
        <button
          onClick={() => setIsDepositModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-3 rounded-lg flex items-center gap-2 shadow-md transition-all cursor-pointer animate-fadeIn"
        >
          <Plus size={16} />
          <span>Direct Deposit</span>
        </button>
      </div>

      {/* Search Header panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions ledger..."
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary font-mono"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Total logs found: <span className="font-bold text-slate-800">{filteredTx.length}</span>
        </div>
      </div>

      {/* Main Full Width Transactions Table (White Card) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {filteredTx.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center font-light font-mono">No transaction records logged.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100">
                  <th className="pb-3 text-slate-400 w-12">S/N</th>
                  <th className="pb-3 text-slate-400">Client</th>
                  <th className="pb-3 text-slate-400">Ref ID & Type</th>
                  <th className="pb-3 text-slate-400">Recipient/Sender</th>
                  <th className="pb-3 text-slate-400">Status</th>
                  <th className="pb-3 text-slate-400">Amount</th>
                  <th className="pb-3 text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTx.map((tx, idx) => {
                  const isDebit = tx.transactionType.includes('Transfer') || tx.transactionType === 'Debit';
                  return (
                    <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-4 font-bold text-slate-800 font-mono">@{tx.username}</td>
                      <td className="py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-700">{tx.transactionType}</span>
                          <span className="text-[9px] text-slate-400 font-mono">Ref: {tx._id.substring(0, 10)}</span>
                        </div>
                      </td>
                      <td className="py-4 text-slate-600 font-sans">
                        {isDebit ? tx.receiverName || 'External Account' : tx.senderName || 'Deposit Desk'}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          tx.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          tx.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          'bg-red-50 text-red-650 border border-red-200'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`py-4 font-mono font-bold ${
                        isDebit ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {isDebit ? '-' : '+'}{tx.symbol}{tx.amount.toLocaleString()} {tx.currency}
                      </td>
                      <td className="py-4 text-right text-slate-550 font-semibold font-mono">
                        {tx.status === 'Pending' ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              disabled={actionLoadingId === tx._id}
                              onClick={() => handleResolveTransaction(tx._id, 'Approved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1 rounded transition-all cursor-pointer disabled:bg-slate-100"
                              title="Approve & Dispatch"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              disabled={actionLoadingId === tx._id}
                              onClick={() => handleOpenDeclineModal(tx)}
                              className="bg-red-650 hover:bg-red-750 text-white font-bold p-1 rounded transition-all cursor-pointer disabled:bg-slate-100"
                              title="Decline & Refund Account"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span>RESOLVED</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual direct deposit modal popup */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-slideIn">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <DollarSign size={18} className="text-primary" />
                <span>Inject Account Deposit Credit</span>
              </h3>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="text-slate-400 hover:text-slate-655 cursor-pointer p-1 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCustomDeposit}>
              <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                <p className="text-xs font-light text-slate-500 leading-relaxed">
                  Manually inject approved funds directly to any client account. This bypasses transfer clearances and updates user account available balances instantly.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-650 uppercase">Recipient Username</label>
                  <input
                    type="text"
                    required
                    value={depositForm.username}
                    onChange={(e) => setDepositForm({ ...depositForm, username: e.target.value })}
                    placeholder="Enter client username"
                    className="border border-slate-200 rounded px-3.5 py-2.5 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase">Currency</label>
                    <select
                      value={depositForm.currency}
                      onChange={(e) => setDepositForm({ ...depositForm, currency: e.target.value })}
                      className="border border-slate-200 rounded px-2.5 py-2.5 text-xs bg-slate-50 text-slate-750 focus:outline-none focus:border-primary font-semibold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-650 uppercase">Deposit Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                      placeholder="0.00"
                      className="border border-slate-200 rounded px-3.5 py-2.5 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-650 uppercase">Transaction Description</label>
                  <input
                    type="text"
                    required
                    value={depositForm.description}
                    onChange={(e) => setDepositForm({ ...depositForm, description: e.target.value })}
                    placeholder="e.g. Wire Transfer Credit Adjustment"
                    className="border border-slate-200 rounded px-3.5 py-2.5 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2.5 rounded border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDeposit}
                  className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-2.5 rounded shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send size={12} />
                  <span>{submittingDeposit ? 'Crediting...' : 'Inject Credit'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Decline Transfer Modal with optional reason textarea & auto-refund */}
      <DeclineTransferModal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        onConfirmDecline={handleConfirmDecline}
        transaction={selectedTxToDecline}
        submitting={submittingDecline}
      />

    </div>
  );
}
