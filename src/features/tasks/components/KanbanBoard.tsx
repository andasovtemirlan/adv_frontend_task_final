import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import { AddCircle, Delete, Edit } from '@mui/icons-material';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/shared/types';

interface KanbanBoardProps {
  tasks: Task[];
  isLoading?: boolean;
  selectedProjectId?: number | null;
  teamMembers?: any[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskCreate?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const COLUMNS = ['backlog', 'todo', 'in_progress', 'review', 'done'];
const COLUMN_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const COLUMN_COLORS: Record<string, string> = {
  backlog: '#f5f5f5',
  todo: '#e3f2fd',
  in_progress: '#fff3e0',
  review: '#f3e5f5',
  done: '#e8f5e9',
};

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    high: '#d32f2f',
    medium: '#f57c00',
    low: '#388e3c',
  };
  return colors[priority] || '#1976d2';
};

const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return labels[priority] || 'Normal';
};

// Draggable Task Card Component
interface DraggableTaskProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const DraggableTask = ({ task, onEdit, onDelete }: DraggableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(task.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      sx={{
        mb: 1,
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        boxShadow: isDragging ? 3 : 1,
        '&:hover': {
          boxShadow: 2,
          '& .task-actions': {
            opacity: 1,
          },
        },
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }} {...listeners}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                wordBreak: 'break-word',
              }}
            >
              {task.title}
            </Typography>
          </Box>
          <Box
            className="task-actions"
            sx={{
              display: 'flex',
              gap: 0.5,
              opacity: 0,
              transition: 'opacity 0.2s',
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {onEdit && (
              <Edit
                sx={{
                  fontSize: 16,
                  cursor: 'pointer',
                  color: '#1976d2',
                  '&:hover': { color: '#1565c0' },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Edit clicked for task:', task.id);
                  onEdit(task);
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              />
            )}
            {onDelete && (
              <Delete
                sx={{
                  fontSize: 16,
                  cursor: 'pointer',
                  color: '#d32f2f',
                  '&:hover': { color: '#c62828' },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Delete clicked for task:', task.id);
                  onDelete(String(task.id));
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              />
            )}
          </Box>
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            color: 'text.secondary',
          }}
        >
          {task.description}
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
          <Chip
            label={getPriorityLabel(task.priority || 'medium')}
            size="small"
            sx={{
              backgroundColor: getPriorityColor(task.priority || 'medium'),
              color: 'white',
              height: '24px',
              fontSize: '0.7rem',
              fontWeight: 600,
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

// Kanban Column Component
interface KanbanColumnProps {
  columnId: string;
  label: string;
  tasks: Task[];
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onAddTask?: () => void;
}

const KanbanColumn = ({
  columnId,
  label,
  tasks,
  onTaskEdit,
  onTaskDelete,
  onAddTask,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  const taskIds = useMemo(() => tasks.map((t) => String(t.id)), [tasks]);

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minWidth: { xs: '100%', sm: 300 },
        maxWidth: 350,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isOver ? 'rgba(25, 118, 210, 0.1)' : COLUMN_COLORS[columnId],
        borderRadius: 1,
        transition: 'background-color 0.2s',
      }}
    >
      <Paper
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: COLUMN_COLORS[columnId],
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Column Header */}
        <Box
          sx={{
            p: 2,
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderBottom: '2px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {label}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </Typography>
          </Box>
          {onAddTask && (
            <AddCircle
              sx={{
                cursor: 'pointer',
                color: '#1976d2',
                '&:hover': { color: '#1565c0' },
              }}
              onClick={onAddTask}
            />
          )}
        </Box>

        {/* Tasks Container */}
        <Box
          sx={{
            flex: 1,
            p: 1.5,
            overflowY: 'auto',
            minHeight: '500px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <DraggableTask
                key={task.id}
                task={task}
                onEdit={onTaskEdit}
                onDelete={onTaskDelete}
              />
            ))}
          </SortableContext>
        </Box>
      </Paper>
    </Box>
  );
};

// Main Kanban Board Component
const KanbanBoard = ({
  tasks,
  selectedProjectId,
  teamMembers = [],
  onTaskUpdate,
  onTaskDelete,
  onTaskCreate,
}: KanbanBoardProps) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingTask, setCreatingTask] = useState<string | null>(null);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigneeId: null as number | null,
  });

    const sensors = useSensors(
      useSensor(PointerSensor, {
        // Require a small drag before activation so clicks on actions don't start a drag
        activationConstraint: { distance: 8 },
      })
    );

    const tasksByStatus = useMemo(() => {
      const grouped: Record<string, Task[]> = {};
      COLUMNS.forEach((col) => (grouped[col] = []));
      tasks.forEach((task) => {
        const status = task.status || 'backlog';
        if (grouped[status]) grouped[status].push(task);
      });
      console.log('Tasks grouped by status:', grouped);
      return grouped;
    }, [tasks]);

    const handleDragStart = useCallback(
      (event: DragStartEvent) => {
        const taskId = event.active.id as string;
        const task = tasks.find((t) => String(t.id) === taskId) || null;
        setDraggedTask(task);
      },
      [tasks]
    );

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        setDraggedTask(null);

        if (!over) return;

        const draggedTaskId = active.id as string;
        const overId = over.id as string;

        const draggedTaskObj = tasks.find((t) => String(t.id) === draggedTaskId);
        
        if (!draggedTaskObj) return;

        // Check if dropped over a column (column IDs are in COLUMNS array)
        if (COLUMNS.includes(overId)) {
          if (draggedTaskObj.status !== overId) {
            onTaskUpdate?.(draggedTaskId, {
              status: overId as any,
            });
          }
          return;
        }

        const targetTask = tasks.find((t) => String(t.id) === overId);
        if (targetTask && draggedTaskObj.status !== targetTask.status) {
          onTaskUpdate?.(draggedTaskId, {
            status: targetTask.status,
          });
        }
      },
      [tasks, onTaskUpdate]
    );

    const handleEditTask = useCallback((task: Task) => {
      setEditingTask(task);
    }, []);

    const handleSaveEdit = useCallback(() => {
      if (editingTask && onTaskUpdate) {
        onTaskUpdate(String(editingTask.id), editingTask);
        setEditingTask(null);
      }
    }, [editingTask, onTaskUpdate]);

    const handleCreateTask = useCallback(() => {
      if (creatingTask && newTaskData.title.trim() && onTaskCreate) {
        if (!selectedProjectId) {
          alert('Please select a project first');
          return;
        }
        onTaskCreate({
          title: newTaskData.title,
          description: newTaskData.description,
          status: creatingTask as any,
          priority: newTaskData.priority as any,
          projectId: selectedProjectId,
          assigneeId: newTaskData.assigneeId,
          dueDate: new Date().toISOString().split('T')[0],
          estimatedHours: 0,
          actualHours: 0,
        });
        setNewTaskData({ title: '', description: '', priority: 'medium', assigneeId: null });
        setCreatingTask(null);
      }
    }, [creatingTask, newTaskData, selectedProjectId, onTaskCreate, tasks]);

    return (
      <Box sx={{ width: '100%' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Kanban Board Container */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#ccc',
                borderRadius: '4px',
              },
            }}
          >
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column}
                columnId={column}
                label={COLUMN_LABELS[column]}
                tasks={tasksByStatus[column] || []}
                onTaskEdit={handleEditTask}
                onTaskDelete={onTaskDelete}
                onAddTask={() => setCreatingTask(column)}
              />
            ))}
          </Box>

          <DragOverlay>
            {draggedTask ? (
              <Card
                sx={{
                  opacity: 0.8,
                  boxShadow: 8,
                  backgroundColor: 'background.paper',
                }}
              >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {draggedTask.title}
                  </Typography>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Edit Task Dialog */}
        <Dialog
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Task</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Title"
                value={editingTask?.title || ''}
                onChange={(e) =>
                  setEditingTask(
                    editingTask ? { ...editingTask, title: e.target.value } : null
                  )
                }
                fullWidth
              />
              <TextField
                label="Description"
                value={editingTask?.description || ''}
                onChange={(e) =>
                  setEditingTask(
                    editingTask
                      ? { ...editingTask, description: e.target.value }
                      : null
                  )
                }
                fullWidth
                multiline
                rows={3}
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={editingTask?.priority || 'medium'}
                  label="Priority"
                  onChange={(e) =>
                    setEditingTask(
                      editingTask
                        ? { ...editingTask, priority: e.target.value }
                        : null
                    )
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingTask?.status || 'backlog'}
                  label="Status"
                  onChange={(e) =>
                    setEditingTask(
                      editingTask ? { ...editingTask, status: e.target.value as any } : null
                    )
                  }
                >
                  {COLUMNS.map((col) => (
                    <MenuItem key={col} value={col}>
                      {COLUMN_LABELS[col]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingTask(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Task Dialog */}
        <Dialog
          open={!!creatingTask}
          onClose={() => setCreatingTask(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Task</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Title"
                value={newTaskData.title}
                onChange={(e) =>
                  setNewTaskData({ ...newTaskData, title: e.target.value })
                }
                fullWidth
                autoFocus
              />
              <TextField
                label="Description"
                value={newTaskData.description}
                onChange={(e) =>
                  setNewTaskData({
                    ...newTaskData,
                    description: e.target.value,
                  })
                }
                fullWidth
                multiline
                rows={3}
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTaskData.priority}
                  label="Priority"
                  onChange={(e) =>
                    setNewTaskData({
                      ...newTaskData,
                      priority: e.target.value,
                    })
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Assign To (Optional)</InputLabel>
                <Select
                  value={newTaskData.assigneeId || ''}
                  label="Assign To (Optional)"
                  onChange={(e) =>
                    setNewTaskData({
                      ...newTaskData,
                      assigneeId: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {teamMembers.map((member) => (
                    <MenuItem key={member.id} value={member.userId}>
                      {member.name} ({member.positionName || 'No Position'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreatingTask(null)}>Cancel</Button>
            <Button onClick={handleCreateTask} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
};

export default KanbanBoard;
