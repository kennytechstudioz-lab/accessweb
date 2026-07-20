import { create } from 'zustand';
import { api } from '@/util/api';

interface TermsState {
  terms: any;
  loading: boolean;
  fetchTerms: () => Promise<void>;
}

export const useTermsStore = create<TermsState>((set, get) => ({
  terms: { title: '', content: '' },
  loading: false,
  fetchTerms: async () => {
    const current = get().terms;
    if (!current.title) {
      set({ loading: true });
    }
    try {
      const data = await api.get('/admin/terms');
      set({ terms: data || { title: '', content: '' }, loading: false });
    } catch (e) {
      console.error('Error fetching terms:', e);
      set({ loading: false });
    }
  },
}));
