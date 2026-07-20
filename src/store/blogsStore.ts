import { create } from 'zustand';
import { api } from '@/util/api';

interface BlogsState {
  blogs: any[];
  loading: boolean;
  fetchBlogs: () => Promise<void>;
}

export const useBlogsStore = create<BlogsState>((set, get) => ({
  blogs: [],
  loading: false,
  fetchBlogs: async () => {
    const current = get().blogs;
    if (current.length === 0) {
      set({ loading: true });
    }
    try {
      const data = await api.get('/admin/blogs');
      set({ blogs: Array.isArray(data) ? data : [], loading: false });
    } catch (e) {
      console.error('Error fetching blogs:', e);
      set({ loading: false });
    }
  },
}));
