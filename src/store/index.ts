import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import { api } from './api';
import authReducer from '@/features/auth/authSlice';
import projectsReducer from '@/features/projects/projectsSlice';
import tasksReducer from '@/features/tasks/tasksSlice';
import teamsReducer from '@/features/teams/teamsSlice';
import activityReducer from '@/features/activity/activitySlice';
import { activityLoggerMiddleware } from './middleware/activityLogger';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    teams: teamsReducer,
    activity: activityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, activityLoggerMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
