'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Lightbulb, Rocket, CheckCircle } from 'lucide-react';
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

const emptyStateConfig: Record<ColumnType, { icon: typeof Lightbulb; text: string }> = {
  idea: { icon: Lightbulb, text: 'No ideas yet' },
  'in-progress': { icon: Rocket, text: 'Nothing in progress' },
  done: { icon: CheckCircle, text: 'No completed projects' },
};

export function Column({ status, label, color, projects, onAddClick, onCardClick }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  });

  const sortableIds = projects.map((p) => p.id);
  const EmptyIcon = emptyStateConfig[status].icon;

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[300px] flex-1 flex-col rounded-lg border-l-4 bg-column-bg transition-shadow duration-200 ${borderColorMap[status]} ${
        isOver ? 'ring-2 ring-white/10 shadow-lg shadow-white/5' : ''
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

        {projects.length === 0 && !isOver && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12">
            <EmptyIcon className="h-8 w-8 text-text-secondary/30" strokeWidth={1.5} />
            <span className="text-xs text-text-secondary/50">
              {emptyStateConfig[status].text}
            </span>
          </div>
        )}

        {projects.length === 0 && isOver && (
          <div className="flex flex-1 items-center justify-center py-8 text-xs text-text-secondary">
            Drop here
          </div>
        )}
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={onAddClick}
        aria-label={`Add project to ${label}`}
        className="mx-3 mb-3 flex items-center justify-center gap-1 rounded-md border border-dashed border-border-color py-2 text-xs text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
      >
        <span className="text-base leading-none">+</span>
        <span>Add Project</span>
      </button>
    </div>
  );
}
