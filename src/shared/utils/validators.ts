import { VALIDATION_RULES } from './constants';

/**
 * Validate email format
 */
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

/**
 * Validate password
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`;
  }
  return null;
};

/**
 * Validate name
 */
export const validateName = (name: string): string | null => {
  if (!name) {
    return 'Name is required';
  }
  if (name.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    return `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`;
  }
  return null;
};

/**
 * Validate project name
 */
export const validateProjectName = (name: string): string | null => {
  if (!name) {
    return 'Project name is required';
  }
  if (name.trim().length < VALIDATION_RULES.PROJECT_NAME_MIN_LENGTH) {
    return `Project name must be at least ${VALIDATION_RULES.PROJECT_NAME_MIN_LENGTH} characters`;
  }
  if (name.trim().length > VALIDATION_RULES.PROJECT_NAME_MAX_LENGTH) {
    return `Project name must not exceed ${VALIDATION_RULES.PROJECT_NAME_MAX_LENGTH} characters`;
  }
  return null;
};

/**
 * Validate task title
 */
export const validateTaskTitle = (title: string): string | null => {
  if (!title) {
    return 'Task title is required';
  }
  if (title.trim().length < VALIDATION_RULES.TASK_TITLE_MIN_LENGTH) {
    return `Task title must be at least ${VALIDATION_RULES.TASK_TITLE_MIN_LENGTH} characters`;
  }
  if (title.trim().length > VALIDATION_RULES.TASK_TITLE_MAX_LENGTH) {
    return `Task title must not exceed ${VALIDATION_RULES.TASK_TITLE_MAX_LENGTH} characters`;
  }
  return null;
};

/**
 * Validate date is not in the past
 */
export const validateFutureDate = (date: string): string | null => {
  if (!date) {
    return 'Date is required';
  }
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return 'Date cannot be in the past';
  }
  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  return null;
};
