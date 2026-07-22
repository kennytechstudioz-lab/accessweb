'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Landmark, Users, ArrowRightLeft, ShieldAlert, Clock, Mail } from 'lucide-react';
import { useUsersStore } from '@/store/usersStore';
import { useTransactionsStore } from '@/store/transactionsStore';

export default function AdminPage() {
  const { users, loading: loadingUsers, fetchUsers } = useUsersStore();
  const { transactions, loading: loadingTx, fetchTransactions } = useTransactionsStore();

  useEffect(() => {
    fetchUsers();
    fetchTransactions();
  }, [fetchUsers, fetchTransactions]);

  const loading = (loadingUsers && users.length === 0) || (loadingTx && transactions.length === 0);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Syncing Admin Vaults...</span>
        </div>
      </div>
    );
  }

  // Calculations for stats badges
  const clientUsers = users.filter((u) => u.status === 'User');
  const pendingKYC = clientUsers.filter((u) => u.onReview && !u.isVerified).length;
  const activeTransfers = transactions.filter((t) => t.status === 'Pending').length;
  const suspendedUsers = clientUsers.filter((u) => u.suspended).length;

  // 1. Get 5 most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => b.createdAt ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0)
    .slice(0, 5);

  // 2. Get 5 most recent registered users
  const recentMembers = [...clientUsers]
    .sort((a, b) => b.createdAt ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Executive Control</h2>
        <p className="text-slate-555 text-xs font-light">Overview of bank operations and database records.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-primary/50 transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Clients</span>
            <span className="text-3xl font-extrabold font-mono text-slate-800">{clientUsers.length}</span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-400 rounded-lg group-hover:text-primary transition-colors">
            <Users size={20} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-amber-500/50 transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending KYC Audits</span>
            <span className="text-3xl font-extrabold font-mono text-slate-800">{pendingKYC}</span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-400 rounded-lg group-hover:text-amber-500 transition-colors">
            <Clock size={20} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-red-500/50 transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Transfers</span>
            <span className="text-3xl font-extrabold font-mono text-slate-800">{activeTransfers}</span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-400 rounded-lg group-hover:text-red-550 transition-colors">
            <ArrowRightLeft size={20} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-slate-400 transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Suspended Clients</span>
            <span className="text-3xl font-extrabold font-mono text-slate-800">{suspendedUsers}</span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-400 rounded-lg group-hover:text-red-555 transition-colors">
            <ShieldAlert size={20} />
          </div>
        </div>
      </div>

      {/* Two Sections: Recent Transactions (5 items) & Recent Registered Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Recent Transactions</h3>
            <Link href="/admin/transactions" className="text-xs text-primary hover:underline font-bold">Manage All &rarr;</Link>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-slate-400 text-xs py-8 text-center font-light font-mono">No transaction history logged.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentTransactions.map((tx) => {
                const isDebit = tx.transactionType?.includes('Transfer') || tx.transactionType === 'Debit';
                
                return (
                  <div key={tx._id} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between items-center text-slate-700 hover:bg-slate-100/50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-800">
                        {isDebit ? tx.receiverName || 'External Recipient' : tx.senderName || 'Direct Deposit'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        @{tx.username} | {tx.transactionType}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 font-mono">
                      <span className={`text-xs font-bold ${isDebit ? 'text-red-600' : 'text-emerald-600'}`}>
                        {isDebit ? '-' : '+'}{tx.symbol}{tx.amount?.toLocaleString()} {tx.currency}
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        tx.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        tx.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Recent Registered Members */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Recent Registered Members</h3>
            <Link href="/admin/users" className="text-xs text-primary hover:underline font-bold">Manage All &rarr;</Link>
          </div>

          {recentMembers.length === 0 ? (
            <p className="text-slate-400 text-xs py-8 text-center font-light">No clients registered.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentMembers.map((user) => {
                const createdDate = user.createdAt ? new Date(user.createdAt) : null;
                const regTime = createdDate ? createdDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A';
                
                return (
                  <div key={user._id} className="bg-slate-55 border border-slate-100 p-4 rounded-xl flex justify-between items-center text-slate-700 hover:bg-slate-100/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs uppercase text-slate-700 shadow-inner">
                        {user.fullName ? user.fullName[0] : user.username[0]}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-850">
                          {user.fullName || user.username}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          @{user.username} | {user.email}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] text-slate-450 font-mono font-medium uppercase">Joined {regTime}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        user.suspended ? 'bg-red-50 text-red-650' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {user.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
