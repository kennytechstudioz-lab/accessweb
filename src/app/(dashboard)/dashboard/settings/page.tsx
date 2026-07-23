'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Lock, ShieldCheck, Save, Key, Shield, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';

export default function UserSettingsPage() {
  const { showToast } = useToastStore();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // PIN state
  const [pin, setPinState] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinPassword, setPinPassword] = useState('');
  const [savingPin, setSavingPin] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [toggling2fa, setToggling2fa] = useState(false);

  const fetchSettingsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const res = await fetch(`${apiUrl}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data);
      setTwoFactorEnabled(!!data.twoFactorEnabled);
    } catch (e) {
      console.error('Error fetching settings profile:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  // Save Transaction PIN
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) {
      showToast('Transaction PIN must be exactly 6 digits.', 'error');
      return;
    }
    if (pin !== confirmPin) {
      showToast('PIN confirmation does not match.', 'error');
      return;
    }
    if (profile?.pin && !pinPassword) {
      showToast('Password is required to update PIN.', 'error');
      return;
    }

    setSavingPin(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const res = await fetch(`${apiUrl}/user/set-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pin, password: pinPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update PIN');

      showToast('Transaction PIN saved successfully!', 'success');
      setPinState('');
      setConfirmPin('');
      setPinPassword('');
      fetchSettingsData();
    } catch (err: any) {
      showToast(err.message || 'Error setting PIN', 'error');
    } finally {
      setSavingPin(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const res = await fetch(`${apiUrl}/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update password');

      showToast('Password updated successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // Toggle 2FA
  const handleToggle2FA = async () => {
    setToggling2fa(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const targetStatus = !twoFactorEnabled;

      const res = await fetch(`${apiUrl}/user/toggle-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: targetStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update 2FA status');

      setTwoFactorEnabled(targetStatus);
      showToast(`2FA Security ${targetStatus ? 'enabled' : 'disabled'} successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error updating 2FA settings', 'error');
    } finally {
      setToggling2fa(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Security & Account Settings</h1>
        <p className="text-slate-500 text-xs font-light">
          Manage your transaction PIN, change your account password, and configure 2FA multi-factor authentication.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: PIN & 2FA (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Transaction PIN Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck size={20} className="text-primary" />
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                {profile?.pin ? 'Change Transaction PIN' : 'Create Transaction PIN'}
              </h3>
            </div>

            <form onSubmit={handleSavePin} className="flex flex-col gap-4">
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Your 6-digit PIN is required to authorize all outbound money transfers and card requests.
              </p>

              {profile?.pin ? (
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Account Password</label>
                  <input
                    type="password"
                    required
                    value={pinPassword}
                    onChange={(e) => setPinPassword(e.target.value)}
                    placeholder="Enter your login password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs font-mono font-bold tracking-widest focus:outline-none focus:border-primary text-slate-800"
                  />
                </div>
              ) : null}

              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700 uppercase text-[10px]">New 6-Digit PIN</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPinState(e.target.value)}
                  placeholder="Enter 6-digit PIN"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs font-mono font-bold tracking-widest focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Confirm 6-Digit PIN</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Re-enter 6-digit PIN"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs font-mono font-bold tracking-widest focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={savingPin}
                className="w-full py-3 bg-primary hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-400 mt-1"
              >
                <Save size={16} />
                <span>{savingPin ? 'Saving PIN...' : profile?.pin ? 'Update Transaction PIN' : 'Create Transaction PIN'}</span>
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication (2FA) Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Smartphone size={20} className="text-primary" />
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                Two-Factor Authentication (2FA)
              </h3>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <p className="text-slate-500 font-light leading-relaxed">
                Add an extra layer of protection to your online banking vault. When 2FA is active, login requests require security clearance codes.
              </p>

              <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                twoFactorEnabled 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {twoFactorEnabled ? <CheckCircle size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-slate-400" />}
                  <span>{twoFactorEnabled ? '2FA Protection Active' : '2FA Protection Disabled'}</span>
                </div>

                <button
                  type="button"
                  onClick={handleToggle2FA}
                  disabled={toggling2fa}
                  className={`px-4 py-2 rounded-lg font-bold text-xs shadow transition-all cursor-pointer ${
                    twoFactorEnabled 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {toggling2fa ? 'Updating...' : twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Password Change Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Key size={20} className="text-primary" />
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
              Change Account Password
            </h3>
          </div>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-bold text-slate-700 uppercase text-[10px]">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700 uppercase text-[10px]">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="bg-primary hover:bg-red-800 text-white font-bold py-3.5 px-6 rounded-xl text-xs transition-all flex items-center justify-center gap-2 self-start cursor-pointer mt-2 shadow"
            >
              <Save size={16} />
              <span>{savingPassword ? 'Updating Password...' : 'Save Password Changes'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
