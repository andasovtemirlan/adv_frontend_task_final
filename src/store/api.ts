import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  User,
  Team,
  Project,
  Task,
  Activity,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '@/shared/types';
import { STORAGE_KEYS } from '@/shared/utils/constants';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Team', 'Project', 'Task', 'Activity'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (data) => ({
        url: '/register',
        method: 'POST',
        body: data,
      }),
    }),

    // User endpoints
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    getUser: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    // Team endpoints
    getTeams: builder.query<Team[], void>({
      query: () => '/teams',
      providesTags: ['Team'],
    }),
    getTeam: builder.query<Team, number>({
      query: (id) => `/teams/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Team', id }],
    }),
    createTeam: builder.mutation<Team, Partial<Team>>({
      query: (team) => ({
        url: '/teams',
        method: 'POST',
        body: team,
      }),
      invalidatesTags: ['Team', 'Activity'],
    }),
    updateTeam: builder.mutation<Team, { id: number; data: Partial<Team> }>({
      query: ({ id, data }) => ({
        url: `/teams/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Team', id }, 'Activity'],
    }),
    deleteTeam: builder.mutation<void, number>({
      query: (id) => ({
        url: `/teams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Team', 'Activity'],
    }),

    // Project endpoints
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getProject: builder.query<Project, number>({
      query: (id) => `/projects/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: '/projects',
        method: 'POST',
        body: {
          ...project,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['Project', 'Activity'],
    }),
    updateProject: builder.mutation<Project, { id: number; data: Partial<Project> }>({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Project', id }, 'Project', 'Task', 'Activity'],
    }),
    deleteProject: builder.mutation<void, number>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project', 'Task', 'Activity'],
    }),
    checkProjectNameUnique: builder.query<boolean, { name: string; excludeId?: number }>({
      query: ({ name }) => {
        const params = new URLSearchParams({ name });
        return `/projects?${params}`;
      },
      transformResponse: (response: Project[], _meta, arg) => {
        const filtered = arg.excludeId
          ? response.filter((p) => p.id !== arg.excludeId)
          : response;
        return filtered.length === 0;
      },
    }),

    // Task endpoints
    getTasks: builder.query<Task[], { projectId?: number }>({
      query: ({ projectId }) => {
        const params = projectId ? `?projectId=${projectId}` : '';
        return `/tasks${params}`;
      },
      providesTags: ['Task'],
    }),
    getTask: builder.query<Task, number>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),
    createTask: builder.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: '/tasks',
        method: 'POST',
        body: {
          ...task,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['Task', 'Activity'],
    }),
    updateTask: builder.mutation<Task, { id: number; data: Partial<Task> }>({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: 'PATCH',
        body: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Task', id }, 'Task', 'Project', 'Activity'],
    }),
    deleteTask: builder.mutation<void, number>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task', 'Activity'],
    }),
    checkTaskTitleUnique: builder.query<
      boolean,
      { title: string; projectId: number; excludeId?: number }
    >({
      query: ({ title, projectId }) => {
        const params = new URLSearchParams({ title, projectId: projectId.toString() });
        return `/tasks?${params}`;
      },
      transformResponse: (response: Task[], _meta, arg) => {
        const filtered = arg.excludeId
          ? response.filter((t) => t.id !== arg.excludeId)
          : response;
        return filtered.length === 0;
      },
    }),

    // Activity endpoints
    getActivities: builder.query<Activity[], { limit?: number; entityType?: string }>({
      query: ({ limit = 50, entityType }) => {
        const params = new URLSearchParams();
        params.append('_sort', 'timestamp');
        params.append('_order', 'desc');
        params.append('_limit', limit.toString());
        if (entityType) {
          params.append('entityType', entityType);
        }
        return `/activities?${params}`;
      },
      providesTags: ['Activity'],
    }),
    createActivity: builder.mutation<Activity, Partial<Activity>>({
      query: (activity) => ({
        url: '/activities',
        method: 'POST',
        body: {
          ...activity,
          timestamp: new Date().toISOString(),
        },
      }),
      invalidatesTags: ['Activity'],
    }),

    // Project Teams endpoints
    getProjectTeams: builder.query<any[], number>({
      query: (projectId) => `/projects/${projectId}/teams`,
      providesTags: ['Project'],
    }),
    assignTeamToProject: builder.mutation<any, { projectId: number; teamId: number }>({
      query: ({ projectId, teamId }) => ({
        url: `/projects/${projectId}/teams`,
        method: 'POST',
        body: { teamId },
      }),
      invalidatesTags: ['Project'],
    }),
    removeTeamFromProject: builder.mutation<void, { projectId: number; teamId: number }>({
      query: ({ projectId, teamId }) => ({
        url: `/projects/${projectId}/teams/${teamId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),

    // Positions endpoints
    getTeamPositions: builder.query<any[], number>({
      query: (teamId) => `/teams/${teamId}/positions`,
      providesTags: ['Team'],
    }),
    createPosition: builder.mutation<any, { teamId: number; name: string; description?: string }>({
      query: ({ teamId, name, description }) => ({
        url: `/teams/${teamId}/positions`,
        method: 'POST',
        body: { name, description },
      }),
      invalidatesTags: ['Team'],
    }),
    updatePosition: builder.mutation<any, { id: number; name?: string; description?: string }>({
      query: ({ id, name, description }) => ({
        url: `/positions/${id}`,
        method: 'PATCH',
        body: { name, description },
      }),
      invalidatesTags: ['Team'],
    }),
    deletePosition: builder.mutation<void, number>({
      query: (id) => ({
        url: `/positions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Team'],
    }),

    // Project Team Members endpoints
    getProjectTeamMembers: builder.query<any[], number>({
      query: (projectId) => `/projects/${projectId}/team-members`,
      providesTags: ['Project'],
    }),
    assignMemberToProjectTeam: builder.mutation<any, { projectId: number; teamId: number; userId: number; positionId?: number }>({
      query: ({ projectId, teamId, userId, positionId }) => ({
        url: `/projects/${projectId}/team-members`,
        method: 'POST',
        body: { teamId, userId, positionId },
      }),
      invalidatesTags: ['Project'],
    }),
    updateProjectTeamMember: builder.mutation<any, { id: number; positionId?: number }>({
      query: ({ id, positionId }) => ({
        url: `/project-team-members/${id}`,
        method: 'PATCH',
        body: { positionId },
      }),
      invalidatesTags: ['Project'],
    }),
    removeProjectTeamMember: builder.mutation<void, number>({
      query: (id) => ({
        url: `/project-team-members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUsersQuery,
  useGetUserQuery,
  useGetTeamsQuery,
  useGetTeamQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useLazyCheckProjectNameUniqueQuery,
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useLazyCheckTaskTitleUniqueQuery,
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useGetProjectTeamsQuery,
  useAssignTeamToProjectMutation,
  useRemoveTeamFromProjectMutation,
  useGetTeamPositionsQuery,
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
  useGetProjectTeamMembersQuery,
  useAssignMemberToProjectTeamMutation,
  useUpdateProjectTeamMemberMutation,
  useRemoveProjectTeamMemberMutation,
} = api;
