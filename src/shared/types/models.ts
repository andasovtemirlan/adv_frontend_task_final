// User types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'developer' | 'designer' | 'manager';
  avatar: string | null;
  createdAt: string;
}

export interface AuthUser extends User {
  token?: string;
}

// Team types
export interface Team {
  id: number;
  name: string;
  description: string;
  memberIds: number[];
  leaderId: number;
  createdAt: string;
  updatedAt: string;
}

// Project types
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  teamId: number;
  ownerId: number;
  startDate: string;
  endDate: string;
  priority: ProjectPriority;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// Task types
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: number;
  title: string;
  description: string;
  projectId: number;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  createdAt: string;
  updatedAt: string;
}

// Activity types
export type ActivityType =
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_status_changed'
  | 'task_assigned'
  | 'team_created'
  | 'team_updated'
  | 'team_member_added'
  | 'team_member_removed';

export interface Activity {
  id: number;
  type: ActivityType;
  entityType: 'project' | 'task' | 'team' | 'user';
  entityId: number;
  userId: number;
  userName: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Filter types
export interface ProjectFilters {
  status?: ProjectStatus;
  teamId?: number;
  ownerId?: number;
  search?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: number;
  assigneeId?: number;
  search?: string;
}

export interface ActivityFilters {
  entityType?: Activity['entityType'];
  userId?: number;
  startDate?: string;
  endDate?: string;
}
