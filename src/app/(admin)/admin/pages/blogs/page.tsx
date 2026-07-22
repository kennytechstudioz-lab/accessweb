'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, FileText, Trash2, Plus, AlertCircle, CheckCircle, X, Image as ImageIcon, Pencil } from 'lucide-react';
import { useBlogsStore } from '@/store/blogsStore';
import { api } from '@/util/api';

export default function BlogsAdminPage() {
  const { blogs, loading, fetchBlogs } = useBlogsStore();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    category: 'Blog',
    title: '',
    subtitle: '',
    author: 'Admin',
    banner: '',
    content: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleOpenCreateModal = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setEditingId(null);
    setForm({
      category: 'Blog',
      title: '',
      subtitle: '',
      author: 'Admin',
      banner: '',
      content: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (blog: any) => {
    setErrorMsg('');
    setSuccessMsg('');
    setEditingId(blog._id);
    setForm({
      category: blog.category || 'Blog',
      title: blog.title || '',
      subtitle: blog.subtitle || '',
      author: blog.author || 'Admin',
      banner: blog.banner || '',
      content: blog.content || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingId) {
        await api.put(`/admin/blogs/${editingId}`, form);
        setSuccessMsg('Blog post updated successfully!');
      } else {
        await api.post('/admin/blogs', form);
        setSuccessMsg('Blog post published successfully!');
      }

      setForm({
        category: 'Blog',
        title: '',
        subtitle: '',
        author: 'Admin',
        banner: '',
        content: '',
      });
      setEditingId(null);
      setIsModalOpen(false);
      fetchBlogs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Delete this blog post?')) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.delete(`/admin/blogs/${id}`);
      setSuccessMsg('Blog post deleted.');
      fetchBlogs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-slate-100 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Landmark size={36} className="animate-spin text-primary" />
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Syncing Media Blogs logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title Header with Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Blog Articles Desk</h2>
          <p className="text-slate-555 text-xs font-light">Create, update, or remove active news update feed bulletins.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-primary hover:bg-primary-hover text-white font-bold px-5 py-3 rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          <Plus size={16} />
          <span>Create Blog</span>
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
          <AlertCircle size={18} className="flex-shrink-0 text-red-555" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid / Table: Existing Articles */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-855 uppercase tracking-wider mb-5 flex items-center gap-2 pb-2 border-b border-slate-100">
          <FileText size={16} className="text-primary" />
          <span>Published Articles ({blogs.length})</span>
        </h3>

        {blogs.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center font-light">No articles found in news ledger.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 pb-3">
                  <th className="pb-3 text-slate-400">S/N</th>
                  <th className="pb-3 text-slate-400">Picture</th>
                  <th className="pb-3 text-slate-400">Title & Subtitle</th>
                  <th className="pb-3 text-slate-400">Category</th>
                  <th className="pb-3 text-slate-400">Date</th>
                  <th className="pb-3 text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blogs.map((blog, idx) => {
                  const dateStr = new Date(blog.time * 1000).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={blog._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td className="py-4">
                        {blog.banner ? (
                          <img src={blog.banner} alt={blog.title} className="w-14 h-10 object-cover rounded-lg shadow-sm border border-slate-200 flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-0.5 max-w-md">
                          <span className="text-slate-855 font-bold text-xs sm:text-sm leading-snug">{blog.title}</span>
                          <span className="text-[11px] text-slate-500 line-clamp-1 font-light">{blog.subtitle}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="bg-red-50 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {blog.category || 'Blog'}
                        </span>
                      </td>
                      <td className="py-4 text-slate-500 font-light font-mono text-xs">{dateStr}</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(blog)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                            title="Edit Blog Post"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog._id)}
                            className="p-2 text-slate-400 hover:text-red-655 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Post"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Blog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
              <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider flex items-center gap-2">
                {editingId ? <Pencil size={16} className="text-primary" /> : <Plus size={16} className="text-primary" />}
                <span>{editingId ? 'Edit Blog Article' : 'Create New Blog Article'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBlog} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Blog"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Author Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Admin"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Future of Digital Banking"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Subtitle</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A comprehensive guide to modern finance..."
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Picture / Banner Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-1559526324-4b87b5e36e44..."
                  value={form.banner}
                  onChange={(e) => setForm({ ...form, banner: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Article Content</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write complete blog article content..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary resize-none font-sans leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 flex-shrink-0">
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
                  {submitting ? 'Saving...' : editingId ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


