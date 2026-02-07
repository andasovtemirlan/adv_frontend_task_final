import { useState, useMemo } from 'react';
import { Box, Paper, Typography, Dialog, DialogTitle, DialogContent, Button, DialogActions } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useGetTasksQuery } from '@/store/api';
import type { Task } from '@/shared/types';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  resource: Task;
}

const CalendarPage = () => {
  const { data: tasks = [], isLoading } = useGetTasksQuery({ projectId: undefined });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const events: CalendarEvent[] = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        id: task.id,
        title: task.title,
        start: parseISO(task.dueDate),
        end: parseISO(task.dueDate),
        resource: task,
      }));
  }, [tasks]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3, height: '100%' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Task Calendar
      </Typography>

      <Paper sx={{ height: 'calc(100vh - 200px)', overflow: 'hidden', bgcolor: 'background.paper' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          popup
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedEvent && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{selectedEvent.resource.title}</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                <strong>Description:</strong> {selectedEvent.resource.description}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                <strong>Due Date:</strong> {format(selectedEvent.start, 'MMM dd, yyyy')}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                <strong>Status:</strong> {selectedEvent.resource.status}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Priority:</strong> {selectedEvent.resource.priority}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CalendarPage;
