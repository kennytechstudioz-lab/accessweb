import React from 'react';
import { Metadata } from 'next';
import RegisterClient from './RegisterClient';

export const metadata: Metadata = {
  title: 'Open an Online Banking Account | Access National Bank',
  description: 'Apply for a multi-currency checking or savings account with Access National Bank. Enjoy fast global transfers, card issuance, and high-level vault security.',
  openGraph: {
    title: 'Open an Online Banking Account | Access National Bank',
    description: 'Apply for a multi-currency checking or savings account with Access National Bank. Enjoy fast global transfers, card issuance, and high-level vault security.',
    type: 'website',
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
