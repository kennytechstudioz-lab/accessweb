'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';

export default function Footer() {
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <footer className="bg-secondary text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Logo & Description */}
        <div className="flex flex-col gap-4">
          <Link href="/#top" className="flex items-center">
            <img src="/images/AccessRedLogo.png" alt="Access National Bank" className="h-10 w-auto object-contain" />
          </Link>
          <p className="text-sm font-light leading-relaxed">
            Access National Bank is a premier global financial institution offering state-of-the-art multi-currency checking, savings, and investment solutions. We empower your international wealth management.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li><Link href="/#top" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link href="/#about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="/#blog" className="hover:text-primary transition-colors">Blog</Link></li>
            <li><Link href="/#faq" className="hover:text-primary transition-colors">FAQs & Support</Link></li>
            <li><Link href="/#contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Our Services */}
        <div>
          <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Services</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li><span className="hover:text-primary transition-colors cursor-pointer">Checking Accounts</span></li>
            <li><span className="hover:text-primary transition-colors cursor-pointer">Savings & Wealth Plans</span></li>
            <li><span className="hover:text-primary transition-colors cursor-pointer">International Escrow</span></li>
            <li><span className="hover:text-primary transition-colors cursor-pointer">Multi-currency Cards</span></li>
            <li><span className="hover:text-primary transition-colors cursor-pointer">Commercial Lending</span></li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Contact Info</h4>
          <ul className="flex flex-col gap-4 text-sm font-light">
            <li className="flex items-start gap-2.5">
              <MapPin size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <span>{settings?.companyAddress || '6060 ROCKSIDE WOODS BLVD, OH United States'}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={18} className="text-primary flex-shrink-0" />
              <span>{settings?.companyPhoneNumber || '+1 (555) 123-4567'}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={18} className="text-primary flex-shrink-0" />
              <a href={`mailto:${settings?.systemEmail || 'support@accessnationalltd.online'}`} className="hover:text-primary transition-colors">
                {settings?.systemEmail || 'support@accessnationalltd.online'}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light text-slate-500">
        <p>&copy; {new Date().getFullYear()} Access National Bank. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/#about" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/#about" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="/#faq" className="hover:text-primary transition-colors">Security Clearance</Link>
        </div>
      </div>
    </footer>
  );
}

