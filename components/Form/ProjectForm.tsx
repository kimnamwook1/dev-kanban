'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import type { ColumnType, Priority, Project } from '@/lib/types';

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus?: ColumnType;
  editProject?: Project;
}

export function ProjectForm({
  open,
  onOpenChange,
  defaultStatus = 'idea',
  editProject,
}: ProjectFormProps) {
  const { addProject, updateProject } = useProjectStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ColumnType>(defaultStatus);
  const [priority, setPriority] = useState<Priority>('medium');
  const [tagsInput, setTagsInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [memo, setMemo] = useState('');
  const [titleError, setTitleError] = useState(false);

  const isEditMode = !!editProject;

  useEffect(() => {
    if (open) {
      if (editProject) {
        setTitle(editProject.title);
        setDescription(editProject.description);
        setStatus(editProject.status);
        setPriority(editProject.priority);
        setTagsInput(editProject.tags.join(', '));
        setDueDate(editProject.dueDate ?? '');
        setMemo(editProject.memo);
      } else {
        setTitle('');
        setDescription('');
        setStatus(defaultStatus);
        setPriority('medium');
        setTagsInput('');
        setDueDate('');
        setMemo('');
      }
      setTitleError(false);
    }
  }, [open, editProject, defaultStatus]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (isEditMode && editProject) {
      updateProject(editProject.id, {
        title: title.trim(),
        description,
        status,
        priority,
        tags,
        dueDate: dueDate || null,
        memo,
      });
    } else {
      addProject({
        title: title.trim(),
        description,
        status,
        priority,
        tags,
        dueDate: dueDate || null,
        memo,
        progress: 0,
        checklist: [],
      });
    }

    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border-color bg-column-bg p-6 shadow-xl focus:outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-text-primary">
              {isEditMode ? 'Edit Project' : 'New Project'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md p-1 text-text-secondary transition-colors hover:text-text-primary"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1">
              <label htmlFor="title" className="text-sm text-text-secondary">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError(false);
                }}
                placeholder="Project title"
                className={`rounded-md border bg-card-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent-primary ${
                  titleError ? 'border-red-400' : 'border-border-color'
                }`}
              />
              {titleError && (
                <span className="text-xs text-red-400">Title is required</span>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="description"
                className="text-sm text-text-secondary"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
                className="rounded-md border border-border-color bg-card-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>

            {/* Status & Priority row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="status"
                  className="text-sm text-text-secondary"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ColumnType)}
                  className="rounded-md border border-border-color bg-card-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                >
                  <option value="idea">Idea</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="priority"
                  className="text-sm text-text-secondary"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="rounded-md border border-border-color bg-card-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-1">
              <label htmlFor="tags" className="text-sm text-text-secondary">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="web, ai, mobile (comma-separated)"
                className="rounded-md border border-border-color bg-card-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-1">
              <label htmlFor="dueDate" className="text-sm text-text-secondary">
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-md border border-border-color bg-card-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>

            {/* Memo */}
            <div className="flex flex-col gap-1">
              <label htmlFor="memo" className="text-sm text-text-secondary">
                Memo
              </label>
              <textarea
                id="memo"
                rows={3}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Additional notes"
                className="rounded-md border border-border-color bg-card-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>

            {/* Actions */}
            <div className="mt-2 flex justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md border border-border-color px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-accent-primary/80"
              >
                {isEditMode ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
