'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { formatDday, calculateProgress } from '@/lib/utils';
import { PriorityIndicator } from '@/components/UI/PriorityIndicator';
import { TagBadge } from '@/components/UI/TagBadge';
import { ProgressBar } from './ProgressBar';
import { Checklist } from './Checklist';
import type { Project } from '@/lib/types';

interface CardDetailProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (project: Project) => void;
}

const statusLabelMap: Record<string, string> = {
  idea: 'Idea',
  'in-progress': 'In Progress',
  done: 'Done',
};

const statusColorMap: Record<string, string> = {
  idea: 'bg-column-idea',
  'in-progress': 'bg-column-progress',
  done: 'bg-column-done',
};

const priorityLabelMap: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function CardDetail({
  project: projectProp,
  open,
  onOpenChange,
  onEdit,
}: CardDetailProps) {
  const { projects, updateProject, deleteProject } = useProjectStore();
  const [memoValue, setMemoValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Read fresh project data from store so checklist toggles reflect in real-time
  const project = projectProp
    ? projects.find((p) => p.id === projectProp.id) ?? projectProp
    : null;

  // Sync memo value when project changes or modal opens
  useEffect(() => {
    if (project && open) {
      setMemoValue(project.memo);
      setConfirmDelete(false);
    }
  }, [project?.id, open]);

  if (!project) return null;

  const dday = formatDday(project.dueDate);
  const progress =
    project.checklist.length > 0
      ? calculateProgress(project.checklist)
      : project.progress;

  const isOverdue = project.dueDate
    ? new Date(project.dueDate + 'T00:00:00') < new Date(new Date().toDateString())
    : false;

  function handleMemoBlur() {
    if (project && memoValue !== project.memo) {
      updateProject(project.id, { memo: memoValue });
    }
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (project) {
      deleteProject(project.id);
      onOpenChange(false);
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border-color bg-column-bg shadow-xl focus:outline-none max-h-[85vh]">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
            <div className="flex-1">
              <Dialog.Title className="flex items-center gap-2 text-xl font-bold text-text-primary">
                <PriorityIndicator priority={project.priority} />
                {project.title}
              </Dialog.Title>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${statusColorMap[project.status]}`}
                >
                  {statusLabelMap[project.status]}
                </span>
                <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-text-secondary">
                  {priorityLabelMap[project.priority]} priority
                </span>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="shrink-0 rounded-md p-1 text-text-secondary transition-colors hover:text-text-primary"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Info section */}
          <div className="border-b border-border-color px-6 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              )}

              {/* Due date */}
              {project.dueDate && (
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                  <Calendar size={12} />
                  <span>{project.dueDate}</span>
                  {dday && (
                    <span
                      className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        isOverdue
                          ? 'bg-priority-high/20 text-priority-high'
                          : 'bg-white/8 text-text-secondary'
                      }`}
                    >
                      {dday}
                    </span>
                  )}
                </div>
              )}

              {/* Created / Updated */}
              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <Clock size={12} />
                <span>Created {formatDate(project.createdAt)}</span>
              </div>
              {project.updatedAt !== project.createdAt && (
                <span className="text-xs text-text-secondary">
                  Updated {formatDate(project.updatedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Progress section */}
          {(progress > 0 || project.checklist.length > 0) && (
            <div className="border-b border-border-color px-6 py-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Progress
              </h3>
              <ProgressBar percent={progress} />
            </div>
          )}

          {/* Description section */}
          {project.description && (
            <div className="border-b border-border-color px-6 py-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Description
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                {project.description}
              </p>
            </div>
          )}

          {/* Checklist section */}
          <div className="border-b border-border-color px-6 py-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Checklist
              {project.checklist.length > 0 && (
                <span className="ml-1.5 text-text-secondary/60">
                  ({project.checklist.filter((c) => c.checked).length}/
                  {project.checklist.length})
                </span>
              )}
            </h3>
            <Checklist projectId={project.id} items={project.checklist} />
          </div>

          {/* Memo section */}
          <div className="border-b border-border-color px-6 py-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Memo
            </h3>
            <textarea
              rows={3}
              value={memoValue}
              onChange={(e) => setMemoValue(e.target.value)}
              onBlur={handleMemoBlur}
              placeholder="Add a note..."
              className="w-full rounded-md border border-border-color bg-card-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-400">Are you sure?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-md border border-border-color px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1 rounded-md border border-border-color px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-red-400/50 hover:text-red-400"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => onEdit(project)}
              className="flex items-center gap-1 rounded-md bg-accent-primary px-4 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-accent-primary/80"
            >
              <Edit size={14} />
              Edit
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
