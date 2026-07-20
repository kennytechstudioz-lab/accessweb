import { create } from 'zustand';
import { api } from '@/util/api';

interface CurrenciesState {
  currencies: any[];
  loading: boolean;
  fetchCurrencies: () => Promise<void>;
}

export const useCurrenciesStore = create<CurrenciesState>((set, get) => ({
  currencies: [],
  loading: false,
  fetchCurrencies: async () => {
    const current = get().currencies;
    if (current.length === 0) {
      set({ loading: true });
    }
    try {
      const data = await api.get('/admin/currencies');
      set({ currencies: Array.isArray(data) ? data : [], loading: false });
    } catch (e) {
      console.error('Error fetching currencies:', e);
      set({ loading: false });
    }
  },
}));
