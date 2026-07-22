'use client';

import React, { useEffect } from 'react';
import { ShieldCheck, Lock, Landmark } from 'lucide-react';
import { useTermsStore } from '@/store/termsStore';

export default function PrivacyClientPage() {
  const { terms, loading, fetchTerms } = useTermsStore();

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  if (loading && !terms?.privacyContent) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Loading Privacy Policy...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-20 px-[10px] sm:px-6 md:px-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-primary to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-8 -translate-y-8 pointer-events-none">
            <Lock size={280} />
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-white/90 w-fit">
            <ShieldCheck size={16} />
            <span>Data Protection & Privacy Notice</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {terms?.privacyTitle || 'Privacy Policy'}
          </h1>
          <p className="text-slate-200 text-sm max-w-2xl font-light leading-relaxed">
            Discover our commitments to user privacy, bank-grade encryption protocols, and how Access National Bank collects and protects your financial data.
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-sm text-slate-700 leading-relaxed font-sans text-sm sm:text-base space-y-6 prose prose-slate max-w-none">
          {terms?.privacyContent ? (
            <div dangerouslySetInnerHTML={{ __html: terms.privacyContent }} />
          ) : (
            <p className="text-slate-500 italic">No Privacy Policy content available at this time.</p>
          )}
        </div>
      </div>
    </div>
  );
}
