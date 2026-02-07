import { Typography, Box, Paper, List, ListItem, Chip, Stack } from "@mui/material";
import { useGetActivitiesQuery } from "@/store/api";
import { formatRelativeTime } from "@/shared/utils/formatters";

const ActivityContainer = () => {
  const { data: activities = [] } = useGetActivitiesQuery({ limit: 100 });
  const getActivityColor = (type: string): any => {
    if (type.includes("created")) return "success";
    if (type.includes("updated")) return "info";
    if (type.includes("deleted")) return "error";
    if (type.includes("assigned")) return "warning";
    return "default";
  };
  const getActivityLabel = (type: string): string => {
    return type.replace(/_/g, " ").split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };
  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4, height: '100%' }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Activity Log</Typography>
        <Typography variant="body1" color="textSecondary">View all system activities and changes.</Typography>
      </Box>
      <Paper sx={{ p: 2 }}>
        <List sx={{ width: "100%" }}>
          {activities.map((activity) => (
            <ListItem key={activity.id} sx={{ borderBottom: "1px solid #eee", py: 2, px: 0, flexDirection: "column", alignItems: "flex-start" }}>
              <Stack spacing={1} sx={{ width: "100%" }}>
                <Box display="flex" gap={1} alignItems="center" justifyContent="space-between">
                  <Box display="flex" gap={1} alignItems="center">
                    <Chip label={getActivityLabel(activity.type)} color={getActivityColor(activity.type)} size="small" />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{activity.userName}</Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">{formatRelativeTime(activity.timestamp)}</Typography>
                </Box>
                <Typography variant="body2">{activity.message}</Typography>
              </Stack>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};
export default ActivityContainer;
