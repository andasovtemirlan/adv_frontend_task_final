import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
} from '@mui/material';
import {
  Dashboard,
  Folder,
  Assignment,
  People,
  Timeline,
  PersonAdd,
  EventNote,
  Schedule,
  Assessment,
  Search,
  ShowChart,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { memo, useCallback } from 'react';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Projects', icon: <Folder />, path: '/projects' },
  { text: 'Tasks', icon: <Assignment />, path: '/tasks' },
  { text: 'Teams', icon: <People />, path: '/teams' },
  { text: 'Members', icon: <PersonAdd />, path: '/members' },
  { text: 'Activity', icon: <Timeline />, path: '/activity' },
  { text: 'Calendar', icon: <EventNote />, path: '/calendar' },
  { text: 'Time Tracking', icon: <Schedule />, path: '/tracking' },
  { text: 'Reports', icon: <Assessment />, path: '/reports' },
  { text: 'Search', icon: <Search />, path: '/search' },
  { text: 'Gantt Chart', icon: <ShowChart />, path: '/gantt' },
];

/**
 * Sidebar navigation component - Optimized with React.memo
 */
const Sidebar = memo(({ open, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
      onClose();
    },
    [navigate, onClose]
  );

  const drawerContent = (
    <Box>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer - right anchor */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: DRAWER_WIDTH,
            zIndex: 1200,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer - positioned right */}
      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: DRAWER_WIDTH,
            position: 'fixed',
            right: 0,
            top: 0,
            zIndex: 1100,
            height: '100vh',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
