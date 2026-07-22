import React from 'react';
import { Metadata } from 'next';
import PrivacyClientPage from './PrivacyClientPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | Access National Bank',
  description: 'Learn how Access National Bank safeguards your personal information, financial data, and account details with high-level encryption and strict privacy policies.',
  openGraph: {
    title: 'Privacy Policy | Access National Bank',
    description: 'Learn how Access National Bank safeguards your personal information, financial data, and account details with high-level encryption and strict privacy policies.',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return <PrivacyClientPage />;
}
