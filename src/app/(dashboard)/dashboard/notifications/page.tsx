'use client';

import React, { useEffect } from 'react';
import { Bell, CheckCircle2, Landmark, CheckCheck } from 'lucide-react';
import { useNotificationsStore } from '@/store/notificationsStore';

export default function UserNotificationsPage() {
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead, getUnreadCount } = useNotificationsStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = getUnreadCount();

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Title & Actions Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Security & Account Alerts</h1>
          <p className="text-slate-500 text-xs font-light">
            System notifications, security clearances, and transfer updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <CheckCheck size={16} />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
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
            {notifications.map((n) => {
              const isUnread = !n.isRead && n.status !== 'read';

              return (
                <div
                  key={n._id}
                  onClick={() => {
                    if (isUnread) markAsRead(n._id);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isUnread
                      ? 'border-primary/30 bg-red-50/40 shadow-xs'
                      : 'border-slate-150 bg-slate-50/60 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                    isUnread ? 'bg-primary text-white shadow-xs' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Bell size={18} />
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-xs font-bold ${isUnread ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                          {n.title || 'Account Notification'}
                        </h3>
                        {isUnread && (
                          <span className="bg-primary text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                            UNREAD
                          </span>
                        )}
                      </div>
                      
                      <span className="text-[10px] text-slate-400 font-mono">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-light leading-relaxed">{n.content || n.message}</p>
                  </div>

                  {isUnread ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n._id);
                      }}
                      className="text-[10px] font-bold text-primary hover:underline flex-shrink-0 pt-0.5"
                    >
                      Mark Read
                    </button>
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
