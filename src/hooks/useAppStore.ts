import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Theme and UI state
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  
  // App settings
  notifications: boolean;
  autoSave: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSidebarOpen: (open: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  setAutoSave: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      theme: 'system',
      sidebarOpen: true,
      notifications: true,
      autoSave: true,
      
      // Actions
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setNotifications: (notifications) => set({ notifications }),
      setAutoSave: (autoSave) => set({ autoSave }),
    }),
    {
      name: 'growest-app-storage',
    }
  )
);