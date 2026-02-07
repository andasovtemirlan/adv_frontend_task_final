import { describe, expect, it } from 'vitest';
import reducer, {
  setSelectedTask,
  setFilters,
  setStatusFilter,
  setPriorityFilter,
  setProjectFilter,
  setAssigneeFilter,
  setSearchFilter,
  setViewMode,
  setDraggedTask,
  clearFilters,
} from '@/features/tasks/tasksSlice';

const initialState = reducer(undefined, { type: '@@INIT' });

describe('tasksSlice', () => {
  it('sets selected task', () => {
    const state = reducer(initialState, setSelectedTask(5));
    expect(state.selectedTaskId).toBe(5);
  });

  it('applies and clears filters', () => {
    const withFilters = reducer(
      initialState,
      setFilters({ status: 'todo', priority: 'high', search: 'nav' } as any)
    );
    expect(withFilters.filters.status).toBe('todo');
    expect(withFilters.filters.priority).toBe('high');
    expect(withFilters.filters.search).toBe('nav');

    const cleared = reducer(withFilters, clearFilters());
    expect(cleared.filters).toEqual({});
  });

  it('sets individual filters', () => {
    const status = reducer(initialState, setStatusFilter('review' as any));
    expect(status.filters.status).toBe('review');

    const priority = reducer(initialState, setPriorityFilter('low' as any));
    expect(priority.filters.priority).toBe('low');

    const project = reducer(initialState, setProjectFilter(10));
    expect(project.filters.projectId).toBe(10);

    const assignee = reducer(initialState, setAssigneeFilter(3));
    expect(assignee.filters.assigneeId).toBe(3);

    const search = reducer(initialState, setSearchFilter('query'));
    expect(search.filters.search).toBe('query');
  });

  it('sets view mode and dragged task', () => {
    const view = reducer(initialState, setViewMode('list'));
    expect(view.viewMode).toBe('list');

    const dragged = reducer(initialState, setDraggedTask(9));
    expect(dragged.draggedTaskId).toBe(9);
  });
});
