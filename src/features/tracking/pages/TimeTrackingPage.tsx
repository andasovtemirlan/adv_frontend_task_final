import { useState, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { useGetTasksQuery, useUpdateTaskMutation } from '@/store/api';
import { Task } from '@/shared/types';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { formatPercentage } from '@/shared/utils/formatters';

const TimeTrackingPage = () => {
  const { data: tasks = [], isLoading } = useGetTasksQuery({ projectId: undefined });
  const [updateTask] = useUpdateTaskMutation();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hoursSpent, setHoursSpent] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const taskMetrics = useMemo(() => {
    return tasks.map((task) => {
      const estimatedHours = task.estimatedHours || 0;
      const actualHours = task.actualHours || 0;
      const variance = estimatedHours - actualHours;
      const accuracy = estimatedHours > 0 ? (actualHours / estimatedHours) * 100 : 0;

      return {
        ...task,
        variance,
        accuracy,
        isOvertime: actualHours > estimatedHours,
      };
    });
  }, [tasks]);

  const handleOpenDialog = (task: Task) => {
    setSelectedTask(task);
    setHoursSpent(String(task.actualHours || 0));
    setOpenDialog(true);
  };

  const handleSaveHours = async () => {
    if (!selectedTask || !hoursSpent) return;

    try {
      const hours = parseFloat(hoursSpent);
      if (isNaN(hours) || hours < 0) {
        alert('Please enter a valid number');
        return;
      }

      await updateTask({
        id: selectedTask.id,
        data: { actualHours: hours },
      }).unwrap();

      setOpenDialog(false);
      setSelectedTask(null);
      setHoursSpent('');
    } catch (error) {
      alert('Failed to update hours');
    }
  };

  const totalEstimatedHours = taskMetrics.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalActualHours = taskMetrics.reduce((sum, t) => sum + (t.actualHours || 0), 0);
  const overallAccuracy = totalEstimatedHours > 0 ? (totalActualHours / totalEstimatedHours) * 100 : 0;

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Time Tracking
      </Typography>

      <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Total Estimated Hours
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {totalEstimatedHours.toFixed(2)} hrs
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Total Actual Hours
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {totalActualHours.toFixed(2)} hrs
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Overall Accuracy
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: overallAccuracy > 90 ? 'success.main' : 'warning.main' }}>
              {formatPercentage(overallAccuracy)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ fontWeight: 700 }}>Task</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Estimated
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Actual
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Variance
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Accuracy
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taskMetrics.map((task) => (
              <TableRow key={task.id} hover>
                <TableCell>{task.title}</TableCell>
                <TableCell align="right">{task.estimatedHours} hrs</TableCell>
                <TableCell align="right" sx={{ color: task.isOvertime ? 'error.main' : 'success.main', fontWeight: 600 }}>
                  {task.actualHours} hrs
                </TableCell>
                <TableCell align="right" sx={{ color: task.variance < 0 ? 'error.main' : 'success.main' }}>
                  {task.variance > 0 ? '+' : ''}{task.variance.toFixed(2)} hrs
                </TableCell>
                <TableCell align="right">{formatPercentage(task.accuracy)}</TableCell>
                <TableCell align="center">
                  <Button size="small" onClick={() => handleOpenDialog(task)}>
                    Log
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Log Hours</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedTask && (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Task:</strong> {selectedTask.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Estimated:</strong> {selectedTask.estimatedHours} hours
              </Typography>
              <TextField
                label="Actual Hours"
                type="number"
                inputProps={{ step: '0.5', min: '0' }}
                value={hoursSpent}
                onChange={(e) => setHoursSpent(e.target.value)}
                fullWidth
                autoFocus
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveHours} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeTrackingPage;
