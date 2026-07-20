'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Landmark, Users, ArrowRightLeft, ShieldAlert, Clock } from 'lucide-react';
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

  const clientUsers = users.filter((u) => u.status === 'User');
  const pendingKYC = clientUsers.filter((u) => u.onReview && !u.isVerified).length;
  const activeTransfers = transactions.filter((t) => t.status === 'Pending').length;
  const suspendedUsers = clientUsers.filter((u) => u.suspended).length;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Executive Control</h2>
        <p className="text-slate-550 text-xs font-light">Overview of bank operations and database records.</p>
      </div>

      {/* Metrics Row (White cards with slate borders) */}
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

      {/* Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Clearance Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Pending Wire Clearances</h3>
            <Link href="/admin/transactions" className="text-xs text-primary hover:underline font-bold">Manage All</Link>
          </div>

          {transactions.filter((t) => t.status === 'Pending').length === 0 ? (
            <p className="text-slate-400 text-xs py-8 text-center">No pending wire clearances queue.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {transactions
                .filter((t) => t.status === 'Pending')
                .slice(0, 4)
                .map((tx) => (
                  <div key={tx._id} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between items-center text-slate-700">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-800">{tx.senderName} &rarr; {tx.receiverName}</span>
                      <span className="text-[10px] text-slate-400">{tx.receiverBank} | Ref ID: {tx._id.substring(0, 8)}...</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-800">
                      {tx.symbol}{tx.amount.toLocaleString()} {tx.currency}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Pending KYC Documents Reviews */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">KYC Verification Reviews</h3>
            <Link href="/admin/users" className="text-xs text-primary hover:underline font-bold">Manage All</Link>
          </div>

          {clientUsers.filter((u) => u.onReview && !u.isVerified).length === 0 ? (
            <p className="text-slate-400 text-xs py-8 text-center animate-pulse font-light">No pending identity audits.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {clientUsers
                .filter((u) => u.onReview && !u.isVerified)
                .slice(0, 4)
                .map((user) => (
                  <div key={user._id} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between items-center text-slate-700">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-800">{user.fullName}</span>
                      <span className="text-[10px] text-slate-400">Uploaded document: {user.passport}</span>
                    </div>
                    <Link href="/admin/users" className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-3.5 py-1.5 rounded transition-all">
                      Audit
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
