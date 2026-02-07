import { Typography, Box, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Checkbox, FormControlLabel } from "@mui/material";
import { useGetTeamsQuery, useCreateTeamMutation, useUpdateTeamMutation, useGetUsersQuery } from "@/store/api";
import { useState, useCallback } from "react";

const TeamsContainer = () => {
  const { data: teams = [], refetch } = useGetTeamsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [createTeam] = useCreateTeamMutation();
  const [updateTeam] = useUpdateTeamMutation();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', memberIds: [] as number[] });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenDialog = useCallback((team?: any) => {
    if (team) {
      setEditingTeamId(team.id);
      setFormData({ 
        name: team.name, 
        description: team.description, 
        memberIds: team.memberIds || [] 
      });
    } else {
      setEditingTeamId(null);
      setFormData({ name: '', description: '', memberIds: [] });
    }
    setOpenDialog(true);
    setError(null);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingTeamId(null);
    setFormData({ name: '', description: '', memberIds: [] });
    setError(null);
  }, []);

  const handleCreateTeam = useCallback(async () => {
    if (!formData.name.trim()) {
      setError("Team name is required");
      return;
    }

    setIsLoading(true);
    try {
      if (editingTeamId) {
        await updateTeam({
          id: editingTeamId,
          data: {
            name: formData.name,
            description: formData.description,
            memberIds: formData.memberIds,
          },
        }).unwrap();
      } else {
        await createTeam({
          name: formData.name,
          description: formData.description,
          memberIds: formData.memberIds,
        }).unwrap();
      }
      refetch();
      handleCloseDialog();
    } catch (err) {
      setError("Failed to save team");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [formData, editingTeamId, createTeam, updateTeam, refetch, handleCloseDialog]);

  const handleToggleMember = useCallback((userId: number) => {
    setFormData((prev) => {
      const newMemberIds = prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId];
      return { ...prev, memberIds: newMemberIds };
    });
  }, []);

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4, height: '100%' }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Teams</Typography>
        <Typography variant="body1" color="textSecondary">Manage teams and team members.</Typography>
      </Box>
      <Button variant="contained" sx={{ mb: 3 }} onClick={handleOpenDialog}>Create Team</Button>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {teams.map((team) => (
          <Box key={team.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column", width: '100%' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{team.name}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>{team.description}</Typography>
                <Typography variant="caption" color="textSecondary">Members: {team.memberIds?.length || 0}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Button size="small" variant="outlined" onClick={() => handleOpenDialog(team)}>
                    Manage Members
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTeamId ? 'Edit Team' : 'Create Team'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Team Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
              autoFocus
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Team Members</Typography>
              <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 1.5, maxHeight: 200, overflowY: 'auto' }}>
                {users.length > 0 ? (
                  users.map((user) => (
                    <FormControlLabel
                      key={user.id}
                      control={
                        <Checkbox
                          checked={formData.memberIds.includes(user.id)}
                          onChange={() => handleToggleMember(user.id)}
                        />
                      }
                      label={user.name || user.email}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">No users available</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreateTeam} variant="contained" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default TeamsContainer;
