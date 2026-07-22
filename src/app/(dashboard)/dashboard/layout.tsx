'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Landmark, 
  LayoutDashboard, 
  User, 
  ArrowRightLeft, 
  Send, 
  Building, 
  Globe, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { Suspense } from 'react';
import SmartSuppWidget from '@/components/SmartSuppWidget';
import WebSocketListener from '@/components/WebSocketListener';
import { useToastStore } from '@/store/toastStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useSearchParams } from 'next/navigation';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { message, type, hideToast } = useToastStore();
  const { fetchNotifications, getUnreadCount } = useNotificationsStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = getUnreadCount();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      if (parsedUser.status === 'Admin') {
        router.push('/admin');
        return;
      }
      setCurrentUser(parsedUser);
    } catch (e) {
      localStorage.clear();
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowRightLeft },
    { name: 'Internal Transfer', href: '/dashboard/transfer?type=internal', icon: Send },
    { name: 'Local Transfer', href: '/dashboard/transfer?type=local', icon: Building },
    { name: 'International Transfer', href: '/dashboard/transfer?type=international', icon: Globe },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const mobileBottomTabs = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowRightLeft },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (!currentUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={48} className="animate-spin text-primary" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Decrypting Session Vault...</p>
        </div>
      </div>
    );
  }

  const fullPath = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800 relative select-none">
      
      {/* Floating Toast Notification overlay */}
      {message && (
        <div className="fixed top-6 right-6 z-[9999] animate-slideIn">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-center justify-between gap-4 min-w-[320px] max-w-sm ${
            type === 'success' 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            <span className="font-sans text-xs sm:text-sm font-semibold">{message}</span>
            <button 
              onClick={hideToast}
              className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 rounded-full hover:bg-black/5 flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 1. Desktop Sidebar Panel */}
      <aside className="hidden md:flex flex-col w-64 bg-primary text-white h-full shadow-xl relative z-30 justify-between">
        <div className="overflow-y-auto flex-1 scrollbar-thin">
          <div className="h-20 flex items-center px-6 border-b border-red-800">
            <Link href="/">
              <img src="/images/AccessWhiteLogo.png" alt="Access National Bank" className="h-8 w-auto object-contain hover:opacity-80 transition-opacity" />
            </Link>
          </div>

          {/* Links */}
          <nav className="px-4 py-6 flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = link.href.includes('?')
                ? fullPath === link.href
                : pathname === link.href && !searchParams.get('type');
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-primary font-bold shadow-md'
                      : 'text-red-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User info & Logout */}
        <div className="p-4 flex flex-col gap-3 border-t border-red-800">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm border border-white/20 uppercase">
              {currentUser.username ? currentUser.username[0] : 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                {currentUser.username}
              </span>
              <span className="text-[10px] text-red-200 font-mono tracking-wider mt-0.5 truncate max-w-[130px]">
                Acc: {currentUser.accountNumber}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 text-slate-800">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-[10px] sm:px-6 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-primary cursor-pointer"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-wide">
              Welcome, <span className="text-primary">{currentUser.username}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider">
              Active Security Clearance
            </span>
            
            {/* Action Icons */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-4">
              <Link 
                href="/dashboard/notifications"
                className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-full transition-colors cursor-pointer relative"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[9px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {unreadCount > 10 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <Link
                href="/dashboard/profile"
                className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-full transition-colors cursor-pointer"
                title="Profile"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/20">
                  {currentUser.fullName ? currentUser.fullName[0] : currentUser.username[0]}
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:bg-slate-100 hover:text-primary rounded-full transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content View (with 10px mobile padding for sticky tabs) */}
        <main className="flex-1 overflow-y-auto px-[10px] py-4 sm:p-6 md:p-8 pb-24 md:pb-8 bg-slate-100">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 md:hidden flex">
          <aside className="w-64 bg-primary text-white flex flex-col h-full animate-slideIn justify-between">
            <div className="overflow-y-auto flex-1 scrollbar-thin">
              <div className="h-20 flex items-center justify-between px-6 border-b border-red-800">
                <img src="/images/AccessWhiteLogo.png" alt="Access National Bank" className="h-8 w-auto object-contain" />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-white hover:text-red-200 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="px-4 py-6 flex flex-col gap-1.5">
                {navLinks.map((link) => {
                  const isActive = link.href.includes('?')
                    ? fullPath === link.href
                    : pathname === link.href && !searchParams.get('type');
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-white text-primary font-bold'
                          : 'text-red-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-red-800 flex flex-col gap-3">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* 4. Mobile Sticky Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex justify-around items-center h-16 shadow-lg px-2">
        {mobileBottomTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? 'text-primary font-extrabold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-primary' : 'text-slate-500'} />
              <span className="text-[10px] tracking-tight">{tab.name}</span>
            </Link>
          );
        })}
      </div>

      <SmartSuppWidget />
      <WebSocketListener username={currentUser?.username} />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={48} className="animate-spin text-primary" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Decrypting Session Vault...</p>
        </div>
      </div>
    }>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
