import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/lib/auth/permissions";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  /**
   * Kept for backward compatibility with callsites that still attach
   * `Authorization: Bearer ${token}`. Going forward the canonical session is
   * the httpOnly `rv-session` cookie set by /api/auth/login.
   */
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true, isLoading: false }),
      logout: () => {
        // Fire-and-forget call to clear the httpOnly cookie.
        if (typeof window !== "undefined") {
          fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
        }
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "reina-verde-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
