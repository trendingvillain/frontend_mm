import React, { useState, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  styled,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart,
  AccountCircle,
  Storefront,
  Receipt,
  Help,
  Logout,
  ChevronLeft,
  Dashboard as DashboardIcon,
  ShoppingBasketOutlined,
  PersonOutlined,
  LoginOutlined,
  HowToRegOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from './../../logo.png';

const drawerWidth = 260;

// Styled components for a cleaner look
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.background.paper,
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Logo = styled('img')({
  width: 50,
  height: 50,
  marginRight: 12,
});

const DesktopNavLink = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  color: theme.palette.text.primary,
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
}));

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const cartItems = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e);
      return [];
    }
  }, []);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  const menuItems = isAuthenticated
    ? [
      { text: 'Products', icon: <Storefront />, path: '/products' },
      { text: 'Orders', icon: <Receipt />, path: '/orders' },
      { text: 'Inquiries', icon: <Help />, path: '/inquiry' },
      { text: 'Cart', icon: <ShoppingCart />, path: '/cart', badge: cartCount },
      { text: 'Profile', icon: <AccountCircle />, path: '/profile' },
    ]
    : [
      { text: 'Products', icon: <Storefront />, path: '/products' },
      { text: 'Login', icon: <LoginOutlined />, path: '/login' },
      { text: 'Register', icon: <HowToRegOutlined />, path: '/register' }
    ];

  // Drawer for mobile
  const drawer = (
    <Box>
      <Toolbar sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        <Logo src={logo} alt="Sivanthi Banana Export Logo" />
        <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
          Sivanthi Banana Export
        </Typography>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ color: 'white' }}
        >
          <ChevronLeft />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                handleDrawerToggle();
              }}
              sx={{ '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main' } }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'text.secondary' }}>
                {item.badge !== undefined && item.text === 'Cart' ? (
                  <Badge badgeContent={item.badge} color="primary">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {isAuthenticated && (
        <>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon><Logout color="error" /></ListItemIcon>
                <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar position="fixed">
        <Toolbar>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              mr: { xs: 2, md: 4 }
            }}
            onClick={() => navigate(isAuthenticated ? '/product' : '/')}
          >
            <Logo src={logo} alt="Sivanthi Banana Export Logo" />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                display: { xs: 'block', sm: 'block' }
              }}
            >
              Sivanthi Banana Export
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          {isMobile ? (
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            // Desktop layout with top navbar
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DesktopNavLink
                key="home"
                onClick={() => navigate('/')}
                className={location.pathname === '/' ? 'Mui-selected' : ''}
              >
                Home
              </DesktopNavLink>
              {menuItems.map((item) => {
                if (item.path === '/cart' || item.path === '/profile') return null;
                return (
                  <DesktopNavLink
                    key={item.text}
                    onClick={() => navigate(item.path)}
                    className={location.pathname === item.path ? 'Mui-selected' : ''}
                  >
                    {item.text}
                  </DesktopNavLink>
                );
              })}
              {isAuthenticated && (
                <>
                  <IconButton onClick={() => navigate('/cart')} sx={{ color: 'text.primary' }}>
                    <Badge badgeContent={cartCount} color="primary" showZero>
                      <ShoppingCart />
                    </Badge>
                  </IconButton>
                  <IconButton onClick={handleProfileMenuOpen} sx={{ color: 'text.primary' }}>
                    <AccountCircle />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    sx={{ mt: 1 }}
                  >
                    <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                      <ListItemIcon>
                        <PersonOutlined fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Profile" />
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <Logout fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </StyledAppBar>
      {/* Mobile Drawer */}
      <nav>
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
      </nav>
      {/* Outlet to render child components */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: { xs: 7, md: 8 } }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Navbar;
