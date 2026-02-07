import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ActivityFilters } from '@/shared/types';

interface ActivityState {
  filters: ActivityFilters;
  page: number;
  pageSize: number;
}

const initialState: ActivityState = {
  filters: {},
  page: 1,
  pageSize: 20,
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ActivityFilters>) => {
      state.filters = action.payload;
      state.page = 1; // Reset to first page when filters change
    },
    setEntityTypeFilter: (state, action: PayloadAction<ActivityFilters['entityType']>) => {
      state.filters.entityType = action.payload;
      state.page = 1;
    },
    setUserFilter: (state, action: PayloadAction<number | undefined>) => {
      state.filters.userId = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.page = 1;
    },
  },
});

export const { setFilters, setEntityTypeFilter, setUserFilter, setPage, clearFilters } =
  activitySlice.actions;

export default activitySlice.reducer;
