import { useMemo } from 'react';
import { Paper, Typography, Box, Button, Stack } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useGetProjectsQuery, useGetTasksQuery } from '@/store/api';
import type { Task, Project } from '@/shared/types';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import {
  exportTasksReport,
  exportProjectsReport,
  exportTimeTrackingReport,
  exportAnalyticsSummary,
} from '@/shared/utils/exporters';

const ReportsPage = () => {
  const { data: projects = [], isLoading: projectsLoading } = useGetProjectsQuery();
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasksQuery({ projectId: undefined });

  const isLoading = projectsLoading || tasksLoading;

  // Task status distribution
  const taskDistribution = useMemo(() => {
    const counts = {
      backlog: 0,
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    };

    tasks.forEach((task: Task) => {
      const status = (task.status as keyof typeof counts) || 'backlog';
      counts[status]++;
    });

    return [
      { name: 'Backlog', value: counts.backlog, color: '#64748B' },
      { name: 'To Do', value: counts.todo, color: '#3B82F6' },
      { name: 'In Progress', value: counts.in_progress, color: '#F59E0B' },
      { name: 'Review', value: counts.review, color: '#A855F7' },
      { name: 'Done', value: counts.done, color: '#10B981' },
    ];
  }, [tasks]);

  // Project progress data
  const projectProgress = useMemo(() => {
    return projects.map((p: Project) => ({
      name: p.name.substring(0, 15),
      progress: p.progress || 0,
      tasks: tasks.filter((t: Task) => t.projectId === p.id).length,
    }));
  }, [projects, tasks]);

  // Task priority breakdown
  const priorityBreakdown = useMemo(() => {
    const counts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    tasks.forEach((task: Task) => {
      const priority = (task.priority as keyof typeof counts) || 'medium';
      counts[priority]++;
    });

    return [
      { name: 'Low', value: counts.low, color: '#10B981' },
      { name: 'Medium', value: counts.medium, color: '#3B82F6' },
      { name: 'High', value: counts.high, color: '#F59E0B' },
      { name: 'Critical', value: counts.critical, color: '#EF4444' },
    ];
  }, [tasks]);

  // Time tracking metrics
  const timeMetrics = useMemo(() => {
    const totalEstimated = tasks.reduce((sum: number, t: Task) => sum + (t.estimatedHours || 0), 0);
    const totalActual = tasks.reduce((sum: number, t: Task) => sum + (t.actualHours || 0), 0);
    const variance = totalEstimated - totalActual;

    return [
      { name: 'Estimated', value: totalEstimated },
      { name: 'Actual', value: totalActual },
      { name: 'Variance', value: variance > 0 ? variance : 0 },
    ];
  }, [tasks]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ py: 3, px: 2, maxWidth: 1280, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          Reports & Analytics
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportAnalyticsSummary(tasks as Task[], projects as Project[])}
          >
            Export Summary
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportTasksReport(tasks as Task[], projects as Project[])}
          >
            Export Tasks
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportProjectsReport(projects as Project[])}
          >
            Export Projects
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportTimeTrackingReport(tasks as Task[], projects as Project[])}
          >
            Export Time Tracking
          </Button>
        </Stack>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Task Status Distribution */}
        <Paper sx={{ p: 2, bgcolor: 'background.paper', height: '100%' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Task Status Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {taskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Priority Breakdown */}
        <Paper sx={{ p: 2, bgcolor: 'background.paper', height: '100%' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Task Priority Breakdown
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#82ca9d"
                dataKey="value"
              >
                {priorityBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Project Progress */}
        <Paper sx={{ p: 2, bgcolor: 'background.paper', gridColumn: { xs: '1', md: '1 / -1' } }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Project Progress
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#CBD5E1" />
              <YAxis stroke="#CBD5E1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                }}
                labelStyle={{ color: '#F1F5F9' }}
              />
              <Legend />
              <Bar dataKey="progress" fill="#06B6D4" name="Progress %" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Time Tracking Metrics */}
        <Paper sx={{ p: 2, bgcolor: 'background.paper', gridColumn: { xs: '1', md: '1 / -1' } }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Time Tracking Summary
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#CBD5E1" />
              <YAxis stroke="#CBD5E1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                }}
                labelStyle={{ color: '#F1F5F9' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#06B6D4"
                strokeWidth={2}
                dot={{ fill: '#06B6D4', r: 6 }}
                name="Hours"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Summary Cards */}
        <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' }, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <Paper sx={{ p: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              Total Projects
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {projects.length}
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              Total Tasks
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main' }}>
              {tasks.length}
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              Completed Tasks
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
              {tasks.filter((t) => t.status === 'done').length}
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              Completion Rate
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
              {tasks.length > 0
                ? ((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100).toFixed(0)
                : 0}
              %
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ReportsPage;
