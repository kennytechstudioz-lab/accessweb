'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Landmark, User, Mail, Lock, Phone, MapPin, Calendar, HelpCircle, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    country: '',
    address: '',
    dob: '',
    pin: '',
    baseCurrency: 'USD',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // PIN check
    if (!/^\d{4,6}$/.test(formData.pin)) {
      setError('Security PIN must be a 4 to 6 digit number.');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5009/api';
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save token and user details
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 py-16 px-[10px] sm:px-6 flex justify-center items-center">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-3 bg-red-50 rounded-xl text-primary animate-pulse">
            <Landmark size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Open An Account</h1>
          <p className="text-slate-400 text-xs font-light">Set up your secure, multi-currency online banking vault.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex gap-2 items-center">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-650">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full border border-slate-200 rounded px-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-650">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full border border-slate-200 rounded px-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-650">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. johndoe12"
                  className="w-full border border-slate-200 rounded px-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-650">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="********"
                  className="w-full border border-slate-200 rounded px-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-650">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
                <input
                  type="text"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full border border-slate-200 rounded px-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-650">Date of Birth</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full border border-slate-200 rounded px-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50 text-slate-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-650">Country</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g. United States"
                  className="w-full border border-slate-200 rounded px-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-650">Home Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 123 Main St, New York"
                  className="w-full border border-slate-200 rounded px-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-650">Security PIN (4-6 digits)</label>
              <div className="relative">
                <HelpCircle size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                  placeholder="e.g. 1234"
                  className="w-full border border-slate-200 rounded px-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-650">Base Currency Preference</label>
              <select
                value={formData.baseCurrency}
                onChange={(e) => setFormData({ ...formData, baseCurrency: e.target.value })}
                className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3.5 rounded hover:bg-primary-hover shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:bg-slate-400 disabled:cursor-not-allowed mt-2 cursor-pointer"
          >
            {loading ? <span>Activating account vaults...</span> : (
              <>
                <span>Open Secure Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <hr className="border-slate-100" />

        <p className="text-center text-xs text-slate-500 font-light">
          Already have an online vault?{' '}
          <Link href="/login" className="text-primary hover:underline font-bold">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}
