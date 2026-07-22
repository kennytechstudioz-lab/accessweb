'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, Bell, Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { useNotificationsStore } from '@/store/notificationsStore';
import { api } from '@/util/api';

export default function NotificationsAdminPage() {
  const { notifications, loading, fetchNotifications } = useNotificationsStore();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    title: '',
    content: '',
    username: '',
    admin: true,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handlePostNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        title: form.title,
        content: form.content,
        username: form.username.trim() || 'All',
        admin: form.admin,
      };

      await api.post('/admin/notifications', payload);

      setSuccessMsg('Notification dispatched successfully!');
      setForm({
        title: '',
        content: '',
        username: '',
        admin: true,
      });
      fetchNotifications();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Delete this notification log entry?')) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.delete(`/admin/notifications/${id}`);
      setSuccessMsg('Notification entry deleted.');
      fetchNotifications();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Syncing Notification logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">System Alerts Desk</h2>
        <p className="text-slate-550 text-xs font-light">Send target user alerts or system-wide broadcast check-in notifications.</p>
      </div>

      {/* Alert Messaging */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex gap-2.5 items-center">
          <CheckCircle size={18} className="flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-850 p-4 rounded-xl text-xs flex gap-2.5 items-center">
          <AlertCircle size={18} className="flex-shrink-0 text-red-550" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dispatch form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-855 uppercase tracking-wider mb-5 flex items-center gap-2 pb-2 border-b border-slate-100">
          <Plus size={16} className="text-primary" />
          <span>Dispatch New Bulletin</span>
        </h3>
        <form onSubmit={handlePostNotification} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Bulletin Header Title</label>
              <input
                type="text"
                required
                placeholder="e.g. IMF Clearance Notice"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Target Username (leave blank for general broadcast)</label>
              <input
                type="text"
                placeholder="e.g. Roberto (or blank for 'All')"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Alert Content Message</label>
            <textarea
              required
              rows={3}
              placeholder="Type notification message details here..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{submitting ? 'Dispatching Bulletin...' : 'Broadcast Bulletin'}</span>
          </button>
        </form>
      </div>

      {/* List: Existing Notifications */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-855 uppercase tracking-wider mb-5 flex items-center gap-2 pb-2 border-b border-slate-100">
          <Bell size={16} className="text-primary" />
          <span>Active Bulletins Log</span>
        </h3>

        {notifications.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center">No active notifications log found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 pb-3">
                  <th className="pb-3">Recipient</th>
                  <th className="pb-3">Title / Message</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Channel</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifications.map((notif) => {
                  const dateStr = notif.time 
                    ? new Date(typeof notif.time === 'number' && notif.time < 10000000000 ? notif.time * 1000 : notif.time).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Recent';

                  return (
                    <tr key={notif._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                          notif.username === 'All' ? 'bg-indigo-55 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {notif.username}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-0.5 max-w-sm sm:max-w-md">
                          <span className="text-slate-800 font-bold text-xs">{notif.title}</span>
                          <span className="text-[11px] text-slate-550 font-light leading-relaxed">{notif.content}</span>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-slate-500 font-light">{dateStr}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          notif.admin ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-555'
                        }`}>
                          {notif.admin ? 'Admin' : 'System'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteNotification(notif._id)}
                          className="p-2 text-slate-400 hover:text-red-655 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Delete Bulletin Entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
