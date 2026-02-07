import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useGetUsersQuery } from '@/store/api';
import { validateEmail, validatePassword } from '@/shared/utils/validators';

const MembersPage = () => {
  const { data: users = [], isLoading, refetch } = useGetUsersQuery();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading_, setIsLoading_] = useState(false);

  const handleOpenDialog = useCallback((user?: any) => {
    if (user) {
      setEditingUserId(user.id);
      setFormData({ name: user.name, email: user.email, password: '' });
    } else {
      setEditingUserId(null);
      setFormData({ name: '', email: '', password: '' });
    }
    setOpenDialog(true);
    setError(null);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingUserId(null);
    setFormData({ name: '', email: '', password: '' });
    setErrors({});
    setError(null);
  }, []);

  const handleSave = useCallback(async () => {
    // Validate
    const nameError = !formData.name.trim() ? 'Name is required' : '';
    const emailError = validateEmail(formData.email);
    const passwordError = !editingUserId && !formData.password ? 'Password is required for new users' : validatePassword(formData.password);

    if (nameError || emailError || passwordError) {
      setErrors({
        name: nameError || undefined,
        email: emailError || undefined,
        password: passwordError || undefined,
      });
      return;
    }

    setErrors({});
    setIsLoading_(true);

    try {
      if (editingUserId) {
        // Update existing user
        const response = await fetch(`http://localhost:3001/users/${editingUserId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            ...(formData.password && { password: formData.password }),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to update user');
          return;
        }
      } else {
        // Create new user
        const response = await fetch('http://localhost:3001/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to create user');
          return;
        }
      }

      refetch();
      handleCloseDialog();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading_(false);
    }
  }, [formData, editingUserId, refetch, handleCloseDialog]);

  const handleDelete = useCallback(async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setIsLoading_(true);
    try {
      const response = await fetch(`http://localhost:3001/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete user');
        return;
      }

      refetch();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading_(false);
    }
  }, [refetch]);

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 4, height: '100%', overflow: 'auto' }}>
      <Box mb={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Members</Typography>
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            Add Member
          </Button>
        </Box>
        <Typography variant="body1" color="textSecondary">Manage all team members and users in the system.</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">No members yet. Create one to get started.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                      color="primary"
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user.id)}
                      color="error"
                      title="Delete"
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUserId ? 'Edit Member' : 'Add New Member'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            margin="normal"
            autoFocus
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
          />
          <TextField
            fullWidth
            label={editingUserId ? 'New Password (leave blank to keep current)' : 'Password'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={!!errors.password}
            helperText={errors.password}
            margin="normal"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={isLoading_}>
            {isLoading_ ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MembersPage;
