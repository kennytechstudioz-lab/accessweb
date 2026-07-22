import { create } from 'zustand';
import { api } from '@/util/api';

interface TemplatesState {
  emailTemplates: any[];
  emailPage: number;
  emailTotalPages: number;
  emailTotalCount: number;
  
  notificationTemplates: any[];
  notificationPage: number;
  notificationTotalPages: number;
  notificationTotalCount: number;

  loadingEmails: boolean;
  loadingNotifications: boolean;

  fetchEmailTemplates: (page?: number) => Promise<void>;
  fetchNotificationTemplates: (page?: number) => Promise<void>;
}

export const useTemplatesStore = create<TemplatesState>((set, get) => ({
  emailTemplates: [],
  emailPage: 1,
  emailTotalPages: 1,
  emailTotalCount: 0,

  notificationTemplates: [],
  notificationPage: 1,
  notificationTotalPages: 1,
  notificationTotalCount: 0,

  loadingEmails: false,
  loadingNotifications: false,

  fetchEmailTemplates: async (page = 1) => {
    const current = get().emailTemplates;
    if (current.length === 0 || get().emailPage !== page) {
      set({ loadingEmails: true });
    }
    try {
      const data: any = await api.get(`/admin/emails?page=${page}&limit=20`);
      set({
        emailTemplates: Array.isArray(data.templates) ? data.templates : [],
        emailPage: data.page || page,
        emailTotalPages: data.totalPages || 1,
        emailTotalCount: data.totalCount || 0,
        loadingEmails: false,
      });
    } catch (e) {
      console.error('Error fetching email templates:', e);
      set({ loadingEmails: false });
    }
  },

  fetchNotificationTemplates: async (page = 1) => {
    const current = get().notificationTemplates;
    if (current.length === 0 || get().notificationPage !== page) {
      set({ loadingNotifications: true });
    }
    try {
      const data: any = await api.get(`/admin/notification-templates?page=${page}&limit=20`);
      set({
        notificationTemplates: Array.isArray(data.templates) ? data.templates : [],
        notificationPage: data.page || page,
        notificationTotalPages: data.totalPages || 1,
        notificationTotalCount: data.totalCount || 0,
        loadingNotifications: false,
      });
    } catch (e) {
      console.error('Error fetching notification templates:', e);
      set({ loadingNotifications: false });
    }
  },
}));
