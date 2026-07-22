import React from 'react';
import { Metadata } from 'next';
import TermsClientPage from './TermsClientPage';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Access National Bank',
  description: 'Read the official Terms and Conditions governing your accounts, transfers, digital banking services, and security protocols at Access National Bank.',
  openGraph: {
    title: 'Terms & Conditions | Access National Bank',
    description: 'Read the official Terms and Conditions governing your accounts, transfers, digital banking services, and security protocols at Access National Bank.',
    type: 'website',
  },
};

export default function TermsPage() {
  return <TermsClientPage />;
}
