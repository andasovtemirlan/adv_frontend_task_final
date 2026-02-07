import { memo, useCallback, useMemo } from "react";
import { Card, CardContent, Typography, Box, Chip, LinearProgress, Avatar, AvatarGroup, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Project, Task, User } from "@/shared/types";
import { getInitials, getAvatarColor } from "@/shared/utils/formatters";

interface ProjectOverviewCardProps {
  project: Project;
  tasks?: Task[];
  teamMembers?: User[];
}

const ProjectOverviewCard = memo(({ project, tasks = [], teamMembers = [] }: ProjectOverviewCardProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const projectTasks = useMemo(() => tasks.filter((t) => t.projectId === project.id), [tasks, project.id]);
  const statusLabel = useMemo(() => project.status.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" "), [project.status]);
  const handleCardClick = useCallback(() => navigate(`/projects/${project.id}`), [navigate, project.id]);
  const getStatusColor = (status: string): any => {
    const statusMap: Record<string, any> = { planning: "default", active: "success", on_hold: "warning", completed: "info" };
    return statusMap[status] || "default";
  };
  return (
    <Card onClick={handleCardClick} sx={{ height: "100%", display: "flex", flexDirection: "column", cursor: "pointer", backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", "&:hover": { transform: "translateY(-8px)", boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)", backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)" } }}>
      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1} mr={1}><Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.name}</Typography></Box>
          <Chip label={statusLabel} color={getStatusColor(project.status)} size="small" variant="filled" sx={{ fontWeight: 600, fontSize: "0.7rem" }} />
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", minHeight: "2.8em" }}>{project.description}</Typography>
        <Box mb={2}><Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}><Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>Progress</Typography><Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>{project.progress}%</Typography></Box><LinearProgress variant="determinate" value={project.progress} sx={{ height: 6, borderRadius: 3, backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }} /></Box>
        <Box display="flex" justifyContent="space-between" alignItems="center"><Box><Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>{projectTasks.length} Tasks</Typography></Box>{teamMembers.length > 0 && (<AvatarGroup max={3} sx={{ "& .MuiAvatarGroup-avatar": { width: 28, height: 28 } }}>{teamMembers.slice(0, 3).map((member) => (<Avatar key={member.id} sx={{ width: 28, height: 28, backgroundColor: getAvatarColor(member.id), fontSize: "0.75rem", fontWeight: 600 }} src={member.avatar || undefined} alt={member.name}>{!member.avatar && getInitials(member.name)}</Avatar>))}</AvatarGroup>)}</Box>
      </CardContent>
    </Card>
  );
});
ProjectOverviewCard.displayName = "ProjectOverviewCard";
export default ProjectOverviewCard;
