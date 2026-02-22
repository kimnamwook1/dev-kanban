# Dev Kanban Board Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a personal kanban board for tracking 15+ projects with drag & drop, dark theme, and localStorage persistence.

**Architecture:** Next.js 15 app with client-side rendering. Zustand store with persist middleware handles all state + localStorage sync. @dnd-kit provides drag & drop. Radix UI for accessible modals/popovers. Tailwind CSS 4 for dark-themed styling.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, @dnd-kit, Zustand, Radix UI, nanoid, lucide-react

**Design Doc:** `docs/plans/2026-02-22-kanban-design.md`

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, etc. (via CLI)
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

**Step 1: Initialize Next.js project**

Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack`

Accept defaults. This scaffolds the project in the current directory.

**Step 2: Install dependencies**

Run:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities zustand nanoid @radix-ui/react-dialog @radix-ui/react-popover lucide-react
```

**Step 3: Verify dev server starts**

Run: `npm run dev`
Expected: Dev server starts on http://localhost:3000 without errors.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with dependencies"
```

---

## Task 2: Dark Theme Global Styles

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Step 1: Replace globals.css with dark theme base**

Replace `app/globals.css` with Tailwind imports and custom CSS variables for the dark color palette:

```css
@import "tailwindcss";

:root {
  --board-bg: #0F0F0F;
  --column-bg: #1A1A2E;
  --card-bg: #16213E;
  --text-primary: #E0E0E0;
  --text-secondary: #A0A0A0;
  --accent-primary: #0F3460;
  --accent-urgent: #E94560;
  --priority-high: #E94560;
  --priority-medium: #F0C040;
  --priority-low: #4DA8DA;
  --column-idea: #9B59B6;
  --column-progress: #3498DB;
  --column-done: #2ECC71;
}

body {
  background-color: var(--board-bg);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, sans-serif;
}
```

**Step 2: Update layout.tsx**

Set `<html lang="ko" className="dark">` and clean up the default layout. Set metadata title to "Dev Kanban".

**Step 3: Update page.tsx to a placeholder**

Replace default content with a simple `<main>` containing "Dev Kanban" heading to verify styles.

**Step 4: Verify dark theme renders**

Run: `npm run dev`
Expected: Dark background with light text heading visible.

**Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx app/page.tsx
git commit -m "feat: add dark theme global styles and layout"
```

---

## Task 3: Data Types + Utility Functions

**Files:**
- Create: `lib/types.ts`
- Create: `lib/utils.ts`
- Create: `lib/__tests__/utils.test.ts`

**Step 1: Create type definitions**

Create `lib/types.ts` with `Project`, `ChecklistItem`, `ColumnType`, and `ProjectStore` interfaces exactly as specified in the design doc.

```typescript
export type ColumnType = 'idea' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ColumnType;
  priority: Priority;
  tags: string[];
  dueDate: string | null;
  progress: number;
  checklist: ChecklistItem[];
  memo: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const COLUMNS: { key: ColumnType; label: string; color: string }[] = [
  { key: 'idea', label: '아이디어', color: 'var(--column-idea)' },
  { key: 'in-progress', label: '진행중', color: 'var(--column-progress)' },
  { key: 'done', label: '완료', color: 'var(--column-done)' },
];
```

**Step 2: Create utility functions**

Create `lib/utils.ts` with:
- `calculateProgress(checklist: ChecklistItem[]): number` — returns 0-100 based on checked items
- `formatDday(dueDate: string | null): string | null` — returns "D-3", "D+1", "D-Day", or null
- `generateId(): string` — wraps nanoid

**Step 3: Write tests for utility functions**

Install test deps: `npm install -D vitest @testing-library/react @testing-library/jest-dom`

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

Create `lib/__tests__/utils.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { calculateProgress, formatDday, generateId } from '../utils';

describe('calculateProgress', () => {
  it('returns 0 for empty checklist', () => {
    expect(calculateProgress([])).toBe(0);
  });
  it('returns 50 for half checked', () => {
    const items = [
      { id: '1', text: 'a', checked: true },
      { id: '2', text: 'b', checked: false },
    ];
    expect(calculateProgress(items)).toBe(50);
  });
  it('returns 100 for all checked', () => {
    const items = [
      { id: '1', text: 'a', checked: true },
      { id: '2', text: 'b', checked: true },
    ];
    expect(calculateProgress(items)).toBe(100);
  });
});

describe('formatDday', () => {
  it('returns null for null input', () => {
    expect(formatDday(null)).toBeNull();
  });
  it('returns D-Day for today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(formatDday(today)).toBe('D-Day');
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(generateId().length).toBeGreaterThan(0);
  });
});
```

**Step 4: Run tests to verify they fail**

Run: `npx vitest run`
Expected: FAIL (utils functions not implemented yet)

**Step 5: Implement utility functions**

