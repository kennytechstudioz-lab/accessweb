'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, ShieldAlert, CheckCircle, UploadCloud, AlertCircle } from 'lucide-react';

export default function KYC() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileSelected, setFileSelected] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const res = await fetch(`${apiUrl}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data);
    } catch (e) {
      console.error('Error fetching profile:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileSelected(e.target.files[0].name);
      setError('');
      setSuccess('');
    }
  };

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileSelected) {
      setError('Please select a photocopy of your identity card/passport to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    // Simulate upload delay for visual feedback
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

        const res = await fetch(`${apiUrl}/user/kyc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            passport: fileSelected,
            profilePicture: 'avatar_seeded.jpg',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'KYC submission failed');
        }

        setSuccess('Your identity clearance document was successfully uploaded for audit.');
        setFileSelected(null);
        fetchProfile();
      } catch (err: any) {
        setError(err.message || 'Error submitting documents.');
      } finally {
        setUploading(false);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Syncing Audit Logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Identity Vault Verification</h2>
        <p className="text-slate-400 text-xs font-light">Verify your government-approved passport/ID copy to unlock outbound wire transfers.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex gap-2 items-center">
          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs flex gap-2 items-center">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Document upload box */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Submit Identity Proof</h3>
          
          {profile?.isVerified ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center flex flex-col items-center gap-3">
              <CheckCircle size={40} className="text-emerald-600 animate-pulse" />
              <h4 className="font-bold text-emerald-900 text-base">Account Fully Verified</h4>
              <p className="text-xs text-emerald-700 font-light leading-relaxed max-w-sm">
                Your online banking identity has been audited and cleared by compliance administrators. Outbound wire transfers are fully active.
              </p>
            </div>
          ) : profile?.onReview ? (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-center flex flex-col items-center gap-3">
              <UploadCloud size={40} className="text-amber-600 animate-bounce" />
              <h4 className="font-bold text-amber-900 text-base">Documents Under Review</h4>
              <p className="text-xs text-amber-700 font-light leading-relaxed max-w-sm">
                Your uploaded document ({profile.passport}) is currently being audited by compliance desk. Reviews usually resolve within 1-2 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitKYC} className="flex flex-col gap-6">
              
              {/* Drag n drop box */}
              <div className="border-2 border-dashed border-slate-200 hover:border-primary/40 rounded-xl p-8 text-center flex flex-col items-center gap-3 transition-colors cursor-pointer relative bg-slate-50">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleSimulatedUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud size={36} className="text-slate-400" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-700">Click to upload or drag files</span>
                  <span className="text-[10px] text-slate-400 font-light">Supports JPEG, PNG or PDF (Max 5MB)</span>
                </div>
                {fileSelected && (
                  <div className="mt-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-1.5 rounded-full">
                    Selected: {fileSelected}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading || !fileSelected}
                className="bg-primary text-white font-bold py-3.5 rounded hover:bg-primary-hover shadow transition-all flex items-center justify-center gap-2 text-xs disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{uploading ? 'Auditing document vaults...' : 'Submit Verification'}</span>
              </button>

            </form>
          )}
        </div>

        {/* Verification Guideline notes */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-md flex flex-col gap-5">
          <h4 className="font-bold text-sm uppercase tracking-wider text-primary">Compliance Clearance Guidelines</h4>
          <p className="text-xs font-light text-slate-350 leading-relaxed">
            In compliance with standard international banking KYC (Know Your Customer) and AML (Anti-Money Laundering) requirements, all accounts clearing transfers above $5,000 must verify identity.
          </p>

          <ul className="text-xs font-light text-slate-300 flex flex-col gap-3.5 mt-2">
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Upload clear photocopies of passport info pages or drivers license.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>All texts, dates, and photographs must be fully visible and legible.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Uploaded documents are encrypted and kept in secure offline database vaults.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}
