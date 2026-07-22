import React from 'react';
import { Metadata } from 'next';
import BlogDetailsClient from './BlogDetailsClient';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5009/api';
    const res = await fetch(`${apiUrl}/admin/blogs/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch blog');
    const blog = await res.json();

    return {
      title: `${blog.title} | Access National Bank Insights`,
      description: blog.subtitle || blog.content?.substring(0, 160) || 'Read banking insights from Access National Bank.',
      openGraph: {
        title: blog.title,
        description: blog.subtitle || blog.content?.substring(0, 160),
        images: blog.banner ? [{ url: blog.banner }] : [],
        type: 'article',
      },
    };
  } catch (e) {
    return {
      title: 'Banking Insights & Articles | Access National Bank',
      description: 'Read the latest financial tips and corporate announcements from Access National Bank.',
    };
  }
}

export default function BlogPage() {
  return <BlogDetailsClient />;
}
