'use client';

import React, { useState } from 'react';
import { Settings, Lock, ShieldCheck, Save, Key, BellRing } from 'lucide-react';
import { api } from '@/util/api';

export default function UserSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (newPassword !== confirmPassword) {
      setMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/user/change-password', { currentPassword, newPassword });
      setMsg({ text: 'Password updated successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMsg({ text: err.message || 'Failed to update password.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Security & Account Settings</h1>
        <p className="text-slate-500 text-xs font-light">Manage your login credentials, authentication keys, and security preferences.</p>
      </div>

      {/* Alert Messaging */}
      {msg && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Password Change Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
        <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100 mb-6">
          <Key size={18} className="text-primary" />
          <span>Change Password</span>
        </h3>

        <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Confirm New Password</label>
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
            disabled={submitting}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 self-start cursor-pointer mt-2"
          >
            <Save size={16} />
            <span>{submitting ? 'Updating Credentials...' : 'Save Password Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
