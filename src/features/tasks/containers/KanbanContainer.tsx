import { Typography, Box, Alert, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useCallback, useState, useEffect } from "react";
import { useUpdateTaskMutation, useDeleteTaskMutation, useCreateTaskMutation, useGetProjectsQuery, useGetProjectTeamMembersQuery } from "@/store/api";
import KanbanBoard from "../components/KanbanBoard";
import type { Task } from "@/shared/types";

const KanbanContainer = () => {
  const { data: allProjects = [] } = useGetProjectsQuery();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [createTask] = useCreateTaskMutation();
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const normalizeTask = useCallback((task: Task): Task => {
    const validStatuses = new Set(["backlog", "todo", "in_progress", "review", "done"]);
    const status = validStatuses.has(task.status as string) ? task.status : "backlog";
    const priority = task.priority || "medium";
    return { ...task, status, priority };
  }, []);

  const normalizeTasks = useCallback(
    (tasks: Task[]) => tasks.map((task) => normalizeTask(task)),
    [normalizeTask]
  );

  // Fetch team members for selected project
  const { data: projectTeamMembers = [] } = useGetProjectTeamMembersQuery(
    selectedProjectId || 0,
    { skip: !selectedProjectId }
  );

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        console.log('Fetching tasks...');
        const response = await fetch('http://localhost:3001/tasks');
        console.log('Tasks response:', response);
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Tasks data:', data);
        setAllTasks(normalizeTasks(data));
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks');
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [normalizeTasks]);

  // Filter tasks by selected project
  const tasks = selectedProjectId 
    ? allTasks.filter(task => task.projectId === selectedProjectId)
    : allTasks;

  const handleTaskUpdate = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      try {
        setError(null);
        // Convert taskId to number since API expects numbers
        const id = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
        console.log('Updating task:', id, 'with updates:', updates);
        const result = await updateTask({ id, data: updates }).unwrap();
        console.log('Task updated successfully:', result);
        // Refetch tasks
        const response = await fetch('http://localhost:3001/tasks');
        const data = await response.json();
        setAllTasks(normalizeTasks(data));
      } catch (err) {
        setError("Failed to update task");
        console.error('Update error:', err);
      }
    },
    [normalizeTasks, updateTask]
  );

  const handleTaskDelete = useCallback(
    async (taskId: string) => {
      try {
        setError(null);
        const id = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
        console.log('Deleting task:', id);
        const result = await deleteTask(id).unwrap();
        console.log('Task deleted successfully:', result);
        // Refetch tasks
        const response = await fetch('http://localhost:3001/tasks');
        const data = await response.json();
        setAllTasks(normalizeTasks(data));
      } catch (err) {
        setError("Failed to delete task");
        console.error('Delete error:', err);
      }
    },
    [deleteTask, normalizeTasks]
  );

  const handleTaskCreate = useCallback(
    async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setError(null);
        const result = await createTask(task).unwrap();
        console.log('Task created:', result);
        // Refetch tasks
        const response = await fetch('http://localhost:3001/tasks');
        const data = await response.json();
        setAllTasks(normalizeTasks(data));
      } catch (err) {
        setError("Failed to create task");
        console.error('Create error:', err);
      }
    },
    [createTask, normalizeTasks]
  );

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4, height: '100%', overflow: 'auto' }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Task Board</Typography>
        <Box sx={{ mb: 2, maxWidth: 300 }}>
          <FormControl fullWidth>
            <InputLabel>Project</InputLabel>
            <Select
              value={selectedProjectId || ''}
              label="Project"
              onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
            >
              <MenuItem value="">All Projects</MenuItem>
              {allProjects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Typography variant="body1" color="textSecondary">Drag tasks between columns to update their status. Click the + icon to create new tasks.</Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <KanbanBoard 
        tasks={tasks} 
        selectedProjectId={selectedProjectId}
        teamMembers={projectTeamMembers}
        isLoading={isLoading}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        onTaskCreate={handleTaskCreate}
      />
    </Box>
  );
};
export default KanbanContainer;
