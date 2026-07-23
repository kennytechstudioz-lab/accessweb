'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Landmark, 
  Bell, 
  Trash2, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  Key, 
  ShieldCheck, 
  ArrowUpRight, 
  CreditCard, 
  Search, 
  CheckCheck, 
  Megaphone, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Inbox
} from 'lucide-react';
import { api } from '@/util/api';
import { useToastStore } from '@/store/toastStore';

interface NotificationLog {
  _id: string;
  title: string;
  content?: string;
  message?: string;
  username?: string;
  isRead?: boolean;
  admin?: boolean;
  time?: number;
  createdAt?: string;
}

export default function NotificationsAdminPage() {
  const { showToast } = useToastStore();

  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unhandled' | 'tac' | 'kyc' | 'transfer' | 'cards'>('all');
  
  // Collapsible Bulletin Form
  const [showBulletinForm, setShowBulletinForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    username: '',
  });

  const fetchAdminNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/notifications');
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching admin notifications:', err);
      showToast(err.message || 'Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminNotifications();
  }, []);

  // Handle Mark Single Notification as Read
  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/user/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      showToast('Notification marked as read.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error marking notification read', 'error');
    }
  };

  // Handle Mark All as Read
  const handleMarkAllRead = async () => {
    try {
      await api.put('/user/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('All activity notifications marked as read.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error marking all read', 'error');
    }
  };

  // Handle Delete Notification Log
  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this activity notification log entry?')) return;

    try {
      await api.delete(`/admin/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showToast('Notification log entry deleted.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error deleting notification', 'error');
    }
  };

  // Handle Dispatch Custom Bulletin
  const handlePostNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        title: form.title,
        content: form.content,
        username: form.username.trim() || 'All',
        admin: true,
      };

      await api.post('/admin/notifications', payload);
      showToast('System announcement bulletin dispatched successfully!', 'success');
      setForm({ title: '', content: '', username: '' });
      setShowBulletinForm(false);
      fetchAdminNotifications();
    } catch (err: any) {
      showToast(err.message || 'Error dispatching bulletin', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: Categorize Notification Type
  const getActivityCategory = (notif: NotificationLog) => {
    const text = `${notif.title || ''} ${notif.content || ''} ${notif.message || ''}`.toLowerCase();
    if (text.includes('tac') || text.includes('authorization code')) return 'tac';
    if (text.includes('kyc') || text.includes('identity') || text.includes('passport')) return 'kyc';
    if (text.includes('transfer') || text.includes('wire') || text.includes('local bank')) return 'transfer';
    if (text.includes('card') || text.includes('debit') || text.includes('visa')) return 'cards';
    return 'general';
  };

  // Filtered Notifications
  const filteredNotifications = notifications.filter((notif) => {
    const text = `${notif.title || ''} ${notif.content || ''} ${notif.message || ''} ${notif.username || ''}`.toLowerCase();
    const matchesSearch = text.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const category = getActivityCategory(notif);
    if (activeTab === 'unhandled') return !notif.isRead;
    if (activeTab === 'tac') return category === 'tac';
    if (activeTab === 'kyc') return category === 'kyc';
    if (activeTab === 'transfer') return category === 'transfer';
    if (activeTab === 'cards') return category === 'cards';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const tacCount = notifications.filter((n) => getActivityCategory(n) === 'tac').length;
  const kycCount = notifications.filter((n) => getActivityCategory(n) === 'kyc').length;
  const transferCount = notifications.filter((n) => getActivityCategory(n) === 'transfer').length;

  if (loading && notifications.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Syncing Admin Activity Logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Title & Top Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Admin User Activities & Alerts Desk</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs font-light">
            Real-time audit record of user transactions, TAC clearance requests, identity verification submissions, and account events.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Mark all notifications as read"
            >
              <CheckCheck size={16} className="text-emerald-600" />
              <span>Mark All Read</span>
            </button>
          )}

          <button
            onClick={() => setShowBulletinForm(!showBulletinForm)}
            className="px-4 py-2 bg-primary hover:bg-red-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Megaphone size={16} />
            <span>{showBulletinForm ? 'Hide Dispatch Form' : 'Broadcast Bulletin'}</span>
            {showBulletinForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>



      {/* Collapsible Bulletin Dispatcher */}
      {showBulletinForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md animate-in fade-in slide-in-from-top-3 duration-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Plus size={16} className="text-primary" />
            <span>Dispatch System Announcement / User Bulletin</span>
          </h3>
          
          <form onSubmit={handlePostNotification} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase text-[10px]">Bulletin Header Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. System Security Audit Notice"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase text-[10px]">Target Client Username (leave blank for 'All')</label>
                <input
                  type="text"
                  placeholder="e.g. user123 (or blank for broadcast to all clients)"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase text-[10px]">Alert Content Message</label>
              <textarea
                required
                rows={3}
                placeholder="Type official notification message details here..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBulletinForm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-primary hover:bg-red-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer disabled:bg-slate-400"
              >
                {submitting ? 'Dispatching...' : 'Dispatch Bulletin'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all' ? 'bg-primary text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Activity Alerts ({notifications.length})
          </button>
          
          <button
            onClick={() => setActiveTab('unhandled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeTab === 'unhandled' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
            Unread ({unreadCount})
          </button>

          <button
            onClick={() => setActiveTab('tac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tac' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            TAC Requests ({tacCount})
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'kyc' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            KYC Audits ({kycCount})
          </button>

          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'transfer' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Transfers ({transferCount})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search activities & users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary"
          />
        </div>

      </div>

      {/* Notifications List Feed */}
      <div className="flex flex-col gap-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center gap-3 text-center">
            <Inbox size={40} className="text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">No Activity Notifications Found</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              No user activity logs or system notifications match your current filter or search criteria.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const cat = getActivityCategory(notif);

            let icon = <Bell size={18} className="text-primary" />;
            let badgeBg = 'bg-red-50 text-primary border-red-100';
            let catLabel = 'System Log';
            let directLink = '';

            if (cat === 'tac') {
              icon = <Key size={18} className="text-amber-600" />;
              badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
              catLabel = 'TAC Clearance';
              directLink = '/admin/users';
            } else if (cat === 'kyc') {
              icon = <ShieldCheck size={18} className="text-blue-600" />;
              badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
              catLabel = 'KYC Verification';
              directLink = '/admin/users';
            } else if (cat === 'transfer') {
              icon = <ArrowUpRight size={18} className="text-purple-600" />;
              badgeBg = 'bg-purple-50 text-purple-700 border-purple-200';
              catLabel = 'Transfer Activity';
              directLink = '/admin/transactions';
            } else if (cat === 'cards') {
              icon = <CreditCard size={18} className="text-emerald-600" />;
              badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              catLabel = 'Card Issuance';
              directLink = '/admin/cards';
            }

            const formattedDate = notif.time
              ? new Date(typeof notif.time === 'number' && notif.time < 10000000000 ? notif.time * 1000 : notif.time).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : notif.createdAt
              ? new Date(notif.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recent Activity';

            return (
              <div
                key={notif._id}
                className={`bg-white p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:shadow-md ${
                  !notif.isRead ? 'border-l-4 border-l-primary border-slate-200 bg-slate-50/50' : 'border-slate-200'
                }`}
              >
                {/* Left: Icon & Details */}
                <div className="flex items-start gap-4 flex-1">
                  
                  {/* Category Icon Container */}
                  <div className={`p-3 rounded-xl border flex-shrink-0 mt-0.5 ${badgeBg}`}>
                    {icon}
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    
                    {/* Header Row: Category Badge, Username, Unread Badge */}
                    <div className="flex items-center flex-wrap gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeBg}`}>
                        {catLabel}
                      </span>

                      {notif.username && (
                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          @{notif.username}
                        </span>
                      )}

                      {!notif.isRead && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Unread
                        </span>
                      )}
                    </div>

                    {/* Notification Title & Body */}
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {notif.title}
                    </h3>
                    
                    <p className="text-xs text-slate-600 font-light leading-relaxed max-w-3xl">
                      {notif.content || notif.message}
                    </p>

                    {/* Time */}
                    <span className="text-[11px] font-mono text-slate-400 font-medium">
                      {formattedDate}
                    </span>
                  </div>

                </div>

                {/* Right: Quick Action Controls */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  
                  {directLink && (
                    <Link
                      href={directLink}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                      title="Navigate to management section"
                    >
                      <ExternalLink size={13} />
                      <span className="hidden md:inline">Action</span>
                    </Link>
                  )}

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteNotification(notif._id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete activity log entry"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