```typescript
import { nanoid } from 'nanoid';
import type { ChecklistItem } from './types';

export function generateId(): string {
  return nanoid();
}

export function calculateProgress(checklist: ChecklistItem[]): number {
  if (checklist.length === 0) return 0;
  const checked = checklist.filter((item) => item.checked).length;
  return Math.round((checked / checklist.length) * 100);
}

export function formatDday(dueDate: string | null): string | null {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'D-Day';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}
```

**Step 6: Run tests to verify they pass**

Run: `npx vitest run`
Expected: All PASS

**Step 7: Commit**

```bash
git add lib/ vitest.config.ts package.json package-lock.json
git commit -m "feat: add data types and utility functions with tests"
```

---

## Task 4: Zustand Store

**Files:**
- Create: `store/useProjectStore.ts`
- Create: `store/__tests__/useProjectStore.test.ts`

**Step 1: Write store tests**

Test key behaviors: addProject, updateProject, deleteProject, moveProject, toggleChecklistItem, setFilter.

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../useProjectStore';

beforeEach(() => {
  useProjectStore.setState({ projects: [], filterTag: null, filterPriority: null, searchQuery: '' });
});

describe('useProjectStore', () => {
  it('adds a project with generated id and timestamps', () => {
    useProjectStore.getState().addProject({
      title: 'Test',
      description: 'desc',
      status: 'idea',
      priority: 'medium',
      tags: [],
      dueDate: null,
      progress: 0,
      checklist: [],
      memo: '',
    });
    const projects = useProjectStore.getState().projects;
    expect(projects).toHaveLength(1);
    expect(projects[0].title).toBe('Test');
    expect(projects[0].id).toBeTruthy();
  });

  it('deletes a project', () => {
    useProjectStore.getState().addProject({
      title: 'ToDelete', description: '', status: 'idea',
      priority: 'low', tags: [], dueDate: null, progress: 0, checklist: [], memo: '',
    });
    const id = useProjectStore.getState().projects[0].id;
    useProjectStore.getState().deleteProject(id);
    expect(useProjectStore.getState().projects).toHaveLength(0);
  });

  it('moves a project to a new status', () => {
    useProjectStore.getState().addProject({
      title: 'Move', description: '', status: 'idea',
      priority: 'low', tags: [], dueDate: null, progress: 0, checklist: [], memo: '',
    });
    const id = useProjectStore.getState().projects[0].id;
    useProjectStore.getState().moveProject(id, 'in-progress', 0);
    expect(useProjectStore.getState().projects[0].status).toBe('in-progress');
  });

  it('toggles checklist item', () => {
    useProjectStore.getState().addProject({
      title: 'Check', description: '', status: 'idea',
      priority: 'low', tags: [], dueDate: null, progress: 0,
      checklist: [{ id: 'c1', text: 'item', checked: false }], memo: '',
    });
    const id = useProjectStore.getState().projects[0].id;
    useProjectStore.getState().toggleChecklistItem(id, 'c1');
    expect(useProjectStore.getState().projects[0].checklist[0].checked).toBe(true);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run`
Expected: FAIL (store not implemented)

**Step 3: Implement store**

Create `store/useProjectStore.ts` implementing all CRUD, move, reorder, checklist, and filter actions with `persist` middleware.

**Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: All PASS

**Step 5: Commit**

```bash
git add store/
git commit -m "feat: implement Zustand project store with persist middleware"
```

---

## Task 5: KanbanBoard + Column Components

**Files:**
- Create: `components/Board/KanbanBoard.tsx`
- Create: `components/Board/Column.tsx`
- Modify: `app/page.tsx`

**Step 1: Build Column component**

A droppable container using `@dnd-kit/core` `useDroppable`. Renders column header (label + count + color accent) and children (card list). Includes "+ Add Project" button at bottom.

**Step 2: Build KanbanBoard component**

Wraps all 3 columns in `DndContext` + `SortableContext`. Handles `onDragEnd` to call `moveProject` or `reorderProject`. Includes `SearchFilter` bar at top.

**Step 3: Wire into page.tsx**

Replace placeholder with `<KanbanBoard />` wrapped in `'use client'`.

**Step 4: Verify board renders with 3 empty columns**

Run: `npm run dev`
Expected: Three dark-themed columns visible with headers (아이디어, 진행중, 완료).

**Step 5: Commit**

```bash
git add components/Board/ app/page.tsx
git commit -m "feat: add KanbanBoard and Column components with dnd-kit"
```

---

## Task 6: ProjectCard Component (Draggable)

**Files:**
- Create: `components/Card/ProjectCard.tsx`
- Create: `components/Card/ProgressBar.tsx`
- Create: `components/UI/TagBadge.tsx`
- Create: `components/UI/PriorityIndicator.tsx`

**Step 1: Build PriorityIndicator**

Small colored dot (high=red, medium=yellow, low=blue).

**Step 2: Build TagBadge**

Small pill-shaped badge with tag text.

**Step 3: Build ProgressBar**

Thin horizontal bar showing 0-100% with color transition.

**Step 4: Build ProjectCard**

Uses `@dnd-kit/sortable` `useSortable`. Displays: title, priority dot, tags, progress bar, D-day badge if due date set. onClick opens detail modal (wired in Task 8).

**Step 5: Add sample data to store and verify cards render**

Temporarily add 2-3 sample projects in page.tsx via `useEffect` + `addProject`. Verify cards appear in columns and are draggable.

**Step 6: Verify drag & drop works between columns**

Drag a card from 아이디어 to 진행중. Verify status updates.

**Step 7: Remove sample data, commit**

```bash
git add components/Card/ components/UI/
git commit -m "feat: add draggable ProjectCard with priority, tags, progress"
```

---

## Task 7: ProjectForm (Create/Edit)

**Files:**
- Create: `components/Form/ProjectForm.tsx`

**Step 1: Build ProjectForm**

Modal form using Radix Dialog. Fields:
- Title (required, text input)
- Description (textarea)
- Status (select: idea/in-progress/done)
- Priority (select: low/medium/high)
- Tags (comma-separated text input, parsed to array)
- Due Date (date input)
- Memo (textarea)

Submit calls `addProject` or `updateProject` depending on mode (create vs edit).

**Step 2: Wire "+ New Project" button in Column to open form**

**Step 3: Add a header bar with "+ New Project" button**

Create a top-level header with the app title and a primary "New Project" button.

**Step 4: Verify creating a new project**

Create a project via form. Verify it appears in the correct column.

**Step 5: Commit**

```bash
git add components/Form/ components/Board/
git commit -m "feat: add project create/edit form with Radix Dialog"
```

---

## Task 8: CardDetail Modal (View/Edit)

**Files:**
- Create: `components/Card/CardDetail.tsx`
- Create: `components/Card/Checklist.tsx`

**Step 1: Build Checklist component**

Renders list of ChecklistItem with checkboxes. "Add item" input at bottom. Toggle calls `toggleChecklistItem`. Add calls `addChecklistItem`. Delete (X button) calls `removeChecklistItem`.

**Step 2: Build CardDetail modal**

Full detail view using Radix Dialog. Shows all project fields. Inline editable: click title/description to edit. Contains:
- Checklist component
- Memo textarea
- Progress bar (auto-calculated from checklist or manual override)
- Delete button with confirmation

**Step 3: Wire ProjectCard onClick to open CardDetail**

**Step 4: Verify full edit flow**

Click card -> modal opens -> edit title -> toggle checklist -> verify progress updates -> close modal -> verify changes persisted.

**Step 5: Commit**

```bash
git add components/Card/
git commit -m "feat: add card detail modal with checklist and inline editing"
```

---

## Task 9: Search & Filter

**Files:**
- Create: `components/UI/SearchFilter.tsx`
- Modify: `components/Board/KanbanBoard.tsx`

**Step 1: Build SearchFilter component**

Horizontal bar with:
- Text search input (filters by title/description)
- Tag filter dropdown (populated from all unique tags across projects)
- Priority filter buttons (all / high / medium / low)

All filters update `useProjectStore` filter state.

**Step 2: Apply filters in KanbanBoard**

Filter `projects` array before passing to columns. Use store's `filterTag`, `filterPriority`, `searchQuery`.

**Step 3: Verify filtering**

Add several projects with different tags/priorities. Search by text, filter by tag, filter by priority. Verify correct cards shown.

**Step 4: Commit**

```bash
git add components/UI/SearchFilter.tsx components/Board/KanbanBoard.tsx
git commit -m "feat: add search and filter functionality"
```

---

## Task 10: Polish & Final Verification

**Files:**
- Modify: various components for styling refinements

**Step 1: Responsive check**

Verify desktop layout (3 columns side by side). Verify narrow viewport (columns scroll horizontally).

**Step 2: Empty state**

Add empty state message per column ("No projects yet" with subtle icon).

**Step 3: Animations**

Add subtle transitions: card hover effect, drag overlay opacity, modal enter/exit.

**Step 4: localStorage persistence check**

Add projects, refresh browser, verify data persists. Clear localStorage, verify clean start.

**Step 5: Run all tests**

Run: `npx vitest run`
Expected: All PASS

**Step 6: Build check**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 7: Final commit**

```bash
git add .
git commit -m "feat: polish UI with animations, empty states, and responsive layout"
```

---

## Summary

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | Project scaffolding | None |
| 2 | Dark theme styles | Task 1 |
| 3 | Types + utils (TDD) | Task 1 |
| 4 | Zustand store (TDD) | Task 3 |
| 5 | Board + Column | Task 2, 4 |
| 6 | ProjectCard (drag) | Task 5 |
| 7 | ProjectForm (create) | Task 5 |
| 8 | CardDetail (edit) | Task 6 |
| 9 | Search & filter | Task 5 |
| 10 | Polish & verify | Task 6-9 |
