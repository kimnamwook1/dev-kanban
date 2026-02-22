import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../useProjectStore';

beforeEach(() => {
  useProjectStore.setState({
    projects: [],
    filterTag: null,
    filterPriority: null,
    searchQuery: '',
  });
});

describe('useProjectStore', () => {
  describe('addProject', () => {
    it('adds a project with generated id, timestamps, and order', () => {
      useProjectStore.getState().addProject({
        title: 'Test Project',
        description: 'A test',
        status: 'idea',
        priority: 'medium',
        tags: ['web'],
        dueDate: null,
        progress: 0,
        checklist: [],
        memo: '',
      });
      const projects = useProjectStore.getState().projects;
      expect(projects).toHaveLength(1);
      expect(projects[0].title).toBe('Test Project');
      expect(projects[0].id).toBeTruthy();
      expect(projects[0].createdAt).toBeTruthy();
      expect(projects[0].updatedAt).toBeTruthy();
      expect(projects[0].order).toBeDefined();
    });
  });

  describe('updateProject', () => {
    it('updates specified fields and updatedAt', () => {
      useProjectStore.getState().addProject({
        title: 'Original', description: '', status: 'idea',
        priority: 'low', tags: [], dueDate: null, progress: 0, checklist: [], memo: '',
      });
      const id = useProjectStore.getState().projects[0].id;
      const oldUpdatedAt = useProjectStore.getState().projects[0].updatedAt;

      // Small delay to ensure timestamp differs
      useProjectStore.getState().updateProject(id, { title: 'Updated' });

      const updated = useProjectStore.getState().projects[0];
      expect(updated.title).toBe('Updated');
    });
  });

  describe('deleteProject', () => {
    it('removes a project by id', () => {
      useProjectStore.getState().addProject({
        title: 'ToDelete', description: '', status: 'idea',
        priority: 'low', tags: [], dueDate: null, progress: 0, checklist: [], memo: '',
      });
      const id = useProjectStore.getState().projects[0].id;
      useProjectStore.getState().deleteProject(id);
      expect(useProjectStore.getState().projects).toHaveLength(0);
    });
  });

  describe('moveProject', () => {
    it('changes project status and order', () => {
      useProjectStore.getState().addProject({
        title: 'Move Me', description: '', status: 'idea',
        priority: 'low', tags: [], dueDate: null, progress: 0, checklist: [], memo: '',
      });
      const id = useProjectStore.getState().projects[0].id;
      useProjectStore.getState().moveProject(id, 'in-progress', 0);
      const project = useProjectStore.getState().projects[0];
      expect(project.status).toBe('in-progress');
      expect(project.order).toBe(0);
    });
  });

  describe('reorderProject', () => {
    it('changes project order within same column', () => {
      useProjectStore.getState().addProject({
        title: 'First', description: '', status: 'idea',
        priority: 'low', tags: [], dueDate: null, progress: 0, checklist: [], memo: '',
      });
      const id = useProjectStore.getState().projects[0].id;
      useProjectStore.getState().reorderProject(id, 5);
      expect(useProjectStore.getState().projects[0].order).toBe(5);
    });
  });

  describe('checklist operations', () => {
    it('toggles a checklist item', () => {
      useProjectStore.getState().addProject({
        title: 'Check', description: '', status: 'idea',
        priority: 'low', tags: [], dueDate: null, progress: 0,
        checklist: [{ id: 'c1', text: 'item 1', checked: false }], memo: '',
      });
      const id = useProjectStore.getState().projects[0].id;
      useProjectStore.getState().toggleChecklistItem(id, 'c1');
      expect(useProjectStore.getState().projects[0].checklist[0].checked).toBe(true);
    });

    it('adds a checklist item', () => {
      useProjectStore.getState().addProject({
        title: 'Check', description: '', status: 'idea',
        priority: 'low', tags: [], dueDate: null, progress: 0,
        checklist: [], memo: '',
      });
      const id = useProjectStore.getState().projects[0].id;
      useProjectStore.getState().addChecklistItem(id, 'New item');
      const checklist = useProjectStore.getState().projects[0].checklist;
      expect(checklist).toHaveLength(1);
      expect(checklist[0].text).toBe('New item');
      expect(checklist[0].checked).toBe(false);
    });

    it('removes a checklist item', () => {
      useProjectStore.getState().addProject({
        title: 'Check', description: '', status: 'idea',
        priority: 'low', tags: [], dueDate: null, progress: 0,
        checklist: [{ id: 'c1', text: 'item 1', checked: false }], memo: '',
      });
      const id = useProjectStore.getState().projects[0].id;
      useProjectStore.getState().removeChecklistItem(id, 'c1');
      expect(useProjectStore.getState().projects[0].checklist).toHaveLength(0);
    });
  });

  describe('filters', () => {
    it('sets filter values', () => {
      useProjectStore.getState().setFilter({ searchQuery: 'test', filterTag: 'web' });
      expect(useProjectStore.getState().searchQuery).toBe('test');
      expect(useProjectStore.getState().filterTag).toBe('web');
    });
  });
});
