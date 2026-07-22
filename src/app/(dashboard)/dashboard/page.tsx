'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Landmark, 
  ArrowRightLeft, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Wifi 
} from 'lucide-react';

export default function DashboardOverview() {
  const [profile, setProfile] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      // Fetch Profile
      const profileRes = await fetch(`${apiUrl}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      setProfile(profileData);

      // Fetch Accounts
      const accountsRes = await fetch(`${apiUrl}/user/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const accountsData = await accountsRes.json();
      setAccounts(accountsData);

      // Fetch Transactions
      const txRes = await fetch(`${apiUrl}/user/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const txData = await txRes.json();
      setTransactions(txData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const debitCards = [
    {
      id: 'gold',
      name: 'Obsidian Gold Debit',
      category: 'VISA PLATINUM',
      bg: 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-950',
      border: 'border-amber-400/30',
      textColor: 'text-amber-100',
      brand: 'VISA',
      cardNumber: '4829 •••• •••• 9012',
      holder: profile?.fullName || 'ACCESS CARDHOLDER',
      expiry: '12/28',
    },
    {
      id: 'red',
      name: 'Access Signature Red',
      category: 'WORLD MASTERCARD',
      bg: 'bg-gradient-to-br from-red-600 via-red-800 to-slate-950',
      border: 'border-red-500/30',
      textColor: 'text-red-100',
      brand: 'Mastercard',
      cardNumber: '5399 •••• •••• 4410',
      holder: profile?.fullName || 'ACCESS CARDHOLDER',
      expiry: '09/29',
    },
    {
      id: 'black',
      name: 'Executive Titanium Black',
      category: 'AMEX DIAMOND VAULT',
      bg: 'bg-gradient-to-br from-slate-900 via-zinc-900 to-black',
      border: 'border-slate-700',
      textColor: 'text-slate-200',
      brand: 'AMEX',
      cardNumber: '3782 •••••• 88301',
      holder: profile?.fullName || 'ACCESS CARDHOLDER',
      expiry: '04/30',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Loading Ledger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. KYC Warning banner if not verified */}
      {profile && !profile.isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-[10px] py-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-3 items-start">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm sm:text-base">Identity Verification Required</h4>
              <p className="text-xs sm:text-sm text-amber-700 font-light mt-0.5 leading-relaxed">
                Your online banking vault is partially active. Upload valid identity clearance documents to complete verification and clear international transfers.
              </p>
            </div>
          </div>
          <Link href="/dashboard/kyc" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded shadow transition-all flex-shrink-0">
            Submit KYC
          </Link>
        </div>
      )}

      {/* 2. Account Metric Cards (Multi-currency grid) */}
      <div>
        <h3 className="font-bold text-slate-800 text-base uppercase tracking-wider mb-4">Multi-Currency Accounts</h3>
        <div className="flex overflow-x-auto gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 pb-2 snap-x snap-mandatory scrollbar-thin">
          {accounts.map((acc) => (
            <div 
              key={acc._id} 
              className="min-w-[260px] sm:min-w-0 snap-start flex-shrink-0 sm:flex-shrink bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col gap-6 relative overflow-hidden group hover:-translate-y-1 transition-all"
            >
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
              <div className="flex justify-between items-center relative z-10">
                <span className="font-bold text-sm tracking-wider">{acc.currency} Wallet</span>
                {acc.logo ? (
                  <img src={acc.logo} alt={acc.currency} className="w-6 h-4 object-cover rounded shadow" />
                ) : (
                  <span className="text-xs font-mono">{acc.symbol}</span>
                )}
              </div>
              <div className="flex flex-col relative z-10">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Available Balance</span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono mt-1">
                  {acc.symbol}{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wide relative z-10 border-t border-slate-800 pt-3 flex justify-between">
                <span>Income: {acc.symbol}{acc.totalIncome?.toLocaleString() || '0'}</span>
                <span>Spent: {acc.symbol}{acc.totalSpending?.toLocaleString() || '0'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Account Specifications & Debit Cards Carousel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Account Details Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 px-[10px] py-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <h3 className="font-bold text-slate-900 text-base uppercase tracking-wider pb-3 border-b border-slate-100">
            Account Clearance Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Account No */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-450 uppercase">Account Number</span>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-3 py-2 rounded">
                <span className="font-mono text-sm font-semibold text-slate-700">{profile?.accountNumber}</span>
                <button
                  onClick={() => handleCopy(profile?.accountNumber, 'acc')}
                  className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                >
                  {copiedField === 'acc' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* SWIFT */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-450 uppercase">SWIFT / BIC Code</span>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-3 py-2 rounded">
                <span className="font-mono text-sm font-semibold text-slate-700">{profile?.swiftCode}</span>
                <button
                  onClick={() => handleCopy(profile?.swiftCode, 'swift')}
                  className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                >
                  {copiedField === 'swift' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Routing */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-450 uppercase">Routing Number</span>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-3 py-2 rounded">
                <span className="font-mono text-sm font-semibold text-slate-700">{profile?.routine}</span>
                <button
                  onClick={() => handleCopy(profile?.routine, 'routing')}
                  className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                >
                  {copiedField === 'routing' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* IBAN */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-450 uppercase">IBAN</span>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-3 py-2 rounded">
                <span className="font-mono text-xs font-semibold text-slate-700 truncate max-w-[180px]">{profile?.iban}</span>
                <button
                  onClick={() => handleCopy(profile?.iban, 'iban')}
                  className="text-slate-400 hover:text-primary transition-colors flex-shrink-0 cursor-pointer"
                >
                  {copiedField === 'iban' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 3 Colored Debit Card Carousel Section */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 px-[10px] py-6 sm:p-8 shadow-sm flex flex-col gap-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider">
              Debit Card Collection
            </h3>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
              {debitCards[activeCardIndex].category}
            </span>
          </div>

          {/* Carousel Card Display */}
          <div className="relative group">
            <div className={`w-full h-48 sm:h-52 rounded-2xl p-5 ${debitCards[activeCardIndex].bg} border ${debitCards[activeCardIndex].border} shadow-xl text-white flex flex-col justify-between relative overflow-hidden transition-all duration-500 transform hover:scale-[1.01]`}>
              
              {/* Decorative Blur Effect */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/20 rounded-full blur-2xl pointer-events-none" />

              {/* Top Row: Bank Brand & Contactless Symbol */}
              <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col">
                  <span className="text-xs font-bold tracking-wider uppercase opacity-90">Access National</span>
                  <span className="text-[9px] uppercase tracking-widest text-white/70 font-mono">Debit Card</span>
                </div>
                <div className="flex items-center gap-3">
                  <Wifi size={20} className="text-white/80 rotate-90" />
                  <span className="font-bold font-mono text-sm tracking-widest">{debitCards[activeCardIndex].brand}</span>
                </div>
              </div>

              {/* Center: Metallic Chip & Card Number */}
              <div className="flex flex-col gap-3 relative z-10 my-auto">
                <div className="w-10 h-7 rounded bg-gradient-to-tr from-amber-200 via-amber-400 to-yellow-100 border border-amber-500/50 shadow-inner flex items-center justify-center">
                  <div className="w-8 h-5 border border-amber-600/40 rounded-sm" />
                </div>
                <span className="font-mono text-base sm:text-lg tracking-widest text-white/90 drop-shadow font-semibold">
                  {debitCards[activeCardIndex].cardNumber}
                </span>
              </div>

              {/* Bottom Row: Cardholder Name & Expiry */}
              <div className="flex justify-between items-end relative z-10 text-[10px] sm:text-xs">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-wider text-white/60 font-semibold">Cardholder</span>
                  <span className="font-bold uppercase tracking-wider font-mono text-white/90 truncate max-w-[170px]">
                    {debitCards[activeCardIndex].holder}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] uppercase tracking-wider text-white/60 font-semibold">Expires</span>
                  <span className="font-mono font-bold text-white/90">{debitCards[activeCardIndex].expiry}</span>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setActiveCardIndex((prev) => (prev === 0 ? debitCards.length - 1 : prev - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur transition-all cursor-pointer shadow-md"
              title="Previous Card"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setActiveCardIndex((prev) => (prev === debitCards.length - 1 ? 0 : prev + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur transition-all cursor-pointer shadow-md"
              title="Next Card"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Carousel Dots */}
          <div className="flex items-center justify-center gap-2">
            {debitCards.map((card, idx) => (
              <button
                key={card.id}
                onClick={() => setActiveCardIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeCardIndex === idx ? 'w-6 bg-primary' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                title={card.name}
              />
            ))}
          </div>

          {/* Apply for Card Button */}
          <Link
            href="/dashboard/cards"
            className="w-full py-3.5 px-4 bg-primary hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer text-center mt-1"
          >
            <CreditCard size={16} />
            <span>Apply for Access Debit Card</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>

      {/* 4. Recent Transactions Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 px-[10px] py-6 sm:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base uppercase tracking-wider">
            Transaction Activity Ledger
          </h3>
          <Link href="/dashboard/transfer" className="text-xs text-primary hover:underline font-bold">
            New Transfer
          </Link>
        </div>

        {transactions.length === 0 ? (
          <p className="text-slate-450 text-xs sm:text-sm font-light text-center py-8">
            No transactions found on this account ledger.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Beneficiary/Sender</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.slice(0, 5).map((tx) => {
                  const isDebit = tx.transactionType.includes('Transfer') || tx.transactionType === 'Debit';
                  const dateStr = new Date(tx.time).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${
                          isDebit ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {isDebit ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        </div>
                        <span>{tx.transactionType}</span>
                      </td>
                      <td className="py-4 text-slate-600">
                        {isDebit ? tx.receiverName || 'External Account' : tx.senderName || 'Deposit Desk'}
                      </td>
                      <td className="py-4 text-slate-400 font-light">{dateStr}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                          tx.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`py-4 font-mono font-bold text-right ${
                        isDebit ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {isDebit ? '-' : '+'}{tx.symbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
