import { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { loginUser } from '@/features/auth/authSlice';
import { validateEmail, validatePassword } from '@/shared/utils/validators';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Login and Registration page component
 */
const LoginPage = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Login state
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regErrors, setRegErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleLoginSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoginError('');

      // Validate
      const emailError = validateEmail(email);
      const passwordError = validatePassword(password);

      if (emailError || passwordError) {
        setErrors({
          email: emailError || undefined,
          password: passwordError || undefined,
        });
        return;
      }

      setErrors({});
      setLoading(true);

      try {
        const result = await dispatch(loginUser({ email, password }));
        if (loginUser.fulfilled.match(result)) {
          navigate(from, { replace: true });
        } else {
          setLoginError('Invalid email or password');
        }
      } catch (error) {
        setLoginError('An error occurred during login');
      } finally {
        setLoading(false);
      }
    },
    [email, password, dispatch, navigate, from]
  );

  const handleRegisterSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setRegError('');

      // Validate
      const nameError = !regName.trim() ? 'Name is required' : '';
      const emailError = validateEmail(regEmail);
      const passwordError = validatePassword(regPassword);
      const confirmError = regPassword !== regConfirmPassword ? 'Passwords do not match' : '';

      if (nameError || emailError || passwordError || confirmError) {
        setRegErrors({
          name: nameError || undefined,
          email: emailError || undefined,
          password: passwordError || undefined,
          confirmPassword: confirmError || undefined,
        });
        return;
      }

      setRegErrors({});
      setRegLoading(true);

      try {
        const response = await fetch('http://localhost:3001/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setRegError(errorData.error || 'Registration failed');
          return;
        }

        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        navigate(from, { replace: true });
      } catch (error) {
        setRegError('An error occurred during registration');
      } finally {
        setRegLoading(false);
      }
    },
    [regName, regEmail, regPassword, regConfirmPassword, navigate, from]
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setLoginError('');
    setRegError('');
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        p: 2,
      }}
    >
      <Paper sx={{ p: 0, maxWidth: 450, width: '100%', borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Project Manager
          </Typography>
          <Typography variant="body2">Manage your projects efficiently</Typography>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="login register tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Login" id="auth-tab-0" aria-controls="auth-tabpanel-0" sx={{ flex: 1 }} />
          <Tab label="Register" id="auth-tab-1" aria-controls="auth-tabpanel-1" sx={{ flex: 1 }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Login Tab */}
          <TabPanel value={tabValue} index={0}>
            {loginError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLoginSubmit} noValidate>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                margin="normal"
                autoComplete="email"
                autoFocus
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                margin="normal"
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Demo: admin@example.com / admin123
              </Typography>
            </Box>
          </TabPanel>

          {/* Register Tab */}
          <TabPanel value={tabValue} index={1}>
            {regError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {regError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleRegisterSubmit} noValidate>
              <TextField
                fullWidth
                label="Full Name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                error={!!regErrors.name}
                helperText={regErrors.name}
                margin="normal"
                autoFocus
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                error={!!regErrors.email}
                helperText={regErrors.email}
                margin="normal"
                autoComplete="email"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                error={!!regErrors.password}
                helperText={regErrors.password}
                margin="normal"
                autoComplete="new-password"
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                error={!!regErrors.confirmPassword}
                helperText={regErrors.confirmPassword}
                margin="normal"
                autoComplete="new-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={regLoading}
              >
                {regLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
              Passwords must be at least 6 characters
            </Typography>
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
