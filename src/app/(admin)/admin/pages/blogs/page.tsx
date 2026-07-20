'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, FileText, Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { useBlogsStore } from '@/store/blogsStore';
import { api } from '@/util/api';

export default function BlogsAdminPage() {
  const { blogs, loading, fetchBlogs } = useBlogsStore();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    category: '',
    title: '',
    subtitle: '',
    author: '',
    banner: '',
    content: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.post('/admin/blogs', form);

      setSuccessMsg('Blog post published successfully!');
      setForm({
        category: '',
        title: '',
        subtitle: '',
        author: '',
        banner: '',
        content: '',
      });
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
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Blog Articles Desk</h2>
        <p className="text-slate-555 text-xs font-light">Create, update, or remove active news update feed bulletins.</p>
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

      {/* Form: Add Blog Post */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-855 uppercase tracking-wider mb-5 flex items-center gap-2 pb-2 border-b border-slate-100">
          <Plus size={16} className="text-primary" />
          <span>Draft New Article</span>
        </h3>
        <form onSubmit={handleCreateBlog} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-655">Category Tag (e.g. Savings, Regulatory)</label>
              <input
                type="text"
                required
                placeholder="e.g. Wealth Security"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-650">Author Name</label>
              <input
                type="text"
                placeholder="e.g. System Admin"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-650">Banner Image URL</label>
              <input
                type="text"
                placeholder="e.g. /images/news-1.jpg"
                value={form.banner}
                onChange={(e) => setForm({ ...form, banner: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-650">Article Title Header</label>
              <input
                type="text"
                required
                placeholder="e.g. Implementing Multi-currency Secure TAC clearances"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary font-bold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-650">Brief Subtitle/Summary Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Learn how our new TAC codes secure international checking accounts..."
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary font-light"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-655">Article Text Content Body</label>
            <textarea
              required
              rows={6}
              placeholder="Draft your full article content here..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary resize-none font-sans leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{submitting ? 'Publishing Draft Article...' : 'Publish Article'}</span>
          </button>
        </form>
      </div>

      {/* Grid: Existing Articles */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-855 uppercase tracking-wider mb-5 flex items-center gap-2 pb-2 border-b border-slate-100">
          <FileText size={16} className="text-primary" />
          <span>Published Articles</span>
        </h3>

        {blogs.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center font-light">No articles found in news ledger.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 pb-3">
                  <th className="pb-3 text-slate-400">Article Details</th>
                  <th className="pb-3 text-slate-400">Category</th>
                  <th className="pb-3 text-slate-400">Author</th>
                  <th className="pb-3 text-slate-400">Date</th>
                  <th className="pb-3 text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blogs.map((blog) => {
                  const dateStr = new Date(blog.time * 1000).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={blog._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {blog.banner && <img src={blog.banner} alt={blog.title} className="w-12 h-8 object-cover rounded shadow-sm flex-shrink-0" />}
                          <div className="flex flex-col gap-0.5 max-w-sm">
                            <span className="text-slate-855 font-bold text-xs">{blog.title}</span>
                            <span className="text-[10px] text-slate-500 truncate">{blog.subtitle}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-slate-705 font-semibold">{blog.category}</td>
                      <td className="py-4 text-slate-600">{blog.author || 'Admin'}</td>
                      <td className="py-4 text-slate-500 font-light font-mono">{dateStr}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteBlog(blog._id)}
                          className="p-2 text-slate-400 hover:text-red-655 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
