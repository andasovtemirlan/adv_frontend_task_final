import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Box, Button, TextField, Alert, CircularProgress } from "@mui/material";
import { useGetProjectQuery, useUpdateProjectMutation, useDeleteProjectMutation, useCreateProjectMutation, useGetTasksQuery } from "@/store/api";
import { DatePickerField } from "@/shared/components/DatePickers";
import TeamAssignmentPanel from "../components/TeamAssignmentPanel";
import type { Project } from "@/shared/types";

const ProjectDetailContainer = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isNewProject = !id || id === "new";
  
  const { data: project, isLoading, error } = useGetProjectQuery(id ? parseInt(id, 10) : 0, { skip: isNewProject });
  const { data: tasks = [] } = useGetTasksQuery({});
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [createProject] = useCreateProjectMutation();
  
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    status: 'active',
    progress: 0,
    startDate: '',
    endDate: '',
  });
  
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize form with project data
  useMemo(() => {
    if (project && !isNewProject) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        progress: project.progress,
        startDate: project.startDate || '',
        endDate: project.endDate || '',
      });
    }
  }, [project, isNewProject]);

  const projectTasks = useMemo(() => 
    tasks.filter((t) => t.projectId === parseInt(id || '0', 10)),
    [tasks, id]
  );

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.name?.trim()) {
      setSaveError("Project name is required");
      return;
    }
    
    // Validate progress is between 0 and 100
    const progress = formData.progress || 0;
    if (progress < 0 || progress > 100) {
      setSaveError("Progress must be between 0 and 100");
      return;
    }

    try {
      if (isNewProject) {
        await createProject({
          name: formData.name,
          description: formData.description || '',
          status: formData.status || 'active',
          progress: progress,
        }).unwrap();
        navigate("/projects");
      } else {
        await updateProject({
          id: parseInt(id!, 10),
          data: formData,
        }).unwrap();
        navigate("/projects");
      }
    } catch (err) {
      setSaveError("Failed to save project");
    }
  }, [formData, isNewProject, id, updateProject, createProject, navigate]);

  const handleDelete = useCallback(async () => {
    if (!id || isNewProject) return;
    
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      await deleteProject(parseInt(id, 10)).unwrap();
      navigate("/projects");
    } catch (err) {
      setSaveError("Failed to delete project");
    }
  }, [id, isNewProject, deleteProject, navigate]);

  const handleBack = useCallback(() => {
    navigate("/projects");
  }, [navigate]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  if (error && !isNewProject) {
    return <Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}><Alert severity="error">Failed to load project</Alert></Box>;
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4, maxWidth: 800, mx: 'auto' }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {isNewProject ? "Create Project" : "Edit Project"}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {isNewProject ? "Create a new project" : `Edit project "${formData.name}"`}
        </Typography>
      </Box>

      {saveError && <Alert severity="error" sx={{ mb: 3 }}>{saveError}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        <TextField
          label="Project Name"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          fullWidth
          variant="outlined"
        />
        <TextField
          label="Description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          fullWidth
          multiline
          rows={4}
          variant="outlined"
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <DatePickerField
            label="Start Date"
            value={formData.startDate || ''}
            onChange={(date) => handleInputChange('startDate', date)}
          />
          <DatePickerField
            label="End Date"
            value={formData.endDate || ''}
            onChange={(date) => handleInputChange('endDate', date)}
          />
        </Box>
        <TextField
          label="Progress (%)"
          type="number"
          value={formData.progress || 0}
          onChange={(e) => handleInputChange('progress', parseInt(e.target.value, 10))}
          fullWidth
          inputProps={{ min: 0, max: 100 }}
          variant="outlined"
        />
        <TextField
          label="Status"
          select
          value={formData.status || 'active'}
          onChange={(e) => handleInputChange('status', e.target.value)}
          fullWidth
          variant="outlined"
          SelectProps={{
            native: true,
          }}
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </TextField>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {isNewProject ? "Create Project" : "Save Changes"}
        </Button>
        <Button variant="outlined" onClick={handleBack}>
          Cancel
        </Button>
        {!isNewProject && (
          <Button variant="outlined" color="error" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </Box>

      {!isNewProject && (
        <TeamAssignmentPanel projectId={parseInt(id!, 10)} />
      )}

      {projectTasks.length > 0 && !isNewProject && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Tasks in this Project ({projectTasks.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {projectTasks.map((task) => (
              <Box
                key={task.id}
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: 'background.paper',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {task.title}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Status: {task.status} • Priority: {task.priority}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProjectDetailContainer;
