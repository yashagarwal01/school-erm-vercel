import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  user: any;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () => set({ accessToken: null, user: null }),
}));
