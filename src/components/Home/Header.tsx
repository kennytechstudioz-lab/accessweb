'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, MapPin, Landmark, Menu, X, User } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (pathname === '/') {
      e.preventDefault();
      if (targetId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <>
      {/* 1. Header Section (Top Bar - Not Sticky) */}
      <header className="bg-secondary text-header-fg text-xs py-2.5 border-b border-slate-800">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-2">
          {/* Top Links */}
          <div className="flex items-center gap-5 font-light text-slate-300">
            <Link href="/#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-primary transition-colors">Career</Link>
            <Link href="/#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-primary transition-colors">Faq</Link>
            <Link href="/#blog" onClick={(e) => handleNavClick(e, 'blog')} className="hover:text-primary transition-colors">Rewards</Link>
            <Link href="/#about" onClick={(e) => handleNavClick(e, 'about')} className="hover:text-primary transition-colors">Media</Link>
          </div>
          {/* Contact & Branch Info */}
          <div className="flex flex-wrap items-center gap-6 text-slate-300">
            <a href="mailto:info@accessnationalltd.online" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Mail size={14} className="text-primary" />
              <span>info@accessnationalltd.online</span>
            </a>
            <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
              <MapPin size={14} className="text-primary" />
              <span>Find Nearest Branch</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Navigation Section (Sticky White Bar) */}
      <nav className="sticky-nav bg-nav-bg text-nav-fg border-b border-slate-200">
        <div className="max-w-[1380px] mx-auto flex justify-between items-center h-20 px-4 sm:px-8 md:px-12 relative">
          
          {/* Logo Slant Background on Left */}
          <div className="absolute left-4 sm:left-8 md:left-12 top-0 bottom-0 flex items-center pr-8 z-10">
            <Link href="/#top" onClick={(e) => handleNavClick(e, 'top')} className="slant-bg text-white h-full px-6 sm:px-10 flex items-center gap-2 font-bold text-lg sm:text-xl shadow-lg animate-fadeIn">
              <Landmark size={24} className="animate-pulse" />
              <span className="tracking-tight z-10">Access <span className="font-light">National</span></span>
            </Link>
          </div>

          {/* Spacing placeholder for the absolute logo */}
          <div className="w-48 sm:w-64 md:w-72 h-full flex-shrink-0" />

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 font-semibold">
            <Link href="/#top" onClick={(e) => handleNavClick(e, 'top')} className="hover:text-primary transition-colors py-2">Home</Link>
            <Link href="/#about" onClick={(e) => handleNavClick(e, 'about')} className="hover:text-primary transition-colors py-2">About</Link>
            <Link href="/#blog" onClick={(e) => handleNavClick(e, 'blog')} className="hover:text-primary transition-colors py-2">Blog</Link>
            <Link href="/#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-primary transition-colors py-2">FAQ</Link>
            <Link href="/#contact" onClick={(e) => handleNavClick(e, 'contact')} className="hover:text-primary transition-colors py-2">Contact</Link>
          </div>

          {/* Desktop Authentication Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="border border-secondary px-6 py-2.5 rounded hover:bg-secondary hover:text-white transition-all font-semibold text-sm">
              Login
            </Link>
            <Link href="/register" className="bg-primary text-white px-6 py-2.5 rounded hover:bg-primary-hover shadow-md shadow-red-100 hover:shadow-lg transition-all font-semibold text-sm">
              Open Account
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-3">
            <Link href="/login" className="p-2 text-slate-600 hover:text-primary transition-colors" title="Login">
              <User size={20} />
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-primary focus:outline-none cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 py-4 px-6 flex flex-col gap-4 animate-fadeIn shadow-inner">
            <Link href="/#top" className="font-semibold text-slate-700 hover:text-primary py-2" onClick={(e) => { handleNavClick(e, 'top'); setIsMobileMenuOpen(false); }}>Home</Link>
            <Link href="/#about" className="font-semibold text-slate-700 hover:text-primary py-2" onClick={(e) => { handleNavClick(e, 'about'); setIsMobileMenuOpen(false); }}>About</Link>
            <Link href="/#blog" className="font-semibold text-slate-700 hover:text-primary py-2" onClick={(e) => { handleNavClick(e, 'blog'); setIsMobileMenuOpen(false); }}>Blog</Link>
            <Link href="/#faq" className="font-semibold text-slate-700 hover:text-primary py-2" onClick={(e) => { handleNavClick(e, 'faq'); setIsMobileMenuOpen(false); }}>FAQs</Link>
            <Link href="/#contact" className="font-semibold text-slate-700 hover:text-primary py-2" onClick={(e) => { handleNavClick(e, 'contact'); setIsMobileMenuOpen(false); }}>Contact</Link>
            <hr className="border-slate-100" />
            <div className="flex flex-col gap-3 py-2">
              <Link href="/login" className="border border-secondary py-3.5 text-center rounded font-semibold text-slate-800 hover:bg-slate-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Login
              </Link>
              <Link href="/register" className="bg-primary text-white py-3.5 text-center rounded font-semibold hover:bg-primary-hover shadow-md transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Open Account
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
