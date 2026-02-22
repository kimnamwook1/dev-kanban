import { create } from 'zustand';
import type { Project, ColumnType, Priority } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// DB row (snake_case) → Project (camelCase)
function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    status: row.status as ColumnType,
    priority: row.priority as Priority,
    tags: row.tags as string[],
    dueDate: (row.due_date as string) ?? null,
    progress: row.progress as number,
    checklist: row.checklist as Project['checklist'],
    memo: row.memo as string,
    order: row.order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// Project (camelCase) → DB row (snake_case), user_id 포함
function projectToRow(project: Project, userId: string) {
  return {
    id: project.id,
    user_id: userId,
    title: project.title,
    description: project.description,
    status: project.status,
    priority: project.priority,
    tags: project.tags,
    due_date: project.dueDate,
    progress: project.progress,
    checklist: project.checklist,
    memo: project.memo,
    order: project.order,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

interface ProjectStore {
  projects: Project[];
  loading: boolean;
  userId: string | null;

  setUserId: (userId: string | null) => void;
  fetchProjects: () => Promise<void>;

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

export const useProjectStore = create<ProjectStore>()((set, get) => ({
  projects: [],
  loading: false,
  userId: null,
  filterTag: null,
  filterPriority: null,
  searchQuery: '',

  setUserId: (userId) => set({ userId }),

  fetchProjects: async () => {
    const { userId } = get();
    if (!userId) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('order', { ascending: true });
    if (!error && data) {
      set({ projects: data.map(rowToProject), loading: false });
    } else {
      set({ loading: false });
    }
  },

  addProject: (projectData) => {
    const { userId } = get();
    if (!userId) return;
    const now = new Date().toISOString();
    const sameStatusProjects = get().projects.filter(p => p.status === projectData.status);
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
    // 낙관적 업데이트
    set((state) => ({ projects: [...state.projects, newProject] }));
    // DB 반영
    supabase.from('projects').insert(projectToRow(newProject, userId)).then();
  },

  updateProject: (id, updates) => {
    const { userId } = get();
    if (!userId) return;
    const now = new Date().toISOString();
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === id ? { ...p, ...updates, updatedAt: now } : p
      ),
    }));
    // snake_case 변환하여 DB 반영
    const dbUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'dueDate') dbUpdates.due_date = value;
      else if (key === 'createdAt') dbUpdates.created_at = value;
      else if (key === 'updatedAt') dbUpdates.updated_at = value;
      else dbUpdates[key] = value;
    }
    dbUpdates.updated_at = now;
    supabase.from('projects').update(dbUpdates).eq('id', id).then();
  },

  deleteProject: (id) => {
    set((state) => ({ projects: state.projects.filter(p => p.id !== id) }));
    supabase.from('projects').delete().eq('id', id).then();
  },

  moveProject: (id, newStatus, newOrder) => {
    const now = new Date().toISOString();
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === id ? { ...p, status: newStatus, order: newOrder, updatedAt: now } : p
      ),
    }));
    supabase.from('projects').update({ status: newStatus, order: newOrder, updated_at: now }).eq('id', id).then();
  },

  reorderProject: (id, newOrder) => {
    const now = new Date().toISOString();
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === id ? { ...p, order: newOrder, updatedAt: now } : p
      ),
    }));
    supabase.from('projects').update({ order: newOrder, updated_at: now }).eq('id', id).then();
  },

  toggleChecklistItem: (projectId, itemId) => {
    const now = new Date().toISOString();
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === projectId
          ? {
              ...p,
              checklist: p.checklist.map(c =>
                c.id === itemId ? { ...c, checked: !c.checked } : c
              ),
              updatedAt: now,
            }
          : p
      ),
    }));
    const project = get().projects.find(p => p.id === projectId);
    if (project) {
      supabase.from('projects').update({ checklist: project.checklist, updated_at: now }).eq('id', projectId).then();
    }
  },

  addChecklistItem: (projectId, text) => {
    const now = new Date().toISOString();
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === projectId
          ? {
              ...p,
              checklist: [...p.checklist, { id: generateId(), text, checked: false }],
              updatedAt: now,
            }
          : p
      ),
    }));
    const project = get().projects.find(p => p.id === projectId);
    if (project) {
      supabase.from('projects').update({ checklist: project.checklist, updated_at: now }).eq('id', projectId).then();
    }
  },

  removeChecklistItem: (projectId, itemId) => {
    const now = new Date().toISOString();
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === projectId
          ? {
              ...p,
              checklist: p.checklist.filter(c => c.id !== itemId),
              updatedAt: now,
            }
          : p
      ),
    }));
    const project = get().projects.find(p => p.id === projectId);
    if (project) {
      supabase.from('projects').update({ checklist: project.checklist, updated_at: now }).eq('id', projectId).then();
    }
  },

  setFilter: (filter) => set((state) => ({ ...state, ...filter })),
}));
