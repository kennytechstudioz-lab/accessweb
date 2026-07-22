'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KYCPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/profile');
  }, [router]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold animate-pulse">
        Redirecting to Profile Verification Vault...
      </p>
    </div>
  );
}
