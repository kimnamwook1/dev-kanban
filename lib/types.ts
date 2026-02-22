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
