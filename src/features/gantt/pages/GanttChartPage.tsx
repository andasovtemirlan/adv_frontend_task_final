import { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { useGetProjectsQuery, useGetTasksQuery } from '@/store/api';
import type { Task, Project } from '@/shared/types';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

interface GanttTask {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  type: 'project' | 'task';
  projectId?: number;
}

const GanttChartPage = () => {
  const { data: projects = [], isLoading: projectsLoading } = useGetProjectsQuery();
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasksQuery({ projectId: undefined });

  const isLoading = projectsLoading || tasksLoading;

  // Prepare Gantt data
  const ganttData = useMemo(() => {
    const items: GanttTask[] = [];

    // Add projects
    projects.forEach((p: Project) => {
      items.push({
        id: p.id,
        title: p.name,
        startDate: p.startDate || new Date().toISOString().split('T')[0],
        endDate: p.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: p.progress || 0,
        type: 'project',
      });
    });

    // Add tasks
    tasks.forEach((t: Task) => {
      const project = projects.find((p: Project) => p.id === t.projectId);
      if (project) {
        items.push({
          id: t.id,
          title: `  → ${t.title}`,
          startDate: t.dueDate || project.startDate || new Date().toISOString().split('T')[0],
          endDate: t.dueDate || project.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          progress: t.status === 'done' ? 100 : 0,
          type: 'task',
          projectId: t.projectId,
        });
      }
    });

    return items;
  }, [projects, tasks]);

  // Calculate date range for timeline
  const dateRange = useMemo(() => {
    if (ganttData.length === 0) {
      const today = new Date();
      return {
        start: today,
        end: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000),
      };
    }

    const dates = ganttData.map((item) => ({
      start: new Date(item.startDate),
      end: new Date(item.endDate),
    }));

    const start = new Date(Math.min(...dates.map((d) => d.start.getTime())));
    const end = new Date(Math.max(...dates.map((d) => d.end.getTime())));

    // Add buffer
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);

    return { start, end };
  }, [ganttData]);

  // Calculate bar position and width
  const calculateBarStyle = (task: GanttTask) => {
    const taskStart = new Date(task.startDate).getTime();
    const taskEnd = new Date(task.endDate).getTime();
    const rangeStart = dateRange.start.getTime();
    const rangeEnd = dateRange.end.getTime();
    const rangeDuration = rangeEnd - rangeStart;

    const left = ((taskStart - rangeStart) / rangeDuration) * 100;
    const width = ((taskEnd - taskStart) / rangeDuration) * 100;

    return {
      left: `${Math.max(0, left)}%`,
      width: `${Math.min(100, width)}%`,
    };
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return '#10B981';
    if (progress >= 75) return '#F59E0B';
    if (progress >= 50) return '#3B82F6';
    return '#EF4444';
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Gantt Chart - Project Timeline
      </Typography>

      <Paper sx={{ overflow: 'auto', bgcolor: 'background.paper' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default', position: 'sticky', top: 0, zIndex: 10 }}>
                <TableCell sx={{ fontWeight: 700, minWidth: 250, position: 'sticky', left: 0, bgcolor: 'background.default', zIndex: 11 }}>
                  Project / Task
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: '800px', bgcolor: 'background.default' }}>
                  Timeline ({dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()})
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Progress</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ganttData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">No projects or tasks to display</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                ganttData.map((item) => {
                  const barStyle = calculateBarStyle(item);
                  const isProject = item.type === 'project';

                  return (
                    <TableRow
                      key={`${item.type}-${item.id}`}
                      sx={{
                        bgcolor: isProject ? 'background.default' : 'background.paper',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: isProject ? 700 : 500,
                          fontSize: isProject ? '1rem' : '0.9rem',
                          position: 'sticky',
                          left: 0,
                          zIndex: 9,
                          bgcolor: isProject ? 'background.default' : 'background.paper',
                        }}
                      >
                        <Tooltip title={item.title}>
                          <Typography
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.title}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ position: 'relative', height: '60px', p: 1 }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            left: barStyle.left,
                            width: barStyle.width,
                            height: '100%',
                            top: 0,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Tooltip
                            title={`${item.startDate} to ${item.endDate}`}
                            arrow
                          >
                            <Box
                              sx={{
                                width: '100%',
                                height: '40px',
                                bgcolor: isProject ? '#06B6D4' : getProgressColor(item.progress),
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                opacity: 0.9,
                                transition: 'opacity 0.2s',
                                '&:hover': {
                                  opacity: 1,
                                },
                              }}
                            >
                              {item.progress > 0 && `${Math.round(item.progress)}%`}
                            </Box>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress
                            variant="determinate"
                            value={item.progress}
                            size={32}
                            thickness={4}
                            sx={{
                              color: getProgressColor(item.progress),
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {Math.round(item.progress)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Legend */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 24, bgcolor: '#06B6D4', borderRadius: 0.5 }} />
          <Typography variant="caption">Projects</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 24, bgcolor: '#10B981', borderRadius: 0.5 }} />
          <Typography variant="caption">100% Complete</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 24, bgcolor: '#F59E0B', borderRadius: 0.5 }} />
          <Typography variant="caption">75%+ Complete</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 24, bgcolor: '#3B82F6', borderRadius: 0.5 }} />
          <Typography variant="caption">50%+ Complete</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 24, bgcolor: '#EF4444', borderRadius: 0.5 }} />
          <Typography variant="caption">Under 50% Complete</Typography>
        </Box>
      </Box>

      {/* Info */}
      <Paper sx={{ mt: 3, p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="textSecondary">
          <strong>Note:</strong> The Gantt chart displays projects based on their start and end dates.
          Tasks are positioned on the timeline by their due dates. Bar colors indicate task completion status.
          Hover over bars to see date ranges.
        </Typography>
      </Paper>
    </Box>
  );
};

export default GanttChartPage;
