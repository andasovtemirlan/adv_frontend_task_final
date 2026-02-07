import type { Middleware } from '@reduxjs/toolkit';
import { api } from '../api';
import type { Activity } from '@/shared/types';

/**
 * Middleware to automatically log activities for mutations
 * This intercepts successful mutations and creates activity log entries
 */
export const activityLoggerMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);

  // Check if this is a fulfilled mutation action from RTK Query
  if (action.type?.endsWith('/fulfilled') && action.meta?.arg?.type === 'mutation') {
    const state = store.getState();
    const user = state.auth.user;

    if (!user) return result;

    const endpoint = action.meta.arg.endpointName;
    let activityData: Partial<Activity> | null = null;

    // Map mutations to activity log entries
    switch (endpoint) {
      case 'createProject':
        activityData = {
          type: 'project_created',
          entityType: 'project',
          entityId: action.payload.id,
          userId: user.id,
          userName: user.name,
          message: `created project '${action.payload.name}'`,
          metadata: { projectName: action.payload.name },
        };
        break;

      case 'updateProject':
        activityData = {
          type: 'project_updated',
          entityType: 'project',
          entityId: action.meta.arg.originalArgs.id,
          userId: user.id,
          userName: user.name,
          message: `updated project '${action.payload.name}'`,
          metadata: {
            projectName: action.payload.name,
            changes: Object.keys(action.meta.arg.originalArgs.data),
          },
        };
        break;

      case 'deleteProject':
        activityData = {
          type: 'project_deleted',
          entityType: 'project',
          entityId: action.meta.arg.originalArgs,
          userId: user.id,
          userName: user.name,
          message: `deleted a project`,
        };
        break;

      case 'createTask':
        activityData = {
          type: 'task_created',
          entityType: 'task',
          entityId: action.payload.id,
          userId: user.id,
          userName: user.name,
          message: `created task '${action.payload.title}'`,
          metadata: {
            taskTitle: action.payload.title,
            projectId: action.payload.projectId,
          },
        };
        break;

      case 'updateTask':
        const taskData = action.meta.arg.originalArgs.data;
        if (taskData.status) {
          activityData = {
            type: 'task_status_changed',
            entityType: 'task',
            entityId: action.meta.arg.originalArgs.id,
            userId: user.id,
            userName: user.name,
            message: `moved task '${action.payload.title}' to ${taskData.status.replace('_', ' ')}`,
            metadata: {
              taskTitle: action.payload.title,
              newStatus: taskData.status,
            },
          };
        } else if (taskData.assigneeId) {
          activityData = {
            type: 'task_assigned',
            entityType: 'task',
            entityId: action.meta.arg.originalArgs.id,
            userId: user.id,
            userName: user.name,
            message: `assigned task '${action.payload.title}'`,
            metadata: {
              taskTitle: action.payload.title,
              assigneeId: taskData.assigneeId,
            },
          };
        } else {
          activityData = {
            type: 'task_updated',
            entityType: 'task',
            entityId: action.meta.arg.originalArgs.id,
            userId: user.id,
            userName: user.name,
            message: `updated task '${action.payload.title}'`,
            metadata: { taskTitle: action.payload.title },
          };
        }
        break;

      case 'deleteTask':
        activityData = {
          type: 'task_deleted',
          entityType: 'task',
          entityId: action.meta.arg.originalArgs,
          userId: user.id,
          userName: user.name,
          message: `deleted a task`,
        };
        break;

      case 'createTeam':
        activityData = {
          type: 'team_created',
          entityType: 'team',
          entityId: action.payload.id,
          userId: user.id,
          userName: user.name,
          message: `created team '${action.payload.name}'`,
          metadata: { teamName: action.payload.name },
        };
        break;

      case 'updateTeam':
        activityData = {
          type: 'team_updated',
          entityType: 'team',
          entityId: action.meta.arg.originalArgs.id,
          userId: user.id,
          userName: user.name,
          message: `updated team '${action.payload.name}'`,
          metadata: { teamName: action.payload.name },
        };
        break;
    }

    // Create activity log entry if we have data
    if (activityData) {
      store.dispatch(api.endpoints.createActivity.initiate(activityData) as any);
    }
  }

  return result;
};
