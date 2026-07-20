import { create } from 'zustand';
import { api } from '@/util/api';

interface TransactionsState {
  transactions: any[];
  loading: boolean;
  fetchTransactions: () => Promise<void>;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  loading: false,
  fetchTransactions: async () => {
    const current = get().transactions;
    if (current.length === 0) {
      set({ loading: true });
    }
    try {
      const data = await api.get('/admin/transactions');
      set({ transactions: Array.isArray(data) ? data : [], loading: false });
    } catch (e) {
      console.error('Error fetching transactions:', e);
      set({ loading: false });
    }
  },
}));
