import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {} from '@redux-devtools/extension';

interface UIStore {
  isSidebarExpanded: boolean;
  expandedSections: string[];
  setIsSidebarExpanded: (expanded: boolean) => void;
  toggleSection: (sectionId: string) => void;
  toggleSidebar: () => void;
  reset: () => void;
}

const initialState = {
  isSidebarExpanded: true,
  expandedSections: ['conversations', 'files'], // Default expanded sections
};

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setIsSidebarExpanded: (expanded: boolean) => set({ isSidebarExpanded: expanded }),
      toggleSection: (sectionId: string) =>
        set(state => ({
          expandedSections: state.expandedSections.includes(sectionId)
            ? state.expandedSections.filter(id => id !== sectionId)
            : [...state.expandedSections, sectionId],
        })),
      toggleSidebar: () => set(state => ({ isSidebarExpanded: !state.isSidebarExpanded })),
      reset: () => set(initialState),
    }),
    {
      name: 'ui-storage',
    }
  )
);
