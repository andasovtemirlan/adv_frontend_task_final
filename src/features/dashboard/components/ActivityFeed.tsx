import { memo, useMemo } from "react";
import { Box, Typography, List, ListItem, Chip, useTheme, Paper, Stack } from "@mui/material";
import type { Activity } from "@/shared/types";
import { formatRelativeTime } from "@/shared/utils/formatters";

interface ActivityFeedProps {
  activities: Activity[] | undefined;
  isLoading: boolean;
}

const ActivityFeed = memo(({ activities, isLoading }: ActivityFeedProps) => {
  const theme = useTheme();
  const recentActivities = useMemo(() => (activities || []).slice(0, 10), [activities]);
  const isEmpty = !isLoading && recentActivities.length === 0;
  const getActivityTypeColor = (type: string): any => {
    if (type.includes("created")) return "success";
    if (type.includes("updated")) return "info";
    if (type.includes("deleted")) return "error";
    if (type.includes("assigned")) return "warning";
    return "default";
  };
  const getActivityLabel = (type: string): string => {
    const labelMap: Record<string, string> = {
      project_created: "Project Created",
      project_updated: "Project Updated",
      project_deleted: "Project Deleted",
      task_created: "Task Created",
      task_updated: "Task Updated",
      task_deleted: "Task Deleted",
      task_status_changed: "Status Changed",
      task_assigned: "Task Assigned",
      team_created: "Team Created",
      team_updated: "Team Updated",
      team_member_added: "Member Added",
      team_member_removed: "Member Removed",
    };
    return labelMap[type] || type;
  };
  if (isEmpty) {
    return (<Paper sx={{ p: 4, textAlign: "center", backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)" }}><Typography color="textSecondary" variant="body2">No activities yet</Typography></Paper>);
  }
  return (
    <List sx={{ width: "100%", p: 0 }}>
      {recentActivities.map((activity, index) => (
        <Box key={activity.id}>
          <ListItem sx={{ py: 2, px: 0, "&:hover": { backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)" }, transition: "background-color 0.2s" }}>
            <Stack spacing={1} sx={{ width: "100%" }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Chip label={getActivityLabel(activity.type)} color={getActivityTypeColor(activity.type)} size="small" variant="filled" sx={{ fontWeight: 600, fontSize: "0.7rem" }} />
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>by {activity.userName}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{activity.message}</Typography>
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>{formatRelativeTime(activity.timestamp)}</Typography>
              </Box>
            </Stack>
          </ListItem>
          {index < recentActivities.length - 1 && <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, my: 1 }} />}
        </Box>
      ))}
    </List>
  );
});
ActivityFeed.displayName = "ActivityFeed";
export default ActivityFeed;
