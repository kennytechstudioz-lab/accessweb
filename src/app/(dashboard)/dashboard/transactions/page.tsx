'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, ArrowDownLeft, ArrowUpRight, Search, Landmark, Calendar, Filter } from 'lucide-react';
import { api } from '@/util/api';

export default function UserTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

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
    const matchesSearch =
      tx.txHash?.toLowerCase().includes(search.toLowerCase()) ||
      tx.sender?.toLowerCase().includes(search.toLowerCase()) ||
      tx.receiver?.toLowerCase().includes(search.toLowerCase()) ||
      tx.type?.toLowerCase().includes(search.toLowerCase());
    
    if (filterType === 'ALL') return matchesSearch;
    if (filterType === 'CREDIT') return matchesSearch && (tx.type === 'Credit' || tx.type === 'Deposit');
    if (filterType === 'DEBIT') return matchesSearch && (tx.type === 'Debit' || tx.type === 'Transfer');
    return matchesSearch;
  });

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
                  const isCredit = tx.type === 'Credit' || tx.type === 'Deposit';
                  const dateDisplay = tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A';

                  return (
                    <tr key={tx._id || tx.txHash} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <span className="font-bold text-slate-800">{tx.type || 'Transfer'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-600">
                        {tx.txHash || tx._id || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {isCredit ? tx.sender || 'System Deposit' : tx.receiver || 'External Wire'}
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-light text-[11px]">
                        {dateDisplay}
                      </td>
                      <td className={`py-4 px-6 text-right font-extrabold text-sm font-mono ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isCredit ? '+' : '-'}${Math.abs(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'Completed' || tx.status === 'Approved' || tx.status === 'Successful'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tx.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {tx.status || 'Completed'}
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
    </div>
  );
}
