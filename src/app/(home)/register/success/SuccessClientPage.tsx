'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, ArrowRight, LogIn } from 'lucide-react';

export default function SuccessClientPage() {
  return (
    <div className="bg-slate-50 min-h-[80vh] py-16 px-[10px] sm:px-6 flex justify-center items-center font-sans">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full flex flex-col items-center gap-8 text-center relative overflow-hidden">
        
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

        {/* Heading & Messages */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Registration Successful!
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed">
            Welcome to <strong className="text-slate-800 font-semibold">Access National Bank</strong>. Your online banking account has been successfully created.
          </p>
          <p className="text-slate-400 text-xs font-light">
            Please log in with your registered credentials to access your banking vault.
          </p>
        </div>

        {/* Proceed to Login Button */}
        <div className="w-full pt-2">
          <Link
            href="/login"
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-red-950/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn size={18} />
            <span>Proceed to Login</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}
