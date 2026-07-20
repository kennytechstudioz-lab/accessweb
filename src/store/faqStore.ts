import { create } from 'zustand';
import { api } from '@/util/api';

interface FaqState {
  faqs: any[];
  loading: boolean;
  fetchFaqs: () => Promise<void>;
}

export const useFaqStore = create<FaqState>((set, get) => ({
  faqs: [],
  loading: false,
  fetchFaqs: async () => {
    const current = get().faqs;
    if (current.length === 0) {
      set({ loading: true });
    }
    try {
      const data = await api.get('/admin/faq');
      set({ faqs: Array.isArray(data) ? data : [], loading: false });
    } catch (e) {
      console.error('Error fetching FAQs:', e);
      set({ loading: false });
    }
  },
}));
