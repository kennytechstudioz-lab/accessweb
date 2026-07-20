import { create } from 'zustand';
import { api } from '@/util/api';

interface NotificationsState {
  notifications: any[];
  loading: boolean;
  fetchNotifications: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  loading: false,
  fetchNotifications: async () => {
    const current = get().notifications;
    if (current.length === 0) {
      set({ loading: true });
    }
    try {
      const data = await api.get('/admin/notifications');
      set({ notifications: Array.isArray(data) ? data : [], loading: false });
    } catch (e) {
      console.error('Error fetching notifications:', e);
      set({ loading: false });
    }
  },
}));
