/**
 * CSV Export Utilities
 * Provides functions to convert data to CSV format and trigger downloads
 */

interface CSVRow {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Converts data to CSV string format
 * @param data Array of objects to convert
 * @param headers Optional custom headers (defaults to object keys)
 * @returns CSV formatted string
 */
export const convertToCSV = (data: CSVRow[], headers?: string[]): string => {
  if (data.length === 0) return '';

  // Use provided headers or extract from first object
  const cols = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = cols.map((col) => `"${String(col).replace(/"/g, '""')}"`).join(',');

  // Create data rows
  const dataRows = data
    .map((row) =>
      cols
        .map((col) => {
          const value = row[col];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
          return String(value);
        })
        .join(',')
    )
    .join('\n');

  return `${headerRow}\n${dataRows}`;
};

/**
 * Triggers a download of CSV file
 * @param csvContent CSV string content
 * @param filename Name of the file to download
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Exports array of objects to CSV file
 * @param data Array of objects to export
 * @param filename Name of the file to download
 * @param headers Optional custom headers
 */
export const exportToCSV = (data: CSVRow[], filename: string, headers?: string[]): void => {
  const csvContent = convertToCSV(data, headers);
  downloadCSV(csvContent, filename);
};

/**
 * Exports tasks summary for reports
 */
export const exportTasksReport = (
  tasks: any[],
  projects: any[],
  filename = 'tasks-report.csv'
): void => {
  const taskData = tasks.map((task) => {
    const project = projects.find((p) => p.id === task.projectId);
    return {
      'Task ID': task.id,
      'Task Title': task.title,
      'Project': project?.name || 'N/A',
      'Status': task.status,
      'Priority': task.priority,
      'Assigned To': task.assigneeId || 'Unassigned',
      'Due Date': task.dueDate || 'N/A',
      'Estimated Hours': task.estimatedHours || 0,
      'Actual Hours': task.actualHours || 0,
      'Variance': (task.estimatedHours || 0) - (task.actualHours || 0),
      'Created': task.createdAt,
      'Updated': task.updatedAt,
    };
  });

  exportToCSV(taskData, filename);
};

/**
 * Exports project summary for reports
 */
export const exportProjectsReport = (projects: any[], filename = 'projects-report.csv'): void => {
  const projectData = projects.map((project) => ({
    'Project ID': project.id,
    'Project Name': project.name,
    'Status': project.status,
    'Progress': `${project.progress}%`,
    'Start Date': project.startDate || 'N/A',
    'End Date': project.endDate || 'N/A',
    'Priority': project.priority || 'N/A',
    'Created': project.createdAt,
    'Updated': project.updatedAt,
  }));

  exportToCSV(projectData, filename);
};

/**
 * Exports time tracking summary for reports
 */
export const exportTimeTrackingReport = (
  tasks: any[],
  projects: any[],
  filename = 'time-tracking-report.csv'
): void => {
  const timeData = tasks
    .filter((task) => task.estimatedHours || task.actualHours)
    .map((task) => {
      const project = projects.find((p) => p.id === task.projectId);
      const estimated = task.estimatedHours || 0;
      const actual = task.actualHours || 0;
      const variance = estimated - actual;
      const accuracy = estimated > 0 ? ((actual / estimated) * 100).toFixed(2) : '0';

      return {
        'Task ID': task.id,
        'Task Title': task.title,
        'Project': project?.name || 'N/A',
        'Estimated Hours': estimated,
        'Actual Hours': actual,
        'Variance': variance,
        'Accuracy %': accuracy,
      };
    });

  if (timeData.length === 0) {
    alert('No time tracking data to export');
    return;
  }

  exportToCSV(timeData, filename);
};

/**
 * Exports analytics summary (status, priority distribution)
 */
export const exportAnalyticsSummary = (
  tasks: any[],
  projects: any[],
  filename = 'analytics-summary.csv'
): void => {
  // Task status distribution
  const statusCounts: Record<string, number> = {
    backlog: 0,
    todo: 0,
    in_progress: 0,
    review: 0,
    done: 0,
  };

  tasks.forEach((task) => {
    const status = (task.status as keyof typeof statusCounts) || 'backlog';
    statusCounts[status]++;
  });

  // Priority distribution
  const priorityCounts: Record<string, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  tasks.forEach((task) => {
    const priority = (task.priority as keyof typeof priorityCounts) || 'medium';
    priorityCounts[priority]++;
  });

  const summaryData = [
    { Category: 'Task Status', Type: 'Backlog', Count: statusCounts.backlog },
    { Category: 'Task Status', Type: 'To Do', Count: statusCounts.todo },
    { Category: 'Task Status', Type: 'In Progress', Count: statusCounts.in_progress },
    { Category: 'Task Status', Type: 'Review', Count: statusCounts.review },
    { Category: 'Task Status', Type: 'Done', Count: statusCounts.done },
    { Category: 'Priority', Type: 'Low', Count: priorityCounts.low },
    { Category: 'Priority', Type: 'Medium', Count: priorityCounts.medium },
    { Category: 'Priority', Type: 'High', Count: priorityCounts.high },
    { Category: 'Priority', Type: 'Critical', Count: priorityCounts.critical },
    { Category: 'Overall', Type: 'Total Projects', Count: projects.length },
    { Category: 'Overall', Type: 'Total Tasks', Count: tasks.length },
    {
      Category: 'Overall',
      Type: 'Completion Rate',
      Count: `${((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100).toFixed(2)}%`,
    },
  ];

  exportToCSV(summaryData as any[], filename);
};
