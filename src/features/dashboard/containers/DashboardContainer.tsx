import { useCallback, useMemo } from "react";
import { Paper, Typography, Box, Skeleton, Alert } from "@mui/material";
import { useGetProjectsQuery, useGetTasksQuery, useGetUsersQuery, useGetActivitiesQuery } from "@/store/api";
import QuickStats from "../components/QuickStats";
import ProjectOverviewCard from "../components/ProjectOverviewCard";
import ActivityFeed from "../components/ActivityFeed";

const DashboardContainer = () => {
  const { data: projects, isLoading: isLoadingProjects, error: projectsError } = useGetProjectsQuery();
  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = useGetTasksQuery({});
  const { data: users, isLoading: isLoadingUsers, error: usersError } = useGetUsersQuery();
  const { data: activities, isLoading: isLoadingActivities, error: activitiesError } = useGetActivitiesQuery({ limit: 50 });
  const projectsForDisplay = useMemo(() => projects || [], [projects]);
  const tasksForDisplay = useMemo(() => tasks || [], [tasks]);
  const usersForDisplay = useMemo(() => users || [], [users]);
  const getTeamMembersForProject = useCallback((projectId: number) => {
    const project = projects?.find((p) => p.id === projectId);
    if (!project || !users) return [];
    return users.slice(0, 5);
  }, [projects, users]);
  const hasErrors = projectsError || tasksError || usersError || activitiesError;
  if (hasErrors) {
    return (<Box sx={{ px: { xs: 2, sm: 3 }, py: 4 }}><Alert severity="error">Failed to load dashboard data. Please try refreshing the page.</Alert></Box>);
  }
  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4, height: '100%' }}>
      <Box mb={4}><Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Dashboard</Typography><Typography variant="body1" color="textSecondary">Welcome back! Here's an overview of your projects and activities.</Typography></Box>
      <Box mb={4}><QuickStats projects={projectsForDisplay} tasks={tasksForDisplay} users={usersForDisplay} isLoadingProjects={isLoadingProjects} isLoadingTasks={isLoadingTasks} isLoadingUsers={isLoadingUsers} /></Box>
      
      <Box sx={{ display: { xs: 'block', md: 'grid' }, gridTemplateColumns: { md: '2fr 1fr' }, gap: 3 }}>
        {/* Projects Section */}
        <Box>
          <Box mb={2}><Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Projects</Typography></Box>
          {isLoadingProjects ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i}>
                  <Skeleton variant="rectangular" height={320} />
                </Box>
              ))}
            </Box>
          ) : projectsForDisplay.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: "center", backgroundColor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)" }}>
              <Typography color="textSecondary">No projects yet</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              {projectsForDisplay.map((project) => (
                <Box key={project.id}>
                  <ProjectOverviewCard project={project} tasks={tasksForDisplay} teamMembers={getTeamMembersForProject(project.id)} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
        
        {/* Activity Section */}
        <Box>
          <Box mb={2}><Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Activity</Typography></Box>
          <Paper sx={{ p: 2, backgroundColor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)" }}>
            {isLoadingActivities ? (
              <Box>
                {[1, 2, 3].map((i) => (
                  <Box key={i} mb={2}>
                    <Skeleton variant="text" width="100%" height={24} />
                    <Skeleton variant="text" width="80%" height={20} />
                  </Box>
                ))}
              </Box>
            ) : (
              <ActivityFeed activities={activities} isLoading={isLoadingActivities} />
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
export default DashboardContainer;
