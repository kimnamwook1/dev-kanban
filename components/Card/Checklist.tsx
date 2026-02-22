'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import type { ChecklistItem } from '@/lib/types';

interface ChecklistProps {
  projectId: string;
  items: ChecklistItem[];
}

export function Checklist({ projectId, items }: ChecklistProps) {
  const { toggleChecklistItem, addChecklistItem, removeChecklistItem } =
    useProjectStore();
  const [newItemText, setNewItemText] = useState('');

  function handleAdd() {
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    addChecklistItem(projectId, trimmed);
    setNewItemText('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="group flex items-center gap-2 rounded px-1 py-0.5 hover:bg-white/5"
        >
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => toggleChecklistItem(projectId, item.id)}
            className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-border-color accent-accent-primary"
          />
          <span
            className={`flex-1 text-sm ${
              item.checked
                ? 'text-text-secondary/50 line-through'
                : 'text-text-primary'
            }`}
          >
            {item.text}
          </span>
          <button
            type="button"
            onClick={() => removeChecklistItem(projectId, item.id)}
            className="shrink-0 rounded p-0.5 text-text-secondary opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
            aria-label={`Delete ${item.text}`}
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Add item input */}
      <div className="mt-1 flex items-center gap-1.5">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add item..."
          className="flex-1 rounded border border-border-color bg-card-bg px-2 py-1 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent-primary"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newItemText.trim()}
          className="flex items-center gap-0.5 rounded border border-border-color px-2 py-1 text-xs text-text-secondary transition-colors hover:text-text-primary disabled:opacity-40 disabled:hover:text-text-secondary"
        >
          <Plus size={12} />
          Add
        </button>
      </div>
    </div>
  );
}
