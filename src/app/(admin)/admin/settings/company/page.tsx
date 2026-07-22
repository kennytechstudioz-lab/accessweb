'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, Save, Lock, Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useToastStore } from '@/store/toastStore';
import { api } from '@/util/api';

export default function CompanySettingsPage() {
  const { settings, loading, fetchSettings } = useSettingsStore();
  const { showToast } = useToastStore();
  const [localSettings, setLocalSettings] = useState<any>({
    companyName: '',
    companyBankName: '',
    companyAccountNumber: '',
    systemEmail: '',
    companyBank: '',
    routineNumber: '',
    companyAddress: '',
    companyPhoneNumber: '',
    companyDomain: '',
    swiftCode: '',
    sortCode: '',
    btcAddress: '',
    usdtAddress: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        companyName: settings.companyName || '',
        companyBankName: settings.companyBankName || '',
        companyAccountNumber: settings.companyAccountNumber || '',
        systemEmail: settings.systemEmail || '',
        companyBank: settings.companyBank || '',
        routineNumber: settings.routineNumber || '',
        companyAddress: settings.companyAddress || '',
        companyPhoneNumber: settings.companyPhoneNumber || '',
        companyDomain: settings.companyDomain || '',
        swiftCode: settings.swiftCode || '',
        sortCode: settings.sortCode || '',
        btcAddress: settings.btcAddress || '',
        usdtAddress: settings.usdtAddress || '',
      });
    }
  }, [settings]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.put('/admin/settings', localSettings);
      showToast('System company identity updated successfully!', 'success');
      fetchSettings();
    } catch (err: any) {
      showToast(err.message || 'Error updating settings.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    setPwSubmitting(true);
    try {
      await api.put('/admin/change-password', { password: newPassword });
      showToast('Password updated successfully!', 'success');
      setNewPassword('');
    } catch (err: any) {
      showToast(err.message || 'Error updating password.', 'error');
    } finally {
      setPwSubmitting(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Syncing System Settings Vault...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Company Profile Identity</h2>
        <p className="text-slate-550 text-xs font-light">Modify banking addresses, routing numbers, and official communication parameters.</p>
      </div>

      {/* Form: Settings */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleUpdateSettings} className="flex flex-col gap-6">
          
          {/* Section 1: Bank Information */}
          <div>
            <h3 className="text-xs font-bold text-slate-855 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Corporate Bank Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Company / Brand Name</label>
                <input
                  type="text"
                  value={localSettings.companyName}
                  onChange={(e) => setLocalSettings({ ...localSettings, companyName: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Official Bank Name</label>
                <input
                  type="text"
                  value={localSettings.companyBankName}
                  onChange={(e) => setLocalSettings({ ...localSettings, companyBankName: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Settlement Routing Number</label>
                <input
                  type="text"
                  value={localSettings.routineNumber}
                  onChange={(e) => setLocalSettings({ ...localSettings, routineNumber: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">SWIFT / BIC Code</label>
                <input
                  type="text"
                  value={localSettings.swiftCode}
                  onChange={(e) => setLocalSettings({ ...localSettings, swiftCode: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Sort Code</label>
                <input
                  type="text"
                  value={localSettings.sortCode}
                  onChange={(e) => setLocalSettings({ ...localSettings, sortCode: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Corporate Account Number</label>
                <input
                  type="text"
                  value={localSettings.companyAccountNumber}
                  onChange={(e) => setLocalSettings({ ...localSettings, companyAccountNumber: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Domain */}
          <div>
            <h3 className="text-xs font-bold text-slate-855 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Contact & Web Clearance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">System Support Email</label>
                <input
                  type="email"
                  value={localSettings.systemEmail}
                  onChange={(e) => setLocalSettings({ ...localSettings, systemEmail: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Corporate Address</label>
                <input
                  type="text"
                  value={localSettings.companyAddress}
                  onChange={(e) => setLocalSettings({ ...localSettings, companyAddress: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Domain Address</label>
                <input
                  type="text"
                  value={localSettings.companyDomain}
                  onChange={(e) => setLocalSettings({ ...localSettings, companyDomain: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Crypto Payment Addresses */}
          <div>
            <h3 className="text-xs font-bold text-slate-855 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Crypto Payment Destinations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Bitcoin (BTC) Deposit Wallet Address</label>
                <input
                  type="text"
                  value={localSettings.btcAddress}
                  onChange={(e) => setLocalSettings({ ...localSettings, btcAddress: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Tether (USDT TRC-20) Deposit Wallet Address</label>
                <input
                  type="text"
                  value={localSettings.usdtAddress}
                  onChange={(e) => setLocalSettings({ ...localSettings, usdtAddress: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4 self-start"
          >
            <Save size={16} />
            <span>{submitting ? 'Updating Settings...' : 'Save Settings Details'}</span>
          </button>

        </form>
      </div>

      {/* Change Password */}
      <div className="flex flex-col gap-1 mt-2">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Admin Password</h2>
        <p className="text-slate-550 text-xs font-light">Update the password for the currently logged-in admin account.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleChangePassword} className="flex flex-col gap-6">
          <div>
            <h3 className="text-xs font-bold text-slate-855 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Change Login Password
            </h3>
            <div className="flex flex-col gap-3 max-w-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 pr-10 text-xs text-slate-800 focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className={`text-[10px] font-semibold mt-0.5 ${
                  newPassword.length === 0 ? 'text-slate-400' :
                  newPassword.length < 6 ? 'text-red-500' : 'text-green-600'
                }`}>
                  {newPassword.length === 0
                    ? 'Minimum 6 characters required'
                    : newPassword.length < 6
                    ? `${6 - newPassword.length} more character${6 - newPassword.length > 1 ? 's' : ''} needed`
                    : '✓ Password meets requirements'}
                </p>
              </div>

              <button
                type="submit"
                disabled={pwSubmitting || newPassword.length < 6}
                className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer self-start"
              >
                <Lock size={14} />
                <span>{pwSubmitting ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
