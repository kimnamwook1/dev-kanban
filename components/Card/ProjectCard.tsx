'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Project } from '@/lib/types';
import { formatDday, calculateProgress } from '@/lib/utils';
import { PriorityIndicator } from '@/components/UI/PriorityIndicator';
import { TagBadge } from '@/components/UI/TagBadge';
import { ProgressBar } from './ProgressBar';

interface ProjectCardProps {
  project: Project;
  isDragOverlay?: boolean;
  onClick?: () => void;
}

export function ProjectCard({ project, isDragOverlay, onClick }: ProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
    disabled: isDragOverlay,
  });

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  const dday = formatDday(project.dueDate);
  const progress =
    project.checklist.length > 0
      ? calculateProgress(project.checklist)
      : project.progress;
  const showProgress = progress > 0 || project.checklist.length > 0;
  const visibleTags = project.tags.slice(0, 3);
  const extraTagCount = project.tags.length - 3;

  const isOverdue = project.dueDate
    ? new Date(project.dueDate + 'T00:00:00') < new Date(new Date().toDateString())
    : false;

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={style}
      {...(isDragOverlay ? {} : attributes)}
      {...(isDragOverlay ? {} : listeners)}
      onClick={onClick}
      className={`cursor-grab rounded-md border border-border-color bg-card-bg px-3 py-2.5 transition-colors hover:bg-card-bg-hover ${
        isDragging ? 'opacity-50' : ''
      } ${isDragOverlay ? 'shadow-lg ring-1 ring-white/10' : ''}`}
    >
      {/* Title row with priority */}
      <div className="flex items-center gap-1.5">
        <PriorityIndicator priority={project.priority} />
        <span className="truncate text-sm font-medium text-text-primary">
          {project.title}
        </span>
        {dday && (
          <span
            className={`ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
              isOverdue
                ? 'bg-priority-high/20 text-priority-high'
                : 'bg-white/8 text-text-secondary'
            }`}
          >
            {dday}
          </span>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
          {project.description}
        </p>
      )}

      {/* Tags */}
      {visibleTags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {visibleTags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
          {extraTagCount > 0 && (
            <span className="text-[10px] text-text-secondary">
              +{extraTagCount}
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      {showProgress && (
        <div className="mt-1.5">
          <ProgressBar percent={progress} />
        </div>
      )}
    </div>
  );
}
