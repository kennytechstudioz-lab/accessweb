import { create } from 'zustand';
import { api } from '@/util/api';

interface UsersState {
  users: any[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  fetchUsers: async () => {
    const current = get().users;
    if (current.length === 0) {
      set({ loading: true });
    }
    try {
      const data = await api.get('/admin/users');
      set({ users: Array.isArray(data) ? data : [], loading: false });
    } catch (e) {
      console.error('Error fetching users:', e);
      set({ loading: false });
    }
  },
}));
