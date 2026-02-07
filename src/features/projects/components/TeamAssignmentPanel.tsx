import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import {
  useGetProjectTeamsQuery,
  useGetTeamsQuery,
  useAssignTeamToProjectMutation,
  useRemoveTeamFromProjectMutation,
  useGetTeamPositionsQuery,
  useGetProjectTeamMembersQuery,
  useAssignMemberToProjectTeamMutation,
  useRemoveProjectTeamMemberMutation,
  useGetUsersQuery,
} from '@/store/api';

interface TeamAssignmentPanelProps {
  projectId: number;
}

const TeamAssignmentPanel = ({ projectId }: TeamAssignmentPanelProps) => {
  const { data: projectTeams = [], refetch: refetchProjectTeams } = useGetProjectTeamsQuery(projectId);
  const { data: allTeams = [] } = useGetTeamsQuery();
  const { data: projectTeamMembers = [], refetch: refetchTeamMembers } = useGetProjectTeamMembersQuery(projectId);
  const { data: allUsers = [] } = useGetUsersQuery();
  const [assignTeam] = useAssignTeamToProjectMutation();
  const [removeTeam] = useRemoveTeamFromProjectMutation();
  const [assignMember] = useAssignMemberToProjectTeamMutation();
  const [removeMember] = useRemoveProjectTeamMemberMutation();

  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableTeams = allTeams.filter(
    (team) => !projectTeams.some((pt) => pt.teamId === team.id)
  );

  const { data: selectedTeamPositions = [] } = useGetTeamPositionsQuery(
    selectedTeamForMembers || 0,
    { skip: !selectedTeamForMembers }
  );

  const handleAssignTeam = useCallback(async () => {
    if (!selectedTeamId) return;

    setLoading(true);
    try {
      await assignTeam({ projectId, teamId: selectedTeamId }).unwrap();
      setTeamDialogOpen(false);
      setSelectedTeamId(null);
      refetchProjectTeams();
    } catch (err) {
      setError('Failed to assign team');
    } finally {
      setLoading(false);
    }
  }, [selectedTeamId, projectId, assignTeam, refetchProjectTeams]);

  const handleRemoveTeam = useCallback(async (teamId: number) => {
    if (!window.confirm('Remove this team from the project?')) return;

    setLoading(true);
    try {
      await removeTeam({ projectId, teamId }).unwrap();
      refetchProjectTeams();
      refetchTeamMembers();
    } catch (err) {
      setError('Failed to remove team');
    } finally {
      setLoading(false);
    }
  }, [projectId, removeTeam, refetchProjectTeams, refetchTeamMembers]);

  const handleAssignMember = useCallback(async () => {
    if (!selectedMember || !selectedTeamForMembers) return;

    setLoading(true);
    try {
      await assignMember({
        projectId,
        teamId: selectedTeamForMembers,
        userId: selectedMember,
        positionId: selectedPosition || undefined,
      }).unwrap();
      setMemberDialogOpen(false);
      setSelectedMember(null);
      setSelectedPosition(null);
      refetchTeamMembers();
    } catch (err) {
      setError('Failed to assign member');
    } finally {
      setLoading(false);
    }
  }, [selectedMember, selectedTeamForMembers, selectedPosition, projectId, assignMember, refetchTeamMembers]);

  const handleRemoveMember = useCallback(async (memberId: number) => {
    if (!window.confirm('Remove this member from the project?')) return;

    setLoading(true);
    try {
      await removeMember(memberId).unwrap();
      refetchTeamMembers();
    } catch (err) {
      setError('Failed to remove member');
    } finally {
      setLoading(false);
    }
  }, [removeMember, refetchTeamMembers]);

  const teamMembersForSelectedTeam = selectedTeamForMembers
    ? projectTeamMembers.filter((m) => m.teamId === selectedTeamForMembers)
    : [];

  const usedMemberIds = teamMembersForSelectedTeam.map((m) => m.userId);
  const availableMembers = allUsers.filter((u) => !usedMemberIds.includes(u.id));

  return (
    <Box sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Team Assignment
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Assigned Teams Section */}
          <Box mb={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                Assigned Teams
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setTeamDialogOpen(true)}
                disabled={availableTeams.length === 0}
              >
                Add Team
              </Button>
            </Box>

            {projectTeams.length === 0 ? (
              <Typography color="textSecondary">No teams assigned yet</Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {projectTeams.map((team) => (
                  <Chip
                    key={team.teamId}
                    label={team.name}
                    onDelete={() => handleRemoveTeam(team.teamId)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Team Members Section */}
          {projectTeams.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  Team Members
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setMemberDialogOpen(true)}
                  disabled={projectTeams.length === 0}
                >
                  Add Member
                </Button>
              </Box>

              {projectTeamMembers.length === 0 ? (
                <Typography color="textSecondary">No members assigned yet</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projectTeamMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.name}</TableCell>
                          <TableCell>{member.teamName}</TableCell>
                          <TableCell>{member.positionName || '-'}</TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveMember(member.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Team Dialog */}
      <Dialog open={teamDialogOpen} onClose={() => setTeamDialogOpen(false)}>
        <DialogTitle>Assign Team to Project</DialogTitle>
        <DialogContent sx={{ pt: 3, minWidth: 300, maxHeight: '60vh', overflow: 'auto' }}>
          <FormControl fullWidth>
            <InputLabel>Team</InputLabel>
            <Select
              value={selectedTeamId || ''}
              label="Team"
              onChange={(e) => setSelectedTeamId(Number(e.target.value))}
            >
              {availableTeams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAssignTeam}
            variant="contained"
            disabled={!selectedTeamId || loading}
          >
            {loading ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={memberDialogOpen} onClose={() => setMemberDialogOpen(false)}>
        <DialogTitle>Add Team Member to Project</DialogTitle>
        <DialogContent sx={{ pt: 3, minWidth: 350, maxHeight: '60vh', overflow: 'auto' }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Team</InputLabel>
            <Select
              value={selectedTeamForMembers || ''}
              label="Team"
              onChange={(e) => setSelectedTeamForMembers(Number(e.target.value))}
            >
              {projectTeams.map((team) => (
                <MenuItem key={team.teamId} value={team.teamId}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Member</InputLabel>
            <Select
              value={selectedMember || ''}
              label="Member"
              onChange={(e) => setSelectedMember(Number(e.target.value))}
            >
              {availableMembers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Position (Optional)</InputLabel>
            <Select
              value={selectedPosition || ''}
              label="Position (Optional)"
              onChange={(e) => setSelectedPosition(e.target.value ? Number(e.target.value) : null)}
            >
              <MenuItem value="">No Position</MenuItem>
              {selectedTeamPositions.map((position) => (
                <MenuItem key={position.id} value={position.id}>
                  {position.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAssignMember}
            variant="contained"
            disabled={!selectedMember || !selectedTeamForMembers || loading}
          >
            {loading ? 'Adding...' : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamAssignmentPanel;
