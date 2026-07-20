'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Landmark, LayoutDashboard, ArrowRightLeft, CreditCard, ShieldCheck, LogOut, User, Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transfer Funds', href: '/dashboard/transfer', icon: ArrowRightLeft },
    { name: 'Card Center', href: '/dashboard/cards', icon: CreditCard },
    { name: 'KYC Verification', href: '/dashboard/kyc', icon: ShieldCheck },
  ];

  if (!currentUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={48} className="animate-spin text-primary" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Decrypting Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800">
      
      {/* 1. Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-secondary text-slate-350 border-r border-slate-800">
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-850 gap-2 text-white font-bold text-lg">
          <Landmark size={24} className="text-primary animate-pulse" />
          <span>Access <span className="text-primary">National</span></span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white font-bold shadow-lg shadow-red-950/20'
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User info & Logout */}
        <div className="p-4 border-t border-slate-850 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-sm uppercase">
              {currentUser.fullName ? currentUser.fullName[0] : currentUser.username[0]}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-tight truncate max-w-[140px]">
                {currentUser.fullName || currentUser.username}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[140px]">
                Acc: {currentUser.accountNumber}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold hover:bg-red-950/20 hover:text-red-400 text-red-500/80 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-primary cursor-pointer"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight hidden sm:block">
              Secure Online Vault
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Profile info */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
                  Client Account
                </span>
              </div>
              <Link href="/dashboard/kyc" className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:text-primary border border-slate-200 transition-colors">
                <User size={18} />
              </Link>
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* 3. Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden flex">
          <aside className="w-64 bg-secondary text-slate-350 flex flex-col h-full animate-slideIn">
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-850 text-white font-bold text-lg">
              <div className="flex items-center gap-2">
                <Landmark size={24} className="text-primary" />
                <span>Access National</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-850 flex flex-col gap-3">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
          {/* Overlay click to close */}
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

    </div>
  );
}
