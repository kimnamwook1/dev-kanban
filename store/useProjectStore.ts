import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, ColumnType, Priority } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface ProjectStore {
  projects: Project[];

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  moveProject: (id: string, newStatus: ColumnType, newOrder: number) => void;
  reorderProject: (id: string, newOrder: number) => void;

  toggleChecklistItem: (projectId: string, itemId: string) => void;
  addChecklistItem: (projectId: string, text: string) => void;
  removeChecklistItem: (projectId: string, itemId: string) => void;

  filterTag: string | null;
  filterPriority: Priority | null;
  searchQuery: string;
  setFilter: (filter: Partial<Pick<ProjectStore, 'filterTag' | 'filterPriority' | 'searchQuery'>>) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],
      filterTag: null,
      filterPriority: null,
      searchQuery: '',

      addProject: (projectData) => set((state) => {
        const now = new Date().toISOString();
        const sameStatusProjects = state.projects.filter(p => p.status === projectData.status);
        const maxOrder = sameStatusProjects.length > 0
          ? Math.max(...sameStatusProjects.map(p => p.order)) + 1
          : 0;
        const newProject: Project = {
          ...projectData,
          id: generateId(),
          order: maxOrder,
          createdAt: now,
          updatedAt: now,
        };
        return { projects: [...state.projects, newProject] };
      }),

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        ),
      })),

      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
      })),

      moveProject: (id, newStatus, newOrder) => set((state) => ({
        projects: state.projects.map(p =>
          p.id === id ? { ...p, status: newStatus, order: newOrder, updatedAt: new Date().toISOString() } : p
        ),
      })),

      reorderProject: (id, newOrder) => set((state) => ({
        projects: state.projects.map(p =>
          p.id === id ? { ...p, order: newOrder, updatedAt: new Date().toISOString() } : p
        ),
      })),

      toggleChecklistItem: (projectId, itemId) => set((state) => ({
        projects: state.projects.map(p =>
          p.id === projectId
            ? {
                ...p,
                checklist: p.checklist.map(c =>
                  c.id === itemId ? { ...c, checked: !c.checked } : c
                ),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      })),

      addChecklistItem: (projectId, text) => set((state) => ({
        projects: state.projects.map(p =>
          p.id === projectId
            ? {
                ...p,
                checklist: [...p.checklist, { id: generateId(), text, checked: false }],
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      })),

      removeChecklistItem: (projectId, itemId) => set((state) => ({
        projects: state.projects.map(p =>
          p.id === projectId
            ? {
                ...p,
                checklist: p.checklist.filter(c => c.id !== itemId),
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      })),

      setFilter: (filter) => set((state) => ({ ...state, ...filter })),
    }),
    { name: 'kanban-projects' }
  )
);
