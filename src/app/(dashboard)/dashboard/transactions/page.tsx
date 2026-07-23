'use client';

import React, { useEffect, useState } from 'react';
import { 
  ArrowRightLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Landmark, 
  Filter,
  X,
  User,
  Building,
  CheckCircle2,
  Clock,
  XCircle,
  FileText
} from 'lucide-react';
import { api } from '@/util/api';

import TransactionDetailModal from '@/components/modals/TransactionDetailModal';

export default function UserTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await api.get('/user/transactions');
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching user transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filtered = transactions.filter((tx) => {
    const typeStr = tx.transactionType || tx.type || '';
    const senderStr = tx.senderName || tx.sender || '';
    const receiverStr = tx.receiverName || tx.receiver || '';
    const idStr = tx._id || tx.txHash || '';

    const matchesSearch =
      idStr.toLowerCase().includes(search.toLowerCase()) ||
      senderStr.toLowerCase().includes(search.toLowerCase()) ||
      receiverStr.toLowerCase().includes(search.toLowerCase()) ||
      typeStr.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterType === 'ALL') return true;
    if (filterType === 'CREDIT') return typeStr === 'Credit' || typeStr === 'Deposit';
    if (filterType === 'DEBIT') return typeStr.includes('Transfer') || typeStr === 'Debit';
    return true;
  });

  const getFormatDate = (tx: any) => {
    if (tx.createdAt) return new Date(tx.createdAt).toLocaleString();
    if (tx.dateCreated) return tx.dateCreated;
    if (tx.time) {
      const t = typeof tx.time === 'number' && tx.time < 10000000000 ? tx.time * 1000 : tx.time;
      return new Date(t).toLocaleString();
    }
    return 'N/A';
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Transaction Ledger</h1>
          <p className="text-slate-500 text-xs font-light">Real-time financial activity and wire transfer logs.</p>
        </div>
        <a
          href="/dashboard/transfer"
          className="bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-colors flex items-center gap-2"
        >
          <ArrowRightLeft size={16} />
          <span>New Wire Transfer</span>
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, sender, receiver..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-slate-400" />
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${filterType === 'ALL' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('CREDIT')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${filterType === 'CREDIT' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Credits
            </button>
            <button
              onClick={() => setFilterType('DEBIT')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${filterType === 'DEBIT' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Debits
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Landmark size={36} className="animate-spin text-primary" />
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Syncing Ledger Activity...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <ArrowRightLeft size={36} className="text-slate-300" />
            <span className="text-sm font-bold text-slate-700">No Transactions Found</span>
            <p className="text-xs text-slate-400 max-w-sm">No transaction records match your search or filter requirements.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Transaction ID / Reference</th>
                  <th className="py-3.5 px-6">Sender / Recipient</th>
                  <th className="py-3.5 px-6">Date & Time</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((tx: any) => {
                  const txType = tx.transactionType || tx.type || 'Transfer';
                  const isCredit = txType === 'Credit' || txType === 'Deposit';
                  const sender = tx.senderName || tx.sender || 'System Deposit';
                  const receiver = tx.receiverName || tx.receiver || 'External Account';
                  const status = tx.status || 'Approved';

                  return (
                    <tr 
                      key={tx._id || tx.txHash || Math.random()} 
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <span className="font-bold text-slate-800">{txType}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-600">
                        {tx._id || tx.txHash || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {isCredit ? sender : receiver}
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-light text-[11px]">
                        {getFormatDate(tx)}
                      </td>
                      <td className={`py-4 px-6 text-right font-extrabold text-sm font-mono ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isCredit ? '+' : '-'}{tx.symbol || '$'}{Math.abs(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          status === 'Completed' || status === 'Approved' || status === 'Successful'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal Popup */}
      <TransactionDetailModal 
        selectedTx={selectedTx} 
        onClose={() => setSelectedTx(null)} 
        getFormatDate={getFormatDate} 
      />
    </div>
  );
}
