import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ProjectFilters, ProjectStatus } from '@/shared/types';

interface ProjectsState {
  selectedProjectId: number | null;
  filters: ProjectFilters;
  sortBy: 'name' | 'createdAt' | 'status' | 'priority';
  sortOrder: 'asc' | 'desc';
}

const initialState: ProjectsState = {
  selectedProjectId: null,
  filters: {},
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setSelectedProject: (state, action: PayloadAction<number | null>) => {
      state.selectedProjectId = action.payload;
    },
    setFilters: (state, action: PayloadAction<ProjectFilters>) => {
      state.filters = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<ProjectStatus | undefined>) => {
      state.filters.status = action.payload;
    },
    setTeamFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.teamId = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string | undefined>) => {
      state.filters.search = action.payload;
    },
    setSorting: (
      state,
      action: PayloadAction<{ sortBy: ProjectsState['sortBy']; sortOrder: 'asc' | 'desc' }>
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const {
  setSelectedProject,
  setFilters,
  setStatusFilter,
  setTeamFilter,
  setSearchFilter,
  setSorting,
  clearFilters,
} = projectsSlice.actions;

export default projectsSlice.reducer;
