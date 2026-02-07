import { memo, useCallback, useMemo } from "react";
import { Box, Button, TextField, MenuItem, Typography } from "@mui/material";
import type { Project } from "@/shared/types";

interface ProjectListProps {
  projects: Project[];
  onCreateClick?: () => void;
  onProjectSelect?: (project: Project) => void;
  filterStatus?: string;
  searchTerm?: string;
  onFilterChange?: (status: string) => void;
  onSearchChange?: (term: string) => void;
}

const ProjectList = memo(({ projects, onCreateClick, onProjectSelect, filterStatus = "", searchTerm = "", onFilterChange, onSearchChange }: ProjectListProps) => {
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, filterStatus]);
  const handleProjectClick = useCallback((project: Project) => {
    onProjectSelect?.(project);
  }, [onProjectSelect]);
  return (
    <Box>
      <Box display="flex" gap={2} mb={3} sx={{ flexWrap: "wrap" }}>
        <TextField placeholder="Search projects..." value={searchTerm} onChange={(e) => onSearchChange?.(e.target.value)} size="small" sx={{ flex: "1 1 200px" }} />
        <TextField select value={filterStatus} onChange={(e) => onFilterChange?.(e.target.value)} size="small" label="Status" sx={{ flex: "1 1 150px" }}>
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="planning">Planning</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="on_hold">On Hold</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </TextField>
        <Button variant="contained" onClick={onCreateClick}>New Project</Button>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {filteredProjects.map((project) => (
          <Box key={project.id} onClick={() => handleProjectClick(project)} sx={{ cursor: "pointer" }}>
            <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1, "&:hover": { boxShadow: 2 }, width: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{project.name}</Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>{project.description}</Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{project.progress}% complete</span>
                <span style={{ fontSize: "0.8em", backgroundColor: "#f0f0f0", padding: "4px 8px", borderRadius: "4px" }}>{project.status}</span>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
});
ProjectList.displayName = "ProjectList";
export default ProjectList;
