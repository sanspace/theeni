// src/store/authStore.ts
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface User {
  sub: string; // This will be the username
  role: 'admin' | 'cashier';
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Attempt to get the token from localStorage on initial load
  token: localStorage.getItem('access_token'),
  user: localStorage.getItem('access_token') 
    ? jwtDecode(localStorage.getItem('access_token')!) 
    : null,

  login: (token) => {
    // Decode the token to get user info (username and role)
    const user = jwtDecode<User>(token);
    // Store the token in localStorage for persistence across browser sessions
    localStorage.setItem('access_token', token);
    // Set the state
    set({ token, user });
  },

  logout: () => {
    // Remove the token from localStorage
    localStorage.removeItem('access_token');
    // Clear the state
    set({ token: null, user: null });
  },
}));
