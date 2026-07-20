'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, FileText, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { useTermsStore } from '@/store/termsStore';
import { api } from '@/util/api';

export default function TermsAdminPage() {
  const { terms, loading, fetchTerms } = useTermsStore();
  const [localTerms, setLocalTerms] = useState({ title: '', content: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  useEffect(() => {
    if (terms) {
      setLocalTerms({
        title: terms.title || '',
        content: terms.content || '',
      });
    }
  }, [terms]);

  const handleUpdateTerms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.put('/admin/terms', localTerms);

      setSuccessMsg('Terms & Conditions updated successfully!');
      fetchTerms();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !terms.title) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Syncing policy files...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Terms & Privacy Editor</h2>
        <p className="text-slate-550 text-xs font-light">Edit policy guidelines and terms of services displayed to checking account users.</p>
      </div>

      {/* Alert Messaging */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex gap-2.5 items-center">
          <CheckCircle size={18} className="flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-850 p-4 rounded-xl text-xs flex gap-2.5 items-center">
          <AlertCircle size={18} className="flex-shrink-0 text-red-555" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form: Edit Terms */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-855 uppercase tracking-wider mb-6 flex items-center gap-2 pb-2 border-b border-slate-100">
          <FileText size={18} className="text-primary" />
          <span>Policy Document Specifications</span>
        </h3>
        
        <form onSubmit={handleUpdateTerms} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Document Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Terms of Service & Privacy Policy Agreement"
              value={localTerms.title}
              onChange={(e) => setLocalTerms({ ...localTerms, title: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-primary font-bold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Document Content Text</label>
            <textarea
              required
              rows={15}
              placeholder="Paste terms policy paragraphs here..."
              value={localTerms.content}
              onChange={(e) => setLocalTerms({ ...localTerms, content: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded px-4 py-3 text-xs text-slate-705 focus:outline-none focus:border-primary resize-y font-light leading-relaxed font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer self-start"
          >
            <Save size={16} />
            <span>{submitting ? 'Updating Policy...' : 'Save Document Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
