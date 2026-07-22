'use client';

import React, { useEffect, useState } from 'react';
import { User, ShieldCheck, Mail, Phone, MapPin, Calendar, CreditCard, Landmark, CheckCircle } from 'lucide-react';

export default function UserProfilePage() {
  const [user, setUser] = useState<any>(null);

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

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Loading Profile Vault...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Client Account Profile</h1>
        <p className="text-slate-500 text-xs font-light">View your personal identity, contact details, and account verification credentials.</p>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-4 text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 text-primary border-2 border-primary/20 flex items-center justify-center font-black text-3xl shadow-inner">
            {user.fullName ? user.fullName[0] : user.username[0]}
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-900">{user.fullName || user.username}</h3>
            <span className="text-xs text-slate-400 font-mono">@{user.username}</span>
          </div>
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
            <CheckCircle size={14} className="text-emerald-600" />
            <span>Verified Vault Status</span>
          </div>

          <hr className="w-full border-slate-100 my-2" />

          <div className="w-full flex flex-col gap-3 text-xs text-left">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-medium uppercase text-[10px]">Account Number</span>
              <span className="font-bold text-slate-800 font-mono">{user.accountNumber}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-100">
              <span className="text-slate-400 font-medium uppercase text-[10px]">Account Status</span>
              <span className="font-bold text-primary">{user.status}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Details Card */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
          <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
            <User size={18} className="text-primary" />
            <span>Personal Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                <Mail size={14} className="text-primary" />
                Email Address
              </span>
              <span className="font-semibold text-slate-800 text-sm truncate">{user.email}</span>
            </div>

            <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                <Phone size={14} className="text-primary" />
                Phone Number
              </span>
              <span className="font-semibold text-slate-800 text-sm">{user.phoneNumber || 'Not provided'}</span>
            </div>

            <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" />
                Country
              </span>
              <span className="font-semibold text-slate-800 text-sm">{user.country || 'Not specified'}</span>
            </div>

            <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" />
                Home Address
              </span>
              <span className="font-semibold text-slate-800 text-sm">{user.address || 'Not specified'}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-900 to-primary text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-xl text-white">
                <ShieldCheck size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">Need to update your verification (KYC)?</span>
                <span className="text-xs text-slate-200 font-light">Upload valid passport or government ID documents.</span>
              </div>
            </div>
            <a
              href="/dashboard/kyc"
              className="bg-white text-primary font-bold px-5 py-2.5 rounded-lg text-xs hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              Verify KYC
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
