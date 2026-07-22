'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, Bell, Edit3, X, AlertCircle, Save, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTemplatesStore } from '@/store/templatesStore';
import { useToastStore } from '@/store/toastStore';
import { api } from '@/util/api';

export default function NotificationsSettingsPage() {
  const { 
    notificationTemplates, 
    notificationPage, 
    notificationTotalPages, 
    loadingNotifications, 
    fetchNotificationTemplates 
  } = useTemplatesStore();
  const { showToast } = useToastStore();

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchNotificationTemplates(1);
  }, [fetchNotificationTemplates]);

  const handleStartCreate = () => {
    setIsCreateMode(true);
    setSelectedTemplate(null);
    setForm({
      name: '',
      title: '',
      content: '',
    });
    setIsModalOpen(true);
  };

  const handleStartEdit = (template: any) => {
    setIsCreateMode(false);
    setSelectedTemplate(template);
    setForm({
      name: template.name || '',
      title: template.title || '',
      content: template.content || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isCreateMode) {
        await api.post('/admin/notification-templates', form);
        showToast(`Notification template "${form.name}" created successfully!`, 'success');
      } else {
        await api.put(`/admin/notification-templates/${selectedTemplate._id}`, {
          title: form.title,
          content: form.content,
        });
        showToast(`Notification template "${selectedTemplate.name}" updated successfully!`, 'success');
      }
      setIsModalOpen(false);
      fetchNotificationTemplates(notificationPage);
    } catch (err: any) {
      showToast(err.message || 'Error saving template', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= notificationTotalPages) {
      fetchNotificationTemplates(newPage);
    }
  };

  if (loadingNotifications && notificationTemplates.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-550 text-xs font-semibold uppercase tracking-wider">Syncing Notification Templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header bar with Action Button */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Notification System Templates</h2>
          <p className="text-slate-550 text-xs font-light">Customize user push notifications dispatched to user accounts on key banking activities.</p>
        </div>
        <button
          onClick={handleStartCreate}
          className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-3 rounded-lg flex items-center gap-2 shadow-md transition-all cursor-pointer animate-fadeIn"
        >
          <Plus size={16} />
          <span>Create Template</span>
        </button>
      </div>

      {/* Main Full Width Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {notificationTemplates.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center font-light">No notification templates seeded.</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 pb-3">
                    <th className="pb-3 text-slate-400 w-12">S/N</th>
                    <th className="pb-3 text-slate-400 w-12">Icon</th>
                    <th className="pb-3 text-slate-400">Trigger Key (Name)</th>
                    <th className="pb-3 text-slate-400">Alert Title Header</th>
                    <th className="pb-3 text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notificationTemplates.map((template, idx) => (
                    <tr key={template._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-mono font-bold text-slate-400">{(notificationPage - 1) * 20 + idx + 1}</td>
                      <td className="py-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-inner">
                          <Bell size={14} />
                        </div>
                      </td>
                      <td className="py-4 font-bold text-slate-855 font-mono">{template.name}</td>
                      <td className="py-4 text-slate-600 font-semibold">{template.title}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleStartEdit(template)}
                          className="p-2 text-slate-455 hover:text-primary hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Edit Template content"
                        >
                          <Edit3 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {notificationTotalPages > 1 && (
              <div className="flex justify-end items-center gap-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600 font-mono">
                <button
                  disabled={notificationPage <= 1}
                  onClick={() => handlePageChange(notificationPage - 1)}
                  className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <span>Page <span className="font-bold text-slate-800">{notificationPage}</span> of {notificationTotalPages}</span>
                <button
                  disabled={notificationPage >= notificationTotalPages}
                  onClick={() => handlePageChange(notificationPage + 1)}
                  className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit/Create Template Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-slideIn">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Bell size={14} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    {isCreateMode ? 'Create Notification Template' : `Edit Notification: ${selectedTemplate?.name}`}
                  </h3>
                  <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                    {isCreateMode ? 'Define a new system trigger key template' : `System Trigger Key: ${selectedTemplate?.name}`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-655 cursor-pointer p-1.5 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTemplate}>
              
              <div className="p-6 flex flex-col gap-5 max-h-[65vh] overflow-y-auto">
                
                {/* Variable guidelines helper warning */}
                <div className="bg-slate-50 border border-slate-200 text-slate-600 p-4 rounded-xl text-xs flex gap-2.5 items-start">
                  <AlertCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1 leading-relaxed">
                    <span className="font-bold">Template Variable Placeholders:</span>
                    <span>Use double curly braces to display activity variables, e.g. <code>{"{{amount}}"}</code>, <code>{"{{currency}}"}</code> depending on the trigger.</span>
                  </div>
                </div>

                {isCreateMode && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-550 uppercase">Trigger Key (Name)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DEPOSIT_SUCCESS"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary font-mono font-bold"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-550 uppercase">Alert Header Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="border border-slate-200 rounded px-4 py-2.5 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-550 uppercase">Alert Content Message</label>
                  <textarea
                    required
                    rows={8}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="border border-slate-200 rounded px-4 py-3 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary resize-y font-mono leading-relaxed"
                  />
                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-2.5 rounded shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={13} />
                  <span>{submitting ? 'Saving changes...' : 'Save Template'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
