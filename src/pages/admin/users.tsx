import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/supabase';
import AdminLayout from '@/components/layouts/AdminLayout';
import AuthMiddleware from '@/middlewares/AuthMiddleware';
import { formatDate } from '@/utils/helpers';
import Image from 'next/image';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  FormControlLabel,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  SupervisorAccount as AdminIcon,
  PersonOff as BanIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface AdminUsersProps {
  initialUsers: Profile[];
  error?: string;
}

export default function AdminUsers({ initialUsers, error: serverError }: AdminUsersProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for users and pagination
  const [users, setUsers] = useState<Profile[]>(initialUsers || []);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>(initialUsers || []);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for loading and error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(serverError || '');
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for dialogs
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [userToToggleAdmin, setUserToToggleAdmin] = useState<Profile | null>(null);
  
  // Apply search filter when it changes
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(users.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term) ||
        (user.phone && user.phone.toLowerCase().includes(term))
      ));
    } else {
      setFilteredUsers(users);
    }
    
    setPage(0); // Reset to first page when search changes
  }, [searchTerm, users]);
  
  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUsers(data);
      setFilteredUsers(searchTerm ? filteredUsers : data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Error al cargar los usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle admin toggle
  const handleAdminToggle = (user: Profile) => {
    setUserToToggleAdmin(user);
    setAdminDialogOpen(true);
  };
  
  const handleConfirmAdminToggle = async () => {
    if (!userToToggleAdmin) return;
    
    try {
      setLoading(true);
      
      const newValue = !userToToggleAdmin.is_admin;
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: newValue })
        .eq('id', userToToggleAdmin.id);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userToToggleAdmin.id 
          ? { ...user, is_admin: newValue } 
          : user
      ));
      
      setAdminDialogOpen(false);
      setUserToToggleAdmin(null);
    } catch (err: any) {
      console.error('Error updating user admin status:', err);
      setError('Error al actualizar el estado de administrador: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Get stats for summary cards
  const stats = {
    total: users.length,
    admins: users.filter(user => user.is_admin).length,
    withPhone: users.filter(user => user.phone).length,
    recent: users.filter(user => {
      const date = new Date(user.created_at);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return date > oneMonthAgo;
    }).length,
  };

  return (
    <AuthMiddleware adminOnly>
      <AdminLayout>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            Gestión de Usuarios
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Administra todos los usuarios de la plataforma
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}
          
          {/* Stats summary */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderColor: 'primary.main'
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Usuarios
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderColor: 'secondary.main'
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Administradores
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    {stats.admins}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderColor: 'info.main'
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Con Teléfono
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {stats.withPhone}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderColor: 'success.main'
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Registrados (Último mes)
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.recent}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Search filter */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Buscar por nombre, email o teléfono"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchUsers}
                  disabled={loading}
                  fullWidth
                >
                  Actualizar Lista
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Users table */}
          <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <WarningIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No se encontraron usuarios
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Intenta cambiar los términos de búsqueda
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow
                        sx={{
                          '& th': {
                            fontWeight: 'bold',
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                          }
                        }}
                      >
                        <TableCell>Usuario</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Teléfono</TableCell>
                        <TableCell>Fecha Registro</TableCell>
                        <TableCell>Último Login</TableCell>
                        <TableCell>Admin</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((user) => (
                          <TableRow
                            key={user.id}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                  sx={{ 
                                    width: 40, 
                                    height: 40, 
                                    mr: 2, 
                                    bgcolor: user.is_admin ? 'secondary.main' : 'primary.main' 
                                  }}
                                  src={user.profile_image 
                                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-images/${user.profile_image}`
                                    : undefined
                                  }
                                >
                                  {user.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2">
                                    {user.name}
                                  </Typography>
                                  {user.is_admin && (
                                    <Chip
                                      label="Admin"
                                      color="secondary"
                                      size="small"
                                      sx={{ height: 20 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmailIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                <Typography variant="body2">
                                  {user.email}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {user.phone ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                  <Typography variant="body2">
                                    {user.phone}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No disponible
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                <Typography variant="body2">
                                  {formatDate(user.created_at)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {user.last_login ? (
                                formatDate(user.last_login, true)
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Nunca
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={user.is_admin}
                                    onChange={() => handleAdminToggle(user)}
                                    color="secondary"
                                  />
                                }
                                label=""
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Editar Usuario">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  disabled
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Banear Usuario">
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled
                                >
                                  <BanIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredUsers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
              </>
            )}
          </Paper>
          
          {/* Admin toggle dialog */}
          <Dialog
            open={adminDialogOpen}
            onClose={() => setAdminDialogOpen(false)}
          >
            <DialogTitle>Cambiar permisos de administrador</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {userToToggleAdmin?.is_admin
                  ? `¿Estás seguro que deseas quitar los permisos de administrador a ${userToToggleAdmin?.name}?`
                  : `¿Estás seguro que deseas dar permisos de administrador a ${userToToggleAdmin?.name}?`
                }
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAdminDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleConfirmAdminToggle} 
                color={userToToggleAdmin?.is_admin ? 'error' : 'primary'} 
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Confirmar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AdminLayout>
    </AuthMiddleware>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerSupabaseClient();
  
  // Check if user is authenticated on the server
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // If no session, redirect to login
  if (!session) {
    return {
      redirect: {
        destination: '/login?redirectTo=/admin/users',
        permanent: false,
      },
    };
  }
  
  // Check if the user is an admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();
  
  if (profileError || !profile?.is_admin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  
  try {
    // Get all users
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return {
      props: {
        initialUsers: data,
      },
    };
  } catch (error: any) {
    console.error('Error fetching users for admin:', error.message);
    
    return {
      props: {
        initialUsers: [],
        error: 'Error al cargar los usuarios. Por favor intenta de nuevo más tarde.'
      },
    };
  }
};
