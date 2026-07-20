'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, Mail, Save, AlertCircle } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { api } from '@/util/api';

export default function EmailsSettingsPage() {
  const { showToast } = useToastStore();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  const [form, setForm] = useState({
    title: '',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTemplates = async () => {
    try {
      const data = await api.get('/admin/emails');
      setTemplates(Array.isArray(data) ? data : []);
      if (data && data.length > 0) {
        // Maintain selection or select first
        const currentSelected = selectedTemplate 
          ? data.find((t: any) => t._id === selectedTemplate._id) || data[0]
          : data[0];
        
        setSelectedTemplate(currentSelected);
        setForm({
          title: currentSelected.title || '',
          content: currentSelected.content || '',
        });
      }
    } catch (e: any) {
      showToast(e.message || 'Error fetching email templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setForm({
      title: template.title || '',
      content: template.content || '',
    });
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    setSubmitting(true);

    try {
      await api.put(`/admin/emails/${selectedTemplate._id}`, form);
      showToast(`Email template "${selectedTemplate.name}" updated!`, 'success');
      await fetchTemplates();
    } catch (err: any) {
      showToast(err.message || 'Error saving template', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Syncing Email Templates Vault...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Email System Templates</h2>
        <p className="text-slate-550 text-xs font-light">Customize emails automatically dispatched to users on key banking activities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Template Directory */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Templates List</h3>
          
          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
            {templates.length === 0 ? (
              <p className="text-slate-400 text-xs py-8 text-center">No email templates seeded.</p>
            ) : (
              templates.map((template) => (
                <button
                  key={template._id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                    selectedTemplate?._id === template._id
                      ? 'bg-slate-55 border-primary shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Mail size={16} className={selectedTemplate?._id === template._id ? 'text-primary' : 'text-slate-400'} />
                  <div className="flex flex-col gap-0.5 truncate">
                    <span className="text-xs font-bold text-slate-800 truncate">{template.name}</span>
                    <span className="text-[10px] text-slate-400 truncate">{template.title}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Edit Form */}
        <div className="lg:col-span-8">
          {!selectedTemplate ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center flex flex-col items-center gap-3 shadow-sm">
              <Mail size={40} className="text-slate-300 animate-pulse" />
              <p className="text-slate-400 text-xs font-light">Select a template from the list to modify its layout.</p>
            </div>
          ) : (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
              
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Editing Template: {selectedTemplate.name}
                  </h4>
                  <span className="text-[10px] text-slate-450 font-mono">System Trigger Key: {selectedTemplate.name}</span>
                </div>
              </div>

              {/* Template Tags Helper Alert */}
              <div className="bg-slate-50 border border-slate-200 text-slate-650 p-4 rounded-xl text-xs flex gap-2.5 items-start">
                <AlertCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 leading-relaxed">
                  <span className="font-bold">Template Variable Placeholders:</span>
                  <span>Use double curly braces to display activity variables, e.g. <code>{"{{amount}}"}</code>, <code>{"{{currency}}"}</code>, <code>{"{{pin}}"}</code>, <code>{"{{activate}}"}</code> depending on the trigger type.</span>
                </div>
              </div>

              <form onSubmit={handleSaveTemplate} className="flex flex-col gap-5">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Subject Title Header</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="border border-slate-200 rounded px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Email Content Body (HTML Supported)</label>
                  <textarea
                    required
                    rows={12}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="border border-slate-200 rounded px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-primary resize-y font-mono leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer self-start"
                >
                  <Save size={14} />
                  <span>{submitting ? 'Saving Template Changes...' : 'Save Template'}</span>
                </button>

              </form>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
