import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useState, useCallback, useMemo } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '@/theme';
import { STORAGE_KEYS } from '@/shared/utils/constants';

/**
 * Main application layout with header, sidebar, and content area
 */
const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    return (saved as 'light' | 'dark') || 'light';
  });

  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleThemeToggle = useCallback(() => {
    setThemeMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, newMode);
      return newMode;
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Header
          onMenuClick={handleDrawerToggle}
          themeMode={themeMode}
          onThemeToggle={handleThemeToggle}
        />
        <Sidebar open={mobileOpen} onClose={handleDrawerClose} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            marginLeft: { xs: 0, sm: '240px' },
            transition: 'margin 0.3s ease-in-out',
          }}
        >
          <Toolbar /> {/* Spacer for fixed header */}
          <Box
            sx={{
              flexGrow: 1,
              bgcolor: 'background.default',
              overflow: 'auto',
              width: '100%',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AppLayout;
