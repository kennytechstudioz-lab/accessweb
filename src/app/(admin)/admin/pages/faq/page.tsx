'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, HelpCircle, Trash2, Plus, AlertCircle, CheckCircle, X, Pencil } from 'lucide-react';
import { useFaqStore } from '@/store/faqStore';
import { api } from '@/util/api';

export default function FaqAdminPage() {
  const { faqs, loading, fetchFaqs } = useFaqStore();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    category: '',
    question: '',
    answer: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleOpenCreateModal = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setEditingId(null);
    setForm({ category: '', question: '', answer: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq: any) => {
    setErrorMsg('');
    setSuccessMsg('');
    setEditingId(faq._id);
    setForm({
      category: faq.category || '',
      question: faq.question || '',
      answer: faq.answer || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingId) {
        await api.put(`/admin/faq/${editingId}`, form);
        setSuccessMsg('FAQ updated successfully!');
      } else {
        await api.post('/admin/faq', form);
        setSuccessMsg('FAQ created successfully!');
      }

      setForm({ category: '', question: '', answer: '' });
      setEditingId(null);
      setIsModalOpen(false);
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
      {/* Title Header with Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">FAQ Page Manager</h2>
          <p className="text-slate-550 text-xs font-light">Manage question categories and detailed answers displayed on the landing support page.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-primary hover:bg-primary-hover text-white font-bold px-5 py-3 rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          <Plus size={16} />
          <span>Create FAQ</span>
        </button>
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

      {/* List: Existing FAQs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-855 uppercase tracking-wider mb-5 flex items-center gap-2 pb-2 border-b border-slate-100">
          <HelpCircle size={16} className="text-primary" />
          <span>Active FAQ Records ({faqs.length})</span>
        </h3>

        {faqs.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center font-light">No FAQ records found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {faqs.map((faq) => (
              <div key={faq._id} className="bg-slate-50 border border-slate-100 p-5 rounded-xl flex justify-between items-start gap-4 hover:border-slate-300 transition-colors">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{faq.category}</span>
                  <h4 className="font-bold text-slate-800 text-sm">{faq.question}</h4>
                  <p className="text-xs text-slate-500 font-light leading-relaxed">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(faq)}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                    title="Edit FAQ"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq._id)}
                    className="p-2 text-slate-400 hover:text-red-655 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete FAQ"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create / Edit FAQ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider flex items-center gap-2">
                {editingId ? <Pencil size={16} className="text-primary" /> : <Plus size={16} className="text-primary" />}
                <span>{editingId ? 'Edit FAQ Record' : 'Create New FAQ'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveFaq} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">FAQ Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Banking, Wire Clearance"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Question</label>
                <input
                  type="text"
                  required
                  placeholder="Type question text..."
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Answer</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type answer description..."
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update FAQ' : 'Create FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


