// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME_MODE: 'theme_mode',
} as const;

// Task Status Configuration
export const TASK_STATUSES = {
  backlog: { label: 'Backlog', color: '#9e9e9e' },
  todo: { label: 'To Do', color: '#2196f3' },
  in_progress: { label: 'In Progress', color: '#ff9800' },
  review: { label: 'Review', color: '#9c27b0' },
  done: { label: 'Done', color: '#4caf50' },
} as const;

// Priority Configuration
export const PRIORITIES = {
  low: { label: 'Low', color: '#4caf50' },
  medium: { label: 'Medium', color: '#ff9800' },
  high: { label: 'High', color: '#f44336' },
  critical: { label: 'Critical', color: '#d32f2f' },
} as const;

// Project Status Configuration
export const PROJECT_STATUSES = {
  planning: { label: 'Planning', color: '#2196f3' },
  active: { label: 'Active', color: '#4caf50' },
  on_hold: { label: 'On Hold', color: '#ff9800' },
  completed: { label: 'Completed', color: '#9e9e9e' },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  PROJECT_NAME_MIN_LENGTH: 3,
  PROJECT_NAME_MAX_LENGTH: 100,
  TASK_TITLE_MIN_LENGTH: 3,
  TASK_TITLE_MAX_LENGTH: 200,
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const ACTIVITY_PAGE_SIZE = 20;

// Debounce Delays
export const DEBOUNCE_DELAY = 500; // ms
export const ASYNC_VALIDATION_DELAY = 500; // ms

// Date Formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM dd, yyyy';
export const DISPLAY_DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';
