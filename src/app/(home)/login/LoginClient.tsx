'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Landmark, Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LoginClient() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5009/api';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Sync with NextAuth session
      const nextAuthResult = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });

      if (nextAuthResult?.error) {
        throw new Error(nextAuthResult.error || 'NextAuth session creation failed');
      }

      // Save token and user details for legacy layout queries
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.status === 'Admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please check your credentials.');
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Access National</h1>
          <p className="text-slate-400 text-xs font-light">Enter credentials to access your secure bank vaults.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex gap-2 items-center">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600">Username or Email</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full border border-slate-200 rounded px-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50 text-slate-800"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-600">Secure Password</label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline font-bold">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full border border-slate-200 rounded pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50 text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3.5 rounded hover:bg-primary-hover shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:bg-slate-400 disabled:cursor-not-allowed mt-2 cursor-pointer"
          >
            {loading ? <span>Vault clearance...</span> : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <hr className="border-slate-100" />

        <p className="text-center text-xs text-slate-500 font-light">
          Don't have an online vault?{' '}
          <Link href="/register" className="text-primary hover:underline font-bold">
            Open An Account
          </Link>
        </p>

      </div>
    </div>
  );
}
