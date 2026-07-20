import { create } from 'zustand';
import { api } from '@/util/api';

interface CardsState {
  cards: any[];
  loading: boolean;
  fetchCards: () => Promise<void>;
}

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: [],
  loading: false,
  fetchCards: async () => {
    const current = get().cards;
    if (current.length === 0) {
      set({ loading: true });
    }
    try {
      const data = await api.get('/admin/cards');
      set({ cards: Array.isArray(data) ? data : [], loading: false });
    } catch (e) {
      console.error('Error fetching cards:', e);
      set({ loading: false });
    }
  },
}));
