'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Column } from './Column';
import { ProjectCard } from '@/components/Card/ProjectCard';
import { ProjectForm } from '@/components/Form/ProjectForm';
import { CardDetail } from '@/components/Card/CardDetail';
import { SearchFilter } from '@/components/UI/SearchFilter';
import { useProjectStore } from '@/store/useProjectStore';
import { COLUMNS, type ColumnType, type Project } from '@/lib/types';

export function KanbanBoard() {
  const { projects, moveProject, reorderProject, searchQuery, filterTag, filterPriority } = useProjectStore();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formDefaultStatus, setFormDefaultStatus] = useState<ColumnType>('idea');
  const [editProject, setEditProject] = useState<Project | undefined>(undefined);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredProjects = useMemo(() => {
    let result = projects;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    if (filterTag) {
      result = result.filter((p) => p.tags.includes(filterTag));
    }

    if (filterPriority) {
      result = result.filter((p) => p.priority === filterPriority);
    }

    return result;
  }, [projects, searchQuery, filterTag, filterPriority]);

  function getProjectsByStatus(status: ColumnType): Project[] {
    return filteredProjects
      .filter((p) => p.status === status)
      .sort((a, b) => a.order - b.order);
  }

  function handleDragStart(event: DragStartEvent) {
    const project = projects.find((p) => p.id === event.active.id);
    setActiveProject(project ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveProject(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const draggedProject = projects.find((p) => p.id === activeId);
    if (!draggedProject) return;

    // Determine target column: if dropped on a column droppable, use that;
    // otherwise, find the column of the item we dropped over
    let targetStatus: ColumnType;
    const columnKeys = COLUMNS.map((c) => c.key);

    if (columnKeys.includes(overId as ColumnType)) {
      // Dropped directly on a column
      targetStatus = overId as ColumnType;
    } else {
      // Dropped on another project card
      const overProject = projects.find((p) => p.id === overId);
      if (!overProject) return;
      targetStatus = overProject.status;
    }

    const targetColumnProjects = getProjectsByStatus(targetStatus);

    if (targetStatus !== draggedProject.status) {
      // Moving to a different column
      const newOrder = targetColumnProjects.length;
      moveProject(activeId, targetStatus, newOrder);
    } else if (activeId !== overId) {
      // Reordering within the same column
      const overProject = projects.find((p) => p.id === overId);
      if (overProject) {
        reorderProject(activeId, overProject.order);
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-board-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Dev Kanban</h1>
          <p className="text-xs text-text-secondary">Personal Project Board</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditProject(undefined);
            setFormDefaultStatus('idea');
            setFormOpen(true);
          }}
          className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-accent-primary/80"
        >
          + New Project
        </button>
      </header>

      {/* Search & Filter Bar */}
      <SearchFilter />

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-4 px-6 pb-6">
          {COLUMNS.map((col) => (
            <Column
              key={col.key}
              status={col.key}
              label={col.label}
              color={col.color}
              projects={getProjectsByStatus(col.key)}
              onAddClick={() => {
                setEditProject(undefined);
                setFormDefaultStatus(col.key);
                setFormOpen(true);
              }}
              onCardClick={(project) => {
                setDetailProject(project);
                setDetailOpen(true);
              }}
            />
          ))}
        </div>

        <DragOverlay>
          {activeProject ? (
            <ProjectCard project={activeProject} isDragOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      <ProjectForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditProject(undefined);
        }}
        defaultStatus={formDefaultStatus}
        editProject={editProject}
      />

      <CardDetail
        project={detailProject}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(project) => {
          setDetailOpen(false);
          setEditProject(project);
          setFormOpen(true);
        }}
      />
    </div>
  );
}
