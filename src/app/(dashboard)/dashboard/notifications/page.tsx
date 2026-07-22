'use client';

import React, { useEffect, useState } from 'react';
import { Bell, ShieldAlert, CheckCircle, Info, Landmark, Trash2 } from 'lucide-react';
import { api } from '@/util/api';

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await api.get('/user/notifications');
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        // Fallback default notification for demonstration
        setNotifications([
          {
            _id: '1',
            title: 'Welcome to Access National Bank',
            message: 'Your multi-currency online vault is active. Enjoy fast wire transfers and high-level encryption.',
            type: 'info',
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Security & Account Alerts</h1>
        <p className="text-slate-500 text-xs font-light">System notifications, security clearances, and transfer updates.</p>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Landmark size={36} className="animate-spin text-primary" />
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Syncing Notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <Bell size={36} className="text-slate-300" />
            <span className="text-sm font-bold text-slate-700">No New Notifications</span>
            <p className="text-xs text-slate-400 max-w-sm">You have reviewed all pending security alerts and account notices.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className="p-4 rounded-xl border border-slate-150 bg-slate-50 flex items-start gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                  <Bell size={18} />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-900">{n.title || 'Account Notification'}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-light leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
