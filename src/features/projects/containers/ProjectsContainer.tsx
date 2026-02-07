import { useState, useCallback } from "react";
import { Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useGetProjectsQuery } from "@/store/api";
import ProjectList from "../components/ProjectList";
import type { Project } from "@/shared/types";

const ProjectsContainer = () => {
  const navigate = useNavigate();
  const { data: projects = [] } = useGetProjectsQuery();
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const handleProjectSelect = useCallback((project: Project) => {
    navigate(`/projects/${project.id}`);
  }, [navigate]);
  const handleCreateClick = useCallback(() => {
    navigate("/projects/new");
  }, [navigate]);
  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4, height: '100%' }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Projects</Typography>
        <Typography variant="body1" color="textSecondary">Manage your projects and tasks here.</Typography>
      </Box>
      <ProjectList projects={projects} onCreateClick={handleCreateClick} onProjectSelect={handleProjectSelect} filterStatus={filterStatus} searchTerm={searchTerm} onFilterChange={setFilterStatus} onSearchChange={setSearchTerm} />
    </Box>
  );
};
export default ProjectsContainer;
