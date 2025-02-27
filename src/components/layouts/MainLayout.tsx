import React, { useState, useEffect } from 'react';
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
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Fade,
  useScrollTrigger,
  Fab,
  useMediaQuery,
  useTheme,
  Stack
} from '@mui/material';
import {
  Menu as MenuIcon,
  Pets as PetsIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  AddCircle as AddCircleIcon
} from '@mui/icons-material';

// Scroll to top button component
function ScrollTop() {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 99 }}
      >
        <Fab color="primary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </Box>
    </Fade>
  );
}

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeContext();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // States for user menu
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  
  // State for mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // State for scrolled header
  const [scrolled, setScrolled] = useState(false);
  
  // Track scroll position for header effects
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  // Handlers for user menu
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  // Handler for mobile drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Handler for logout
  const handleLogout = async () => {
    await signOut();
    handleCloseUserMenu();
  };
  
  // Mobile drawer content
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
        <PetsIcon sx={{ fontSize: 30, mr: 1, color: 'primary.main' }} />
        <Typography
          variant="h6"
          noWrap
          component={Link}
          href="/"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.2rem',
            color: 'primary.main',
            textDecoration: 'none',
          }}
        >
          PETRESCUE
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      {profile && (
        <Box sx={{ mb: 2, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar 
              alt={profile.name} 
              src={profile.profile_image || undefined}
              sx={{ width: 40, height: 40, mr: 1 }}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {profile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {profile.email}
              </Typography>
            </Box>
          </Box>
          <Divider />
        </Box>
      )}
      
      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            href="/" 
            selected={router.pathname === '/'} 
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Inicio" />
          </ListItemButton>
        </ListItem>
        
        {user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton 
                component={Link} 
                href="/dashboard" 
                selected={router.pathname === '/dashboard'} 
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Tablero" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton 
                component={Link} 
                href="/pets/create" 
                selected={router.pathname === '/pets/create'} 
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="Publicar Mascota" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton 
                component={Link} 
                href="/my-pets" 
                selected={router.pathname === '/my-pets'} 
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PetsIcon />
                </ListItemIcon>
                <ListItemText primary="Mis Publicaciones" />
              </ListItemButton>
            </ListItem>
            
            {isAdmin && (
              <ListItem disablePadding>
                <ListItemButton 
                  component={Link} 
                  href="/admin" 
                  selected={router.pathname.startsWith('/admin')} 
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <AdminIcon />
                  </ListItemIcon>
                  <ListItemText primary="Panel Admin" />
                </ListItemButton>
              </ListItem>
            )}
            
            <ListItem disablePadding>
              <ListItemButton 
                component={Link} 
                href="/profile" 
                selected={router.pathname === '/profile'} 
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Perfil" />
              </ListItemButton>
            </ListItem>
            
            <Divider sx={{ my: 1 }} />
            
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Cerrar Sesión" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton 
                component={Link} 
                href="/login" 
                selected={router.pathname === '/login'} 
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary="Iniciar Sesión" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton 
                component={Link} 
                href="/register" 
                selected={router.pathname === '/register'} 
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Registrarse" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <AppBar 
        position="sticky" 
        elevation={scrolled ? 4 : 0}
        sx={{ 
          transition: 'all 0.3s',
          boxShadow: scrolled ? theme.shadows[4] : 'none',
          backgroundColor: scrolled 
            ? (darkMode ? 'rgba(30, 30, 47, 0.95)' : 'rgba(63, 81, 181, 0.95)') 
            : (darkMode ? '#1e1e2f' : '#3f51b5'),
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo for desktop */}
            <PetsIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              PETRESCUE
            </Typography>
            
            {/* Menu button for mobile */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>
            
            {/* Logo for mobile */}
            <PetsIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component={Link}
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              PETRESCUE
            </Typography>
            
            {/* Navigation buttons for desktop */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              <Button
                component={Link}
                href="/"
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'block',
                  mx: 0.5,
                  opacity: router.pathname === '/' ? 1 : 0.8,
                  '&:hover': { opacity: 1 },
                }}
              >
                Inicio
              </Button>
              
              {user && (
                <>
                  <Button
                    component={Link}
                    href="/dashboard"
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'block',
                      mx: 0.5,
                      opacity: router.pathname === '/dashboard' ? 1 : 0.8,
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    Tablero
                  </Button>
                  
                  <Button
                    component={Link}
                    href="/pets/create"
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'block',
                      mx: 0.5,
                      opacity: router.pathname === '/pets/create' ? 1 : 0.8,
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    Publicar Mascota
                  </Button>
                  
                  <Button
                    component={Link}
                    href="/my-pets"
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'block',
                      mx: 0.5,
                      opacity: router.pathname === '/my-pets' ? 1 : 0.8,
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    Mis Publicaciones
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      component={Link}
                      href="/admin"
                      sx={{ 
                        my: 2, 
                        color: 'white', 
                        display: 'block',
                        mx: 0.5,
                        opacity: router.pathname.startsWith('/admin') ? 1 : 0.8,
                        '&:hover': { opacity: 1 },
                      }}
                    >
                      Panel Admin
                    </Button>
                  )}
                </>
              )}
            </Box>
            
            {/* Add a floating action button for mobile to add a pet */}
            {user && isMobile && (
              <Tooltip title="Publicar nueva mascota">
                <Fab
                  component={Link}
                  href="/pets/create"
                  color="secondary"
                  aria-label="add pet"
                  sx={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1000 }}
                >
                  <AddCircleIcon />
                </Fab>
              </Tooltip>
            )}
            
            {/* Theme toggle button */}
            <IconButton
              color="inherit"
              onClick={toggleDarkMode}
              sx={{ ml: 1 }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            {/* User menu */}
            <Box sx={{ flexGrow: 0 }}>
              {user ? (
                <>
                  <Tooltip title="Opciones de usuario">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
                      <Avatar 
                        alt={profile?.name} 
                        src={profile?.profile_image || undefined}
                        sx={{ 
                          width: 40, 
                          height: 40,
                          border: '2px solid #fff' 
                        }}
                      >
                        {profile?.name.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {profile?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {profile?.email}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem component={Link} href="/profile" onClick={handleCloseUserMenu}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <Typography textAlign="center">Mi Perfil</Typography>
                    </MenuItem>
                    {isAdmin && (
                      <MenuItem component={Link} href="/admin" onClick={handleCloseUserMenu}>
                        <ListItemIcon>
                          <AdminIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography textAlign="center">Panel de Admin</Typography>
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <Typography textAlign="center">Cerrar Sesión</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                  <Button
                    component={Link}
                    href="/login"
                    sx={{ color: 'white', mx: 1 }}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    component={Link}
                    href="/register"
                    variant="contained"
                    color="secondary"
                    sx={{ mx: 1 }}
                  >
                    Registrarse
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Main content */}
      <Container 
        component="main" 
        maxWidth="lg" 
        sx={{ 
          mt: { xs: 2, md: 4 }, 
          mb: { xs: 2, md: 4 },
          flexGrow: 1,  // Allow main content to grow and push footer down
          pt: { xs: 2, md: 0 }
        }}
      >
        {children}
      </Container>
      
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) => 
            theme.palette.mode === 'light' 
              ? theme.palette.grey[200] 
              : theme.palette.grey[900],
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center">
              <PetsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" color="text.primary">
                Pet Rescue
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} PetRescue. Todos los derechos reservados.
            </Typography>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                component={Link}
                href="/"
                size="small"
              >
                Inicio
              </Button>
              <IconButton
                color="primary"
                onClick={toggleDarkMode}
                size="small"
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>
      
      {/* Scroll to top button */}
      <ScrollTop />
    </Box>
  );
};

export default MainLayout;
