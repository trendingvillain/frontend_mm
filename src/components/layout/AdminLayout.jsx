import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu,
  Dashboard,
  People,
  Store,
  AttachMoney,
  ShoppingCart,
  Help,
  Logout,
  ChevronLeft
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const drawerWidth = 240;

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogout } = useAdminAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Products', icon: <Store />, path: '/admin/products' },
    { text: 'Prices', icon: <AttachMoney />, path: '/admin/prices' },
    { text: 'Orders', icon: <ShoppingCart />, path: '/admin/orders' },
    { text: 'Inquiries', icon: <Help />, path: '/admin/inquiries' },
    { text: 'AdminGallery', icon: <Help />, path: '/admin/gallery' },
    
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          Admin Panel
        </Typography>
        {isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ ml: 'auto', color: 'white' }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) handleDrawerToggle();
              }}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.contrastText' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          display: { md: 'none' }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, md: 0 }
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;