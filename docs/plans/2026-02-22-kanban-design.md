# Dev Kanban Board - Design Document

**Date**: 2026-02-22
**Status**: Approved

## Overview

A personal kanban board for tracking 15+ projects at a glance. Single-user, browser-based, dark-themed.

## Requirements

- **Purpose**: Personal project management (no auth, no multi-user)
- **Scale**: 15+ projects simultaneously
- **Columns**: Idea -> In Progress -> Done (3 columns)
- **Card fields**: Title, description, priority, tags, due date, progress, checklist, memo
- **Interaction**: Drag & drop between columns, modal-based card editing
- **Design**: Dark mode, desktop-first with mobile horizontal scroll
- **Storage**: Browser localStorage (via Zustand persist)

## Tech Stack

| Package | Purpose |
|---------|---------|
| Next.js 15 | Framework (file-based routing, future API routes) |
| React 19 | UI library |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Styling |
| @dnd-kit/core + sortable | Drag & drop |
| Zustand | State management + localStorage persist |
| Radix UI (dialog, popover) | Accessible headless UI primitives |
| nanoid | Unique ID generation |
| lucide-react | Icons |

## Data Model

```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  status: 'idea' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  dueDate: string | null;
  progress: number;             // 0-100
  checklist: ChecklistItem[];
  memo: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}
```

## Component Structure

```
app/
  page.tsx                      # Main kanban board page
  layout.tsx                    # Dark theme layout
  globals.css                   # Tailwind + custom styles

components/
  Board/
    KanbanBoard.tsx             # Full board (3 columns + DndContext)
    Column.tsx                  # Single column (drop zone + card list)
  Card/
    ProjectCard.tsx             # Card summary view (draggable)
    CardDetail.tsx              # Card detail modal (edit)
    Checklist.tsx               # Checklist component
    ProgressBar.tsx             # Progress bar
  Form/
    ProjectForm.tsx             # Project create/edit form
  UI/
    TagBadge.tsx                # Tag badge
    PriorityIndicator.tsx       # Priority color dot
    SearchFilter.tsx            # Search + tag filter

store/
  useProjectStore.ts            # Zustand store (persist middleware)

lib/
  utils.ts                      # Utility functions (date, ID gen)
```

## State Management

```typescript
interface ProjectStore {
  projects: Project[];

  // CRUD
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Column movement (drag & drop)
  moveProject: (id: string, newStatus: Project['status'], newOrder: number) => void;
  reorderProject: (id: string, newOrder: number) => void;

  // Checklist
  toggleChecklistItem: (projectId: string, itemId: string) => void;
  addChecklistItem: (projectId: string, text: string) => void;
  removeChecklistItem: (projectId: string, itemId: string) => void;

  // Filtering
  filterTag: string | null;
  filterPriority: Project['priority'] | null;
  searchQuery: string;
  setFilter: (filter: Partial<Pick<ProjectStore, 'filterTag' | 'filterPriority' | 'searchQuery'>>) => void;
}
```

localStorage sync via Zustand `persist` middleware with key `kanban-projects`.

## Interactions

| Action | Behavior |
|--------|----------|
| Drag card | Move between columns -> moveProject() -> update status + order |
| Click card | Open detail modal -> edit title, description, checklist, memo |
| + New Project | Form modal -> title + description required, rest optional |
| Toggle checklist | Instant update + optional auto-calculate progress |
| Search/Filter | Real-time filtering by tag, priority, text search |
| Delete card | Delete button in detail modal -> confirmation dialog |

## Color Palette (Dark Mode)

```
Background:  #0F0F0F (board) / #1A1A2E (column) / #16213E (card)
Text:        #E0E0E0 (primary) / #A0A0A0 (secondary)
Accent:      #0F3460 (primary) / #E94560 (urgent)
Priority:    #E94560 (high) / #F0C040 (medium) / #4DA8DA (low)
Column:      #9B59B6 (idea) / #3498DB (in-progress) / #2ECC71 (done)
```

## Constraints

- Most components are `'use client'` (drag & drop, state management)
- Desktop-first, mobile: horizontal scroll for columns
- localStorage limit ~5MB (sufficient for 15+ projects)
- No server-side data persistence in v1

## Decisions & Trade-offs

- **Headless UI over component library**: Maximum design flexibility for rich card content
- **@dnd-kit over react-beautiful-dnd**: rbd is unmaintained; dnd-kit is the modern standard
- **Zustand over Redux/Context**: Minimal boilerplate, built-in persist middleware
- **localStorage over DB**: Zero setup, instant start. Migration path to Supabase later if needed
- **3 columns over 5**: Simplicity wins. Less friction = more consistent usage
