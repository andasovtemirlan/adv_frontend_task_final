import { formatDistanceToNow, format, parseISO } from 'date-fns';

/**
 * Format a date string to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateString;
  }
};

/**
 * Format a date string to display format
 */
export const formatDisplayDate = (dateString: string, formatStr = 'MMM dd, yyyy'): string => {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch {
    return dateString;
  }
};

/**
 * Format a number to percentage
 */
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Generate a random color for avatars
 */
export const getAvatarColor = (id: number): string => {
  const colors = [
    '#1976d2',
    '#2e7d32',
    '#d32f2f',
    '#f57c00',
    '#7b1fa2',
    '#0097a7',
    '#c2185b',
    '#5d4037',
  ];
  return colors[id % colors.length];
};
