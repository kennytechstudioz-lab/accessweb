'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Landmark, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordClient() {
  const [accountIdentifier, setAccountIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send reset request if API endpoint available or display verification prompt
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5009/api';
      await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: accountIdentifier }),
      }).catch(() => {}); // silent catch for graceful UI handling

      setSubmitted(true);
    } catch (err: any) {
      setError('Unable to process reset request. Please contact customer support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[80vh] py-16 px-[10px] sm:px-6 flex justify-center items-center font-sans">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl max-w-md w-full flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-3 bg-red-50 rounded-xl text-primary animate-pulse">
            <Landmark size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-slate-400 text-xs font-light">
            Enter your registered username or email address to recover your vault clearance.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex gap-2 items-center">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="flex flex-col items-center gap-5 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-md">
              <CheckCircle2 size={36} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-bold text-slate-900">Reset Instructions Sent</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                If an account matches <strong className="text-slate-800">{accountIdentifier}</strong>, reset instructions and verification keys have been dispatched to your email address.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">Username or Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={accountIdentifier}
                  onChange={(e) => setAccountIdentifier(e.target.value)}
                  placeholder="e.g. name@example.com or username"
                  className="w-full border border-slate-200 rounded px-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3.5 rounded hover:bg-primary-hover shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:bg-slate-400 cursor-pointer mt-2"
            >
              {loading ? <span>Dispatching clearance key...</span> : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <hr className="border-slate-100" />

        <p className="text-center text-xs text-slate-500 font-light">
          Remembered your password?{' '}
          <Link href="/login" className="text-primary hover:underline font-bold">
            Back to Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
