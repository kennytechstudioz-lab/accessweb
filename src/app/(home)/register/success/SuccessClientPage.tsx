'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, CreditCard, LayoutDashboard, Copy, Check, ArrowRight, Landmark } from 'lucide-react';

export default function SuccessClientPage() {
  const [user, setUser] = useState<any>(null);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const copyToClipboard = (text: string, type: 'acc' | 'iban') => {
    navigator.clipboard.writeText(text);
    if (type === 'acc') {
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 2000);
    } else {
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[85vh] py-16 px-[10px] sm:px-6 flex justify-center items-center font-sans">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full flex flex-col items-center gap-8 text-center relative overflow-hidden">
        
        {/* Top Decorative Background Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Checkmark Badge */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-lg shadow-emerald-100 animate-bounce">
            <CheckCircle2 size={44} />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full shadow-md">
            <ShieldCheck size={16} />
          </div>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Registration Successful!
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-light max-w-md">
            Welcome to <strong className="text-slate-800 font-bold">Access National Bank</strong>. Your multi-currency digital vault has been initialized and activated.
          </p>
        </div>

        {/* Account Details Card */}
        {user ? (
          <div className="w-full bg-gradient-to-br from-slate-900 via-slate-850 to-primary text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col gap-5 text-left relative overflow-hidden">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Landmark size={20} className="text-red-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">Access Digital Vault</span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Status: Active
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account Holder</span>
              <span className="text-base sm:text-lg font-extrabold text-white tracking-wide">{user.fullName || user.username}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Account Number</span>
                  <span className="text-sm font-bold text-white font-mono">{user.accountNumber || 'Pending'}</span>
                </div>
                {user.accountNumber && (
                  <button
                    onClick={() => copyToClipboard(user.accountNumber, 'acc')}
                    className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Copy Account Number"
                  >
                    {copiedAcc ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Base Currency</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">USD ($)</span>
                </div>
                <CreditCard size={18} className="text-slate-400" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl text-xs text-slate-600">
            Your credentials have been authenticated. You can now log into your online banking account.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
          <Link
            href="/dashboard"
            className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-red-950/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LayoutDashboard size={18} />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            href="/login"
            className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Login to Portal</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}
