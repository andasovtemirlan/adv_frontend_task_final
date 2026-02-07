import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useGetTasksQuery, useGetProjectsQuery } from '@/store/api';
import { Task, TaskStatus, TaskPriority } from '@/shared/types';

interface FilterPreset {
  id: string;
  name: string;
  filters: TaskFilterState;
  createdAt: string;
}

interface TaskFilterState {
  title?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: number;
  assigneeId?: number;
}

const STORAGE_KEY = 'task_filter_presets';

const AdvancedSearchPage = () => {
  const { data: allTasks = [] } = useGetTasksQuery({ projectId: undefined });
  const { data: projects = [] } = useGetProjectsQuery();
  const [filters, setFilters] = useState<TaskFilterState>({});
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [openPresetDialog, setOpenPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);

  // Load presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load presets:', err);
      }
    }
  }, []);

  // Apply filters
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task: Task) => {
      if (filters.title && !task.title.toLowerCase().includes(filters.title.toLowerCase())) {
        return false;
      }
      if (filters.status && task.status !== filters.status) {
        return false;
      }
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }
      if (filters.projectId && task.projectId !== filters.projectId) {
        return false;
      }
      if (filters.assigneeId && task.assigneeId !== filters.assigneeId) {
        return false;
      }
      return true;
    });
  }, [allTasks, filters]);

  const handleFilterChange = (key: keyof TaskFilterState, value: any) => {
    setFilters((prev) => {
      if (value === '' || value === null) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    let newPresets = [...presets];
    if (editingPresetId) {
      newPresets = newPresets.map((p) =>
        p.id === editingPresetId ? { ...p, name: presetName, filters } : p
      );
    } else {
      newPresets.push({
        id: Date.now().toString(),
        name: presetName,
        filters,
        createdAt: new Date().toISOString(),
      });
    }

    setPresets(newPresets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
    setOpenPresetDialog(false);
    setPresetName('');
    setEditingPresetId(null);
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
  };

  const handleDeletePreset = (id: string) => {
    const newPresets = presets.filter((p) => p.id !== id);
    setPresets(newPresets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
  };

  const handleEditPreset = (preset: FilterPreset) => {
    setPresetName(preset.name);
    setEditingPresetId(preset.id);
    setFilters(preset.filters);
    setOpenPresetDialog(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Advanced Search & Filters
      </Typography>

      <Grid container spacing={3}>
        {/* Filter Panel */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Search Filters
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
              <TextField
                label="Task Title"
                size="small"
                value={filters.title || ''}
                onChange={(e) => handleFilterChange('title', e.target.value)}
                fullWidth
              />

              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || ''}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="backlog">Backlog</MenuItem>
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority || ''}
                  label="Priority"
                  onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Project</InputLabel>
                <Select
                  value={filters.projectId || ''}
                  label="Project"
                  onChange={(e) => handleFilterChange('projectId', e.target.value ? Number(e.target.value) : undefined)}
                >
                  <MenuItem value="">All Projects</MenuItem>
                  {projects.map((p: any) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Button variant="contained" onClick={() => setOpenPresetDialog(true)}>
                Save as Preset
              </Button>
              <Button variant="outlined" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </Box>

            <Typography variant="body2" color="textSecondary">
              Results: {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
            </Typography>
          </Paper>

          {/* Results */}
          <Paper sx={{ mt: 2, bgcolor: 'background.paper' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks.slice(0, 10).map((task: Task) => (
                    <TableRow key={task.id} hover>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>
                        <Chip label={task.status} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={
                            task.priority === 'critical'
                              ? 'error'
                              : task.priority === 'high'
                                ? 'warning'
                                : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Presets Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: 'background.paper', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Saved Presets ({presets.length})
            </Typography>

            {presets.length === 0 ? (
              <Alert severity="info">No presets saved yet. Create one to quickly reuse filters.</Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {presets.map((preset) => (
                  <Paper key={preset.id} sx={{ p: 1.5, bgcolor: 'background.default', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {preset.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {Object.keys(preset.filters).length} filter{Object.keys(preset.filters).length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleLoadPreset(preset)}
                        title="Load preset"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditPreset(preset)}
                        title="Edit preset"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePreset(preset.id)}
                        title="Delete preset"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Save Preset Dialog */}
      <Dialog open={openPresetDialog} onClose={() => setOpenPresetDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingPresetId ? 'Update Preset' : 'Save Preset'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Preset Name"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenPresetDialog(false);
              setPresetName('');
              setEditingPresetId(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSavePreset} variant="contained">
            {editingPresetId ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedSearchPage;
