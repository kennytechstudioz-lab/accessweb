'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Landmark, 
  Users, 
  ArrowRightLeft, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  CreditCard, 
  Bell, 
  FileText, 
  ChevronDown,
  X,
  Menu
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import WebSocketListener from '@/components/WebSocketListener';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [isPagesOpen, setIsPagesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { message, type, hideToast } = useToastStore();
  const { notifications, fetchNotifications } = useNotificationsStore();

  useEffect(() => {
    if (adminUser) {
      fetchNotifications();
    }
  }, [fetchNotifications, adminUser]);

  const unreadCount = notifications.filter((n) => !n.isRead && n.status !== 'read').length;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      if (parsedUser.status !== 'Admin') {
        router.push('/dashboard');
        return;
      }
      setAdminUser(parsedUser);
    } catch (e) {
      localStorage.clear();
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (pathname.includes('/admin/pages')) {
      setIsPagesOpen(true);
    }
    if (pathname.includes('/admin/settings')) {
      setIsSettingsOpen(true);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const menuLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Transactions', href: '/admin/transactions', icon: ArrowRightLeft },
    { name: 'Currencies', href: '/admin/currencies', icon: Landmark },
    { name: 'Cards', href: '/admin/cards', icon: CreditCard },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    {
      name: 'Pages',
      icon: FileText,
      submenu: [
        { name: 'FAQ', href: '/admin/pages/faq' },
        { name: 'Blogs', href: '/admin/pages/blogs' },
        { name: 'Terms & Privacy', href: '/admin/pages/terms' },
      ],
    },
    {
      name: 'Settings',
      icon: Settings,
      submenu: [
        { name: 'Company', href: '/admin/settings/company' },
        { name: 'Emails', href: '/admin/settings/emails' },
        { name: 'Notifications', href: '/admin/settings/notifications' },
      ],
    },
  ];

  if (!adminUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={48} className="animate-spin text-primary" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Verifying Admin Vault Keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 overflow-hidden relative">
      
      {/* Floating Toast Notification overlay */}
      {message && (
        <div className="fixed top-6 right-6 z-[9999] animate-slideIn">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-center justify-between gap-4 min-w-[320px] max-w-sm ${
            type === 'success' 
              ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
              : 'bg-red-50 border-red-250 text-red-850'
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
      <aside className="hidden md:flex flex-col w-64 bg-primary text-white justify-between h-full select-none shadow-xl relative z-30">
        <div className="overflow-y-auto flex-1 scrollbar-thin">
          <div className="h-20 flex items-center px-6 border-b border-red-800">
            <Link href="/">
              <img src="/images/AccessWhiteLogo.png" alt="Access National Bank" className="h-8 w-auto object-contain hover:opacity-80 transition-opacity" />
            </Link>
          </div>

          {/* Links */}
          <nav className="px-4 py-6 flex flex-col gap-1.5">
            {menuLinks.map((link) => {
              const Icon = link.icon;
              
              if (link.submenu) {
                const isPages = link.name === 'Pages';
                const isOpen = isPages ? isPagesOpen : isSettingsOpen;
                const setIsOpen = isPages ? setIsPagesOpen : setIsSettingsOpen;
                const isSubmenuActive = pathname.startsWith(isPages ? '/admin/pages' : '/admin/settings');
                
                return (
                  <div key={link.name} className="flex flex-col gap-1">
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all hover:bg-white/10 text-red-100 hover:text-white cursor-pointer ${
                        isSubmenuActive ? 'text-white bg-white/10 font-bold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon size={18} />
                        <span>{link.name}</span>
                      </div>
                      <ChevronDown size={14} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isOpen && (
                      <div className="pl-12 pr-2 py-1 flex flex-col gap-1.5 ml-2">
                        {link.submenu.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className={`block py-1.5 text-xs font-semibold transition-colors ${
                                isSubActive
                                  ? 'text-white font-black underline decoration-2 underline-offset-4'
                                  : 'text-red-150 hover:text-white'
                              }`}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = pathname === link.href;
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

        {/* Footer info & Logout */}
        <div className="p-4 flex flex-col gap-3 border-t border-red-800">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm border border-white/20">
              {adminUser.fullName ? adminUser.fullName[0] : 'A'}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                {adminUser.fullName || 'System Admin'}
              </span>
              <span className="text-[10px] text-red-200 font-medium tracking-wider uppercase mt-0.5">Master Key</span>
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

      {/* 2. Main Content Body */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 text-slate-800">
        
        {/* Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-primary cursor-pointer"
              title="Open Navigation"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-extrabold text-slate-900 text-xs sm:text-base uppercase tracking-wider">
              Access National Regulatory Audit Panel
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block bg-red-500/10 border border-red-500/20 text-primary px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider">
              Live Database
            </span>
            
            {/* Header action icons */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
              <Link 
                href="/admin/notifications"
                className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-full transition-colors cursor-pointer relative"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white font-black text-[9px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {unreadCount > 10 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <Link
                href="/admin/settings/company"
                className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-full transition-colors cursor-pointer"
                title="Profile Settings"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/20">
                  {adminUser.fullName ? adminUser.fullName[0] : 'A'}
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

        {/* content */}
        <main className="flex-1 overflow-y-auto px-[10px] py-4 sm:p-6 md:p-8 bg-slate-100">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* 3. Mobile Sidebar Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 md:hidden flex">
          <aside className="w-64 bg-primary text-white flex flex-col justify-between h-full select-none shadow-xl animate-slideIn">
            <div className="overflow-y-auto flex-1 scrollbar-thin">
              <div className="h-20 flex items-center justify-between px-6 border-b border-red-800">
                <Link href="/" onClick={() => setSidebarOpen(false)}>
                  <img src="/images/AccessWhiteLogo.png" alt="Access National Bank" className="h-8 w-auto object-contain" />
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="text-white hover:text-red-200 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              {/* Links */}
              <nav className="px-4 py-6 flex flex-col gap-1.5">
                {menuLinks.map((link) => {
                  const Icon = link.icon;
                  
                  if (link.submenu) {
                    const isPages = link.name === 'Pages';
                    const isOpen = isPages ? isPagesOpen : isSettingsOpen;
                    const setIsOpen = isPages ? setIsPagesOpen : setIsSettingsOpen;
                    const isSubmenuActive = pathname.startsWith(isPages ? '/admin/pages' : '/admin/settings');
                    
                    return (
                      <div key={link.name} className="flex flex-col gap-1">
                        <button
                          onClick={() => setIsOpen(!isOpen)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all hover:bg-white/10 text-red-100 hover:text-white cursor-pointer ${
                            isSubmenuActive ? 'text-white bg-white/10 font-bold' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <Icon size={18} />
                            <span>{link.name}</span>
                          </div>
                          <ChevronDown size={14} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isOpen && (
                          <div className="pl-12 pr-2 py-1 flex flex-col gap-1.5 ml-2">
                            {link.submenu.map((sub) => {
                              const isSubActive = pathname === sub.href;
                              return (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`block py-1.5 text-xs font-semibold transition-colors ${
                                    isSubActive
                                      ? 'text-white font-black underline decoration-2 underline-offset-4'
                                      : 'text-red-150 hover:text-white'
                                  }`}
                                >
                                  {sub.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
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

            <div className="p-4 flex flex-col gap-3 border-t border-red-800">
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm border border-white/20">
                  {adminUser.fullName ? adminUser.fullName[0] : 'A'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                    {adminUser.fullName || 'System Admin'}
                  </span>
                  <span className="text-[10px] text-red-200 font-medium tracking-wider uppercase mt-0.5">Master Key</span>
                </div>
              </div>
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

          {/* Backdrop overlay click to close */}
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <WebSocketListener role="admin" />
    </div>
  );
}
