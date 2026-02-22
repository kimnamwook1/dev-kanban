'use client';

import { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import type { Priority } from '@/lib/types';

const PRIORITIES: { value: Priority; label: string; colorClass: string; activeColorClass: string }[] = [
  { value: 'high', label: 'High', colorClass: 'bg-priority-high/20 text-priority-high', activeColorClass: 'bg-priority-high text-white' },
  { value: 'medium', label: 'Medium', colorClass: 'bg-priority-medium/20 text-priority-medium', activeColorClass: 'bg-priority-medium text-gray-900' },
  { value: 'low', label: 'Low', colorClass: 'bg-priority-low/20 text-priority-low', activeColorClass: 'bg-priority-low text-white' },
];

export function SearchFilter() {
  const { projects, searchQuery, filterTag, filterPriority, setFilter } = useProjectStore();

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const project of projects) {
      for (const tag of project.tags) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }, [projects]);

  const hasActiveFilters = searchQuery !== '' || filterTag !== null || filterPriority !== null;

  function clearAllFilters() {
    setFilter({ searchQuery: '', filterTag: null, filterPriority: null });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 px-6 pb-3">
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-text-secondary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setFilter({ searchQuery: e.target.value })}
          placeholder="Search projects..."
          className="h-8 w-56 rounded-md border border-border-color bg-card-bg pl-8 pr-3 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent-primary focus:outline-none"
        />
      </div>

      {/* Tag Filter Pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                setFilter({ filterTag: filterTag === tag ? null : tag })
              }
              className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                filterTag === tag
                  ? 'bg-accent-primary text-text-primary'
                  : 'bg-card-bg text-text-secondary hover:text-text-primary'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Priority Filter Buttons */}
      <div className="flex items-center gap-1.5">
        {PRIORITIES.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() =>
              setFilter({
                filterPriority: filterPriority === p.value ? null : p.value,
              })
            }
            className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
              filterPriority === p.value ? p.activeColorClass : p.colorClass
            }`}
          >
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                filterPriority === p.value ? 'bg-current' : ''
              }`}
              style={
                filterPriority !== p.value
                  ? { backgroundColor: `var(--priority-${p.value})` }
                  : undefined
              }
            />
            {p.label}
          </button>
        ))}
      </div>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="flex items-center gap-1 rounded-full bg-accent-urgent/20 px-2.5 py-0.5 text-xs text-accent-urgent transition-colors hover:bg-accent-urgent/30"
        >
          <X className="h-3 w-3" />
          Clear filters
        </button>
      )}
    </div>
  );
}
