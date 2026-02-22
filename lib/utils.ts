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
  const due = new Date(dueDate + 'T00:00:00');
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'D-Day';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}
