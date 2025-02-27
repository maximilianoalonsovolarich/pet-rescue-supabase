import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
  Chip,
  Menu,
  MenuItem,
  Breadcrumbs,
  Fade,
  Paper
} from '@mui/material';
import {
  Menu as MenuIcon,
  Pets as PetsIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  ChevronRight as ChevronRightIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const drawerWidth = 280;

// Helper to generate page title based on current path
const getPageTitle = (pathname: string) => {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname === '/admin/pets') return 'Gestión de Publicaciones';
  if (pathname === '/admin/users') return 'Gestión de Usuarios';
  return 'Panel de Administración';
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeContext();
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Current page title
  const pageTitle = getPageTitle(router.pathname);
  
  // Handler for mobile drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Handler for logout
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };
  
  // User menu handlers
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };
  
  // Drawer content
  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: 'primary.dark',
        color: 'white'
      }}>
        <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
          {profile?.name?.charAt(0).toUpperCase() || 'A'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" noWrap>
            {profile?.name || 'Administrador'}
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.7)">
            Panel de Administración
          </Typography>
        </Box>
      </Box>
      <Divider />
      
      <Box sx={{ px: 2, py: 3 }}>
        <Chip 
          icon={<PetsIcon />} 
          label="Pet Rescue"
          color="primary"
          component={Link}
          href="/"
          sx={{ 
            width: '100%', 
            justifyContent: 'flex-start',
            mb: 3,
            '& .MuiChip-label': {
              fontWeight: 600
            }
          }}
        />
      </Box>
      
      <List sx={{ px: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            href="/admin"
            selected={router.pathname === '/admin'}
            sx={{ 
              borderRadius: 2,
              mb: 1,
              backgroundColor: router.pathname === '/admin' ? 
                (darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)') : 'transparent'
            }}
            onClick={isSmallScreen ? handleDrawerToggle : undefined}
          >
            <ListItemIcon>
              <DashboardIcon color={router.pathname === '/admin' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Dashboard" 
              primaryTypographyProps={{ 
                fontWeight: router.pathname === '/admin' ? 600 : 400
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            href="/admin/pets"
            selected={router.pathname === '/admin/pets'}
            sx={{ 
              borderRadius: 2,
              mb: 1,
              backgroundColor: router.pathname === '/admin/pets' ? 
                (darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)') : 'transparent'
            }}
            onClick={isSmallScreen ? handleDrawerToggle : undefined}
          >
            <ListItemIcon>
              <PetsIcon color={router.pathname === '/admin/pets' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Publicaciones" 
              primaryTypographyProps={{ 
                fontWeight: router.pathname === '/admin/pets' ? 600 : 400
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            href="/admin/users"
            selected={router.pathname === '/admin/users'}
            sx={{ 
              borderRadius: 2,
              mb: 1,
              backgroundColor: router.pathname === '/admin/users' ? 
                (darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)') : 'transparent'
            }}
            onClick={isSmallScreen ? handleDrawerToggle : undefined}
          >
            <ListItemIcon>
              <PeopleIcon color={router.pathname === '/admin/users' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Usuarios" 
              primaryTypographyProps={{ 
                fontWeight: router.pathname === '/admin/users' ? 600 : 400
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <List sx={{ px: 2 }}>
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            href="/"
            sx={{ borderRadius: 2, mb: 1 }}
            onClick={isSmallScreen ? handleDrawerToggle : undefined}
          >
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Volver al inicio" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => {
              handleLogout();
              if (isSmallScreen) handleDrawerToggle();
            }}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Box sx={{ p: 2, mt: 2 }}>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(63, 81, 181, 0.05)',
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            ¿Necesitas ayuda?
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, fontSize: '0.8rem' }}>
            Accede a la documentación para administradores.
          </Typography>
          <Chip 
            label="Ver guía de admin" 
            size="small" 
            color="primary" 
            sx={{ width: '100%' }}
            component={Link}
            href="#"
          />
        </Paper>
      </Box>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: darkMode ? '#1e1e2f' : theme.palette.primary.main,
          boxShadow: darkMode ? '0 4px 20px 0 rgba(0,0,0,0.14)' : theme.shadows[4]
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="abrir drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/admin"
            sx={{
              mr: 2,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
            }}
          >
            <PetsIcon sx={{ mr: 1 }} />
            PANEL ADMIN
          </Typography>
          
          {/* Display only on mobile */}
          <Typography
            variant="subtitle1"
            noWrap
            sx={{
              display: { xs: 'block', sm: 'none' },
              flexGrow: 1,
              fontWeight: 600
            }}
          >
            {pageTitle}
          </Typography>
          
          <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            <Breadcrumbs 
              separator={<ChevronRightIcon fontSize="small" />} 
              aria-label="breadcrumb"
              sx={{ color: 'white' }}
            >
              <Typography color="inherit" component={Link} href="/admin" sx={{ textDecoration: 'none', color: 'inherit' }}>
                Admin
              </Typography>
              {router.pathname !== '/admin' && (
                <Typography color="inherit">{pageTitle}</Typography>
              )}
            </Breadcrumbs>
          </Box>
          
          {/* Theme toggle button */}
          <IconButton
            color="inherit"
            onClick={toggleDarkMode}
            sx={{ ml: 1 }}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Notification icon */}
          <Tooltip title="Notificaciones">
            <IconButton color="inherit" sx={{ ml: 1 }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User menu */}
          <Tooltip title="Opciones de usuario">
            <IconButton
              onClick={handleOpenUserMenu}
              sx={{ ml: 1 }}
            >
              <Avatar
                alt={profile?.name || 'Admin'}
                src={profile?.profile_image}
                sx={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.8)' }}
              >
                {profile?.name?.charAt(0).toUpperCase() || 'A'}
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleCloseUserMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            TransitionComponent={Fade}
          >
            <Box sx={{ px: 2, py: 1, width: 220 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {profile?.name || 'Administrador'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {profile?.email || 'admin@example.com'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem component={Link} href="/profile" onClick={handleCloseUserMenu}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <Typography>Mi Perfil</Typography>
            </MenuItem>
            <MenuItem component={Link} href="/" onClick={handleCloseUserMenu}>
              <ListItemIcon>
                <HomeIcon fontSize="small" />
              </ListItemIcon>
              <Typography>Volver al sitio</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <Typography>Cerrar Sesión</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            backgroundColor: darkMode ? '#27293d' : theme.palette.background.paper,
            color: darkMode ? 'white' : 'inherit',
            borderRight: darkMode ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${theme.palette.divider}`,
            zIndex: (theme) => theme.zIndex.drawer
          },
        }}
        open
      >
        <Toolbar />
        {drawer}
      </Drawer>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            backgroundColor: darkMode ? '#27293d' : theme.palette.background.paper,
            color: darkMode ? 'white' : 'inherit',
            zIndex: (theme) => theme.zIndex.drawer + 2
          },
        }}
      >
        <Toolbar />
        {drawer}
      </Drawer>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 3 }, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: darkMode ? '#1e1e2f' : theme.palette.background.default,
          minHeight: '100vh',
          color: darkMode ? 'white' : 'inherit',
          marginTop: '64px'
        }}
      >
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminLayout;
