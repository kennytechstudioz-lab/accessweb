import { create } from 'zustand';
import { api } from '@/util/api';

interface NotificationItem {
  _id: string;
  title: string;
  content?: string;
  message?: string;
  username?: string;
  isRead?: boolean;
  status?: string;
  createdAt?: string;
  time?: number;
  [key: string]: any;
}

interface NotificationsState {
  notifications: NotificationItem[];
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCount: () => number;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  loading: false,
  fetchNotifications: async () => {
    try {
      const data = await api.get('/user/notifications');
      set({ notifications: Array.isArray(data) ? data : [], loading: false });
    } catch (e) {
      console.error('Error fetching notifications:', e);
      set({ loading: false });
    }
  },
  markAsRead: async (id: string) => {
    try {
      await api.put(`/user/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true, status: 'read' } : n
        ),
      }));
    } catch (e) {
      console.error('Error marking notification read:', e);
    }
  },
  markAllAsRead: async () => {
    try {
      await api.put('/user/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true, status: 'read' })),
      }));
    } catch (e) {
      console.error('Error marking all notifications read:', e);
    }
  },
  getUnreadCount: () => {
    const list = get().notifications;
    return list.filter((n) => !n.isRead && n.status !== 'read').length;
  },
}));
