'use client';

import React from 'react';
import { Mail, X, Send } from 'lucide-react';

interface BulkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedUserCount: number;
  loadingDbEmails: boolean;
  dbEmailTemplates: any[];
  selectedEmailTplId: string;
  onSelectTemplate: (tpl: any) => void;
  emailForm: { subject: string; content: string };
  setEmailForm: React.Dispatch<React.SetStateAction<{ subject: string; content: string }>>;
  sendingBulkEmail: boolean;
}

export default function BulkEmailModal({
  isOpen,
  onClose,
  onSubmit,
  selectedUserCount,
  loadingDbEmails,
  dbEmailTemplates,
  selectedEmailTplId,
  onSelectTemplate,
  emailForm,
  setEmailForm,
  sendingBulkEmail,
}: BulkEmailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-slideIn">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-primary" />
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
              Select Email Template ({selectedUserCount} Recipients)
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit}>
          <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
            
            {/* DB Email Templates Cards Selection */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                <span>Database Email Templates</span>
                {loadingDbEmails && <span className="text-primary animate-pulse">Loading templates...</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
                {dbEmailTemplates.map((tpl) => {
                  const isSelected = selectedEmailTplId === tpl._id;
                  return (
                    <div
                      key={tpl._id || tpl.name}
                      onClick={() => onSelectTemplate(tpl)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                        isSelected 
                          ? 'bg-red-50/80 border-primary shadow-xs ring-1 ring-primary/20' 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                      }`}
                    >
                      <div className="font-bold text-slate-900 line-clamp-1">{tpl.title || tpl.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-light">{tpl.content || tpl.body}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Subject Preview & Edit */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-bold text-slate-700 uppercase text-[10px]">Email Subject Line</label>
              <input
                type="text"
                required
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

            {/* Selected Content Preview & Edit */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-bold text-slate-700 uppercase text-[10px]">Email Body Content (Template Preview)</label>
              <textarea
                rows={5}
                required
                value={emailForm.content}
                onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono leading-relaxed focus:outline-none focus:border-primary text-slate-800"
              />
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sendingBulkEmail || !emailForm.subject}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:bg-slate-300 flex items-center gap-2"
            >
              <Send size={14} />
              <span>{sendingBulkEmail ? 'Dispatching Emails...' : `Dispatch Email to ${selectedUserCount} Selected`}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
