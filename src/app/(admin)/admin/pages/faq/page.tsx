'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, HelpCircle, Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { useFaqStore } from '@/store/faqStore';
import { api } from '@/util/api';

export default function FaqAdminPage() {
  const { faqs, loading, fetchFaqs } = useFaqStore();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    category: '',
    question: '',
    answer: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.post('/admin/faq', form);

      setSuccessMsg('FAQ created successfully!');
      setForm({
        category: '',
        question: '',
        answer: '',
      });
      fetchFaqs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm('Delete this FAQ record?')) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.delete(`/admin/faq/${id}`);
      setSuccessMsg('FAQ deleted.');
      fetchFaqs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    }
  };

  if (loading && faqs.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-550 text-xs font-semibold uppercase tracking-wider">Syncing FAQs logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">FAQ Page Manager</h2>
        <p className="text-slate-550 text-xs font-light">Manage question categories and detailed answers displayed on the landing support page.</p>
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
          <AlertCircle size={18} className="flex-shrink-0 text-red-650" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form: Add FAQ */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-855 uppercase tracking-wider mb-5 flex items-center gap-2 pb-2 border-b border-slate-100">
          <Plus size={16} className="text-primary" />
          <span>Add New FAQ</span>
        </h3>
        <form onSubmit={handleCreateFaq} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">FAQ Category (e.g. Accounts, Wire Clearance)</label>
            <input
              type="text"
              required
              placeholder="e.g. Checking & Savings"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-slate-550 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Question Text</label>
            <input
              type="text"
              required
              placeholder="e.g. How do I request an international wire clearance?"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="bg-slate-550 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Answer Text</label>
            <textarea
              required
              rows={4}
              placeholder="Type detailed answer description..."
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              className="bg-slate-550 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{submitting ? 'Creating FAQ Record...' : 'Publish FAQ'}</span>
          </button>
        </form>
      </div>

      {/* List: Existing FAQs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-855 uppercase tracking-wider mb-5 flex items-center gap-2 pb-2 border-b border-slate-100">
          <HelpCircle size={16} className="text-primary" />
          <span>Active FAQ Records</span>
        </h3>

        {faqs.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center font-light">No FAQ records found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {faqs.map((faq) => (
              <div key={faq._id} className="bg-slate-50 border border-slate-100 p-5 rounded-xl flex justify-between items-start gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{faq.category}</span>
                  <h4 className="font-bold text-slate-800 text-sm">{faq.question}</h4>
                  <p className="text-xs text-slate-500 font-light leading-relaxed">{faq.answer}</p>
                </div>
                <button
                  onClick={() => handleDeleteFaq(faq._id)}
                  className="p-2 text-slate-400 hover:text-red-655 hover:bg-red-50 rounded transition-colors cursor-pointer flex-shrink-0"
                  title="Delete FAQ"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
