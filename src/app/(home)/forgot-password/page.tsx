import React from 'react';
import { Metadata } from 'next';
import ForgotPasswordClient from './ForgotPasswordClient';

export const metadata: Metadata = {
  title: 'Reset Password | Access National Bank',
  description: 'Reset your Access National Bank password securely. Request vault clearance instructions via registered email.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
