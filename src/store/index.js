import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // Auth state
      user: null,
      setUser: (user) => set({ user }),
      
      // Properties state
      properties: [],
      setProperties: (properties) => set({ properties }),
      addProperty: (property) => set((state) => ({ 
        properties: [...state.properties, property] 
      })),
      
      // Maintenance state
      maintenanceRequests: [],
      setMaintenanceRequests: (requests) => set({ maintenanceRequests: requests }),
      addMaintenanceRequest: (request) => set((state) => ({
        maintenanceRequests: [...state.maintenanceRequests, request]
      })),
      
      // UI state
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Theme state
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'domus-storage', // unique name for localStorage
      partialize: (state) => ({
        user: state.user,
        darkMode: state.darkMode,
      }), // only persist these fields
    }
  )
);

export default useStore; 