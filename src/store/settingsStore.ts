import { create } from 'zustand';
import { api } from '@/util/api';

interface SettingsState {
  settings: any;
  loading: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,
  fetchSettings: async () => {
    const current = get().settings;
    if (!current) {
      set({ loading: true });
    }
    try {
      const data = await api.get('/admin/settings');
      set({ settings: data || null, loading: false });
    } catch (e) {
      console.error('Error fetching settings:', e);
      set({ loading: false });
    }
  },
}));
