import { memo, useMemo } from "react";
import { Grid, Card, CardContent, Typography, Box, Skeleton, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Project, Task, User } from "@/shared/types";

interface QuickStatsProps {
  projects: Project[] | undefined;
  tasks: Task[] | undefined;
  users: User[] | undefined;
  isLoadingProjects: boolean;
  isLoadingTasks: boolean;
  isLoadingUsers: boolean;
}

const QuickStats = memo(({ projects, tasks, users, isLoadingProjects, isLoadingTasks, isLoadingUsers }: QuickStatsProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const stats = useMemo(() => {
    const totalProjects = projects?.length ?? 0;
    const activeProjects = projects?.filter((p) => p.status === "active").length ?? 0;
    const totalTasks = tasks?.length ?? 0;
    const teamMembers = users?.length ?? 0;
    return [
      { label: "Total Projects", value: totalProjects, icon: "", color: theme.palette.primary.main, route: "/projects" },
      { label: "Active Projects", value: activeProjects, icon: "", color: theme.palette.success.main, route: "/projects" },
      { label: "Total Tasks", value: totalTasks, icon: "", color: theme.palette.info.main, route: "/tasks" },
      { label: "Team Members", value: teamMembers, icon: "", color: theme.palette.warning.main, route: "/members" },
    ];
  }, [projects, tasks, users, theme.palette]);
  
  return (
    <Grid container spacing={2}>
      {stats.map((stat) => (
        <Box key={stat.label} sx={{ flex: { xs: '0 0 100%', sm: '0 0 50%', md: '0 0 33.333%' }, px: 1 }}>
          <Card 
            onClick={() => navigate(stat.route)}
            sx={{ 
              height: "100%", 
              display: "flex", 
              flexDirection: "column", 
              backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)", 
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
              "&:hover": { 
                transform: "translateY(-4px)", 
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)" 
              } 
            }}
          >
            <CardContent sx={{ flex: 1 }}>
              {(isLoadingProjects || isLoadingTasks || isLoadingUsers) ? (<><Skeleton variant="text" width="60%" height={24} /><Skeleton variant="text" width="80%" height={32} sx={{ mt: 1 }} /><Skeleton variant="text" width="40%" height={20} sx={{ mt: 2 }} /></>) : (<><Box display="flex" alignItems="center" justifyContent="space-between" mb={2}><Typography color="textSecondary" sx={{ fontSize: "1.5rem" }}>{stat.icon}</Typography><Typography variant="h3" sx={{ fontWeight: 700, color: stat.color }}>{stat.value}</Typography></Box><Typography color="textSecondary" variant="body2">{stat.label}</Typography></>)}
            </CardContent>
          </Card>
        </Box>
      ))}
    </Grid>
  );
});
QuickStats.displayName = "QuickStats";
export default QuickStats;
