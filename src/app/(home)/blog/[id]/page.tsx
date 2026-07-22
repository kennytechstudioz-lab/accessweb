'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, User, Tag, ArrowLeft, Landmark, Clock, Share2 } from 'lucide-react';
import { api } from '@/util/api';

export default function BlogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/admin/blogs/${id}`);
        setBlog(data);
      } catch (err: any) {
        console.error('Error fetching blog details:', err);
        setError(err.message || 'Article not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const dateStr = blog?.time
    ? new Date(blog.time * 1000).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const heroBanner = blog?.banner || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1600&q=80';

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Header Section with Background Picture */}
      <section className="relative bg-slate-950 text-white py-20 px-4 sm:px-8 border-b border-slate-800 overflow-hidden">
        {/* Background Banner Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 blur-[1px]"
          style={{ backgroundImage: `url('${heroBanner}')` }}
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40 z-0" />

        <div className="max-w-4xl mx-auto flex flex-col gap-4 relative z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-primary transition-colors cursor-pointer w-fit mb-2 bg-slate-900/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-700/50"
          >
            <ArrowLeft size={16} />
            <span>Back to Articles</span>
          </button>

          {blog?.category && (
            <span className="bg-primary text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider w-fit shadow-md">
              {blog.category}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white drop-shadow-md">
            {loading ? 'Loading Article...' : blog?.title || 'Article Header'}
          </h1>

          {blog?.subtitle && (
            <p className="text-slate-200 text-base sm:text-lg font-light leading-relaxed max-w-3xl">
              {blog.subtitle}
            </p>
          )}

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-slate-300 text-xs mt-4 pt-4 border-t border-slate-800/80 font-medium">
            <div className="flex items-center gap-2">
              <User size={15} className="text-primary" />
              <span>{blog?.author || 'Access Editorial Board'}</span>
            </div>
            {dateStr && (
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-primary" />
                <span>{dateStr}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-primary" />
              <span>3 min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Landmark size={36} className="animate-spin text-primary" />
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loading Article Details...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-2xl text-center flex flex-col items-center gap-4">
            <h3 className="text-lg font-bold">Article Not Found</h3>
            <p className="text-xs text-red-600 font-light">{error}</p>
            <Link href="/#blog" className="bg-primary text-white font-bold px-6 py-2.5 rounded-lg text-xs hover:bg-primary-hover transition-colors">
              Return to Home
            </Link>
          </div>
        ) : (
          <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm flex flex-col gap-8">
            {/* Text Content */}
            <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-light">
              {blog?.content}
            </div>

            {/* Footer / Share */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Tag size={14} className="text-primary" />
                <span>Category: <strong>{blog?.category || 'Blog'}</strong></span>
              </div>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: blog?.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg text-xs text-slate-600 font-semibold transition-colors cursor-pointer"
              >
                <Share2 size={14} />
                <span>Share Article</span>
              </button>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}

