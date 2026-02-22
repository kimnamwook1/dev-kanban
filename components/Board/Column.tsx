'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { ColumnType, Project } from '@/lib/types';
import { ProjectCard } from '@/components/Card/ProjectCard';

interface ColumnProps {
  status: ColumnType;
  label: string;
  color: string;
  projects: Project[];
  onAddClick?: () => void;
  onCardClick?: (project: Project) => void;
}

const borderColorMap: Record<ColumnType, string> = {
  idea: 'border-l-column-idea',
  'in-progress': 'border-l-column-progress',
  done: 'border-l-column-done',
};

const badgeBgMap: Record<ColumnType, string> = {
  idea: 'bg-column-idea',
  'in-progress': 'bg-column-progress',
  done: 'bg-column-done',
};

export function Column({ status, label, color, projects, onAddClick, onCardClick }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  });

  const sortableIds = projects.map((p) => p.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 flex-col rounded-lg border-l-4 bg-column-bg ${borderColorMap[status]} ${
        isOver ? 'ring-2 ring-white/10' : ''
      }`}
      style={{ minHeight: 'calc(100vh - 8rem)' }}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h2 className="text-sm font-semibold text-text-primary">{label}</h2>
        <span
          className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium text-white ${badgeBgMap[status]}`}
        >
          {projects.length}
        </span>
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-border-color" />

      {/* Cards Area */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onCardClick?.(project)}
            />
          ))}
        </SortableContext>

        {projects.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-8 text-xs text-text-secondary">
            Drop projects here
          </div>
        )}
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={onAddClick}
        className="mx-3 mb-3 flex items-center justify-center gap-1 rounded-md border border-dashed border-border-color py-2 text-xs text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
      >
        <span className="text-base leading-none">+</span>
        <span>Add Project</span>
      </button>
    </div>
  );
}
