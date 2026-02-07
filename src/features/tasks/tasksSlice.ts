import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TaskFilters, TaskStatus, TaskPriority } from '@/shared/types';

interface TasksState {
  selectedTaskId: number | null;
  filters: TaskFilters;
  viewMode: 'kanban' | 'list';
  draggedTaskId: number | null;
}

const initialState: TasksState = {
  selectedTaskId: null,
  filters: {},
  viewMode: 'kanban',
  draggedTaskId: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<number | null>) => {
      state.selectedTaskId = action.payload;
    },
    setFilters: (state, action: PayloadAction<TaskFilters>) => {
      state.filters = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<TaskStatus | undefined>) => {
      state.filters.status = action.payload;
    },
    setPriorityFilter: (state, action: PayloadAction<TaskPriority | undefined>) => {
      state.filters.priority = action.payload;
    },
    setProjectFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.projectId = action.payload;
    },
    setAssigneeFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.assigneeId = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.search = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'kanban' | 'list'>) => {
      state.viewMode = action.payload;
    },
    setDraggedTask: (state, action: PayloadAction<number | null>) => {
      state.draggedTaskId = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const {
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
} = tasksSlice.actions;

export default tasksSlice.reducer;
