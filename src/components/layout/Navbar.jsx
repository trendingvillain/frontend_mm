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
  ShoppingBasketOutlined, 
  PersonOutlined,
  LoginOutlined,
  HowToRegOutlined,
  HomeOutlined // Icon for Home
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from './../../logo.png';

const drawerWidth = 260;

// --- THEME CUSTOMIZATION ---
const ACCENT_GOLD = '#BF8A00'; 
const PRIMARY_BLACK = '#121212'; 

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.background.paper, 
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  borderBottom: `2px solid ${ACCENT_GOLD}`, 
}));

const Logo = styled('img')({
  width: 50,
  height: 50,
  marginRight: 12,
  filter: 'brightness(0.9) contrast(1.1)', 
});

const DesktopNavLink = styled(Button)(({ theme }) => ({
  textTransform: 'uppercase',
  fontWeight: 700,
  fontSize: '0.95rem',
  color: PRIMARY_BLACK,
  padding: theme.spacing(1, 1.5),
  '&:hover': {
    color: ACCENT_GOLD,
    backgroundColor: 'transparent',
  },
  '&.Mui-selected': {
    color: ACCENT_GOLD,
    borderBottom: `2px solid ${ACCENT_GOLD}`,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
}));
// --- END THEME CUSTOMIZATION ---


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
  
  const handleDrawerHeaderClick = () => {
    navigate('/');
    handleDrawerToggle();
  };

  // --- START: Updated menuItems array ---
  const baseMenuItems = [
    { text: 'Home', icon: <HomeOutlined />, path: '/' }, // EXPLICIT HOME LINK ADDED
    { text: 'Products', icon: <Storefront />, path: '/products' },
  ];

  const authMenuItems = isAuthenticated
    ? [
      { text: 'Orders', icon: <Receipt />, path: '/orders' },
      { text: 'Inquiries', icon: <Help />, path: '/inquiry' },
      { text: 'Cart', icon: <ShoppingBasketOutlined />, path: '/cart', badge: cartCount }, 
      { text: 'Profile', icon: <PersonOutlined />, path: '/profile' }, 
    ]
    : [
      { text: 'Login', icon: <LoginOutlined />, path: '/login' },
      { text: 'Register', icon: <HowToRegOutlined />, path: '/register' }
    ];

  const menuItems = [...baseMenuItems, ...authMenuItems];
  // --- END: Updated menuItems array ---

  // Drawer for mobile
  const drawer = (
    <Box>
      {/* Mobile Drawer Header - Sivanthi Banana Export (Corrected) */}
      <Toolbar sx={{ backgroundColor: PRIMARY_BLACK, color: 'white', padding: 0 }}>
        <Box 
            onClick={handleDrawerHeaderClick} // Click navigates to Home (/) and closes drawer
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexGrow: 1, 
                cursor: 'pointer', 
                paddingLeft: 2 
            }}
        >
            <Logo src={logo} alt="Sivanthi Banana Export Logo" /> 
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Sivanthi Banana Export
            </Typography>
        </Box>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ color: ACCENT_GOLD, marginRight: 1 }}
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
              sx={{ '&.Mui-selected': { bgcolor: `${ACCENT_GOLD}20`, color: PRIMARY_BLACK },
                    '&.Mui-selected .MuiListItemIcon-root': { color: ACCENT_GOLD }
                }} 
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? ACCENT_GOLD : 'text.secondary' }}>
                {item.badge !== undefined && item.text === 'Cart' ? (
                  <Badge badgeContent={item.badge} 
                         sx={{ 
                            "& .MuiBadge-badge": { backgroundColor: ACCENT_GOLD, color: PRIMARY_BLACK } 
                         }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ fontWeight: 600 }} />
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
              mr: { xs: 1, md: 4 }
            }}
            // Desktop logo click handler
            onClick={() => navigate(isAuthenticated ? '/products' : '/')}
          >
            <Logo src={logo} alt="Sivanthi Banana Export Logo" />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: PRIMARY_BLACK,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                // Display the full name here for both mobile (small screens) and desktop
                display: { xs: 'block', sm: 'block' } 
              }}
            >
              SIVANTHI BANANA EXPORT
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          
          {isMobile ? (
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ color: PRIMARY_BLACK }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            // Desktop layout with top navbar
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* Render Desktop Navigation Links */}
              {menuItems.map((item) => {
                // Hide Cart and Profile icon links from the main desktop navigation bar
                if (item.path === '/cart' || item.path === '/profile') return null;
                
                // Handle Home Link separately to use DesktopNavLink style
                if (item.path === '/') {
                  return (
                    <DesktopNavLink
                      key="home"
                      onClick={() => navigate('/')}
                      className={location.pathname === '/' ? 'Mui-selected' : ''}
                    >
                      Home
                    </DesktopNavLink>
                  );
                }

                return (
                  <DesktopNavLink
                    key={item.text}
                    onClick={() => navigate(item.path)}
                    className={location.pathname.startsWith(item.path) && item.path !== '/' ? 'Mui-selected' : ''}
                  >
                    {item.text}
                  </DesktopNavLink>
                );
              })}
              
              {/* Render Auth/Utility Icons */}
              {isAuthenticated && (
                <>
                  <IconButton 
                    onClick={() => navigate('/cart')} 
                    sx={{ color: PRIMARY_BLACK, '&:hover': { color: ACCENT_GOLD } }}
                  >
                    <Badge 
                      badgeContent={cartCount} 
                      sx={{ "& .MuiBadge-badge": { backgroundColor: ACCENT_GOLD, color: PRIMARY_BLACK } }}
                    >
                      <ShoppingCart />
                    </Badge>
                  </IconButton>
                  
                  <IconButton 
                    onClick={handleProfileMenuOpen} 
                    sx={{ color: PRIMARY_BLACK, '&:hover': { color: ACCENT_GOLD } }}
                  >
                    <AccountCircle />
                  </IconButton>
                  
                  {/* Profile Menu */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    sx={{ mt: 1 }}
                  >
                    <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                      <ListItemIcon sx={{ color: PRIMARY_BLACK }}>
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
