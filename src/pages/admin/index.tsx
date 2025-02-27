import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/layouts/AdminLayout';
import AuthMiddleware from '@/middlewares/AuthMiddleware';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  Pets as PetsIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarTodayIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Report as ReportIcon,
  PendingActions as PendingActionsIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

interface DashboardStats {
  total_pets: number;
  active_pets: number;
  total_users: number;
  active_users: number;
  total_views: number;
  pets_this_month: number;
  users_this_month: number;
  recent_status_changes: any[];
}

interface AdminDashboardProps {
  initialStats?: Partial<DashboardStats>;
  error?: string;
}

export default function AdminDashboard({ initialStats, error: serverError }: AdminDashboardProps) {
  const theme = useTheme();
  const [stats, setStats] = useState<Partial<DashboardStats>>(initialStats || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(serverError || '');
  
  // Fetch stats on mount
  useEffect(() => {
    if (!initialStats) {
      fetchStats();
    }
  }, [initialStats]);
  
  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get total pets
      const { data: totalPets, error: petsError } = await supabase
        .from('pets')
        .select('id', { count: 'exact' });
      
      if (petsError) throw petsError;
      
      // Get active pets
      const { data: activePets, error: activePetsError } = await supabase
        .from('pets')
        .select('id', { count: 'exact' })
        .eq('status', 'activo');
      
      if (activePetsError) throw activePetsError;
      
      // Get total users
      const { data: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });
      
      if (usersError) throw usersError;
      
      // Get pets created this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      const { data: petsThisMonth, error: petsThisMonthError } = await supabase
        .from('pets')
        .select('id', { count: 'exact' })
        .gte('created_at', firstDayOfMonth.toISOString());
      
      if (petsThisMonthError) throw petsThisMonthError;
      
      // Get users created this month
      const { data: usersThisMonth, error: usersThisMonthError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', firstDayOfMonth.toISOString());
      
      if (usersThisMonthError) throw usersThisMonthError;
      
      // Get total views
      const { data: petsViews, error: viewsError } = await supabase
        .from('pets')
        .select('views');
      
      if (viewsError) throw viewsError;
      
      const totalViews = petsViews?.reduce((sum, pet) => sum + (pet.views || 0), 0) || 0;
      
      // Get users who logged in this month
      const { data: activeUsers, error: activeUsersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('last_login', firstDayOfMonth.toISOString());
      
      if (activeUsersError) throw activeUsersError;
      
      // Set all stats
      setStats({
        total_pets: totalPets?.length || 0,
        active_pets: activePets?.length || 0,
        total_users: totalUsers?.length || 0,
        active_users: activeUsers?.length || 0,
        total_views: totalViews,
        pets_this_month: petsThisMonth?.length || 0,
        users_this_month: usersThisMonth?.length || 0,
      });
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
      setError('Error al cargar las estadísticas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthMiddleware adminOnly>
      <AdminLayout>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
            Panel de Administración
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : (
            <>
              {/* Main stats cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                      color: 'white',
                      borderRadius: 3,
                      boxShadow: 3
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PetsIcon sx={{ fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4" fontWeight="bold">{stats.total_pets || 0}</Typography>
                        <Typography variant="body2">Mascotas Publicadas</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        icon={<ArrowUpwardIcon fontSize="small" />} 
                        label={`${stats.pets_this_month || 0} este mes`}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.15)', 
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} lg={3}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      background: `linear-gradient(135deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
                      color: 'white',
                      borderRadius: 3,
                      boxShadow: 3
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4" fontWeight="bold">{stats.total_users || 0}</Typography>
                        <Typography variant="body2">Usuarios Registrados</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        icon={<ArrowUpwardIcon fontSize="small" />} 
                        label={`${stats.users_this_month || 0} este mes`}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.15)', 
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} lg={3}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      background: `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`,
                      color: 'white',
                      borderRadius: 3,
                      boxShadow: 3
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4" fontWeight="bold">{stats.active_pets || 0}</Typography>
                        <Typography variant="body2">Publicaciones Activas</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={`${Math.round(((stats.active_pets || 0) / (stats.total_pets || 1)) * 100)}% del total`}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.15)', 
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} lg={3}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      background: `linear-gradient(135deg, ${theme.palette.info.light}, ${theme.palette.info.main})`,
                      color: 'white',
                      borderRadius: 3,
                      boxShadow: 3
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VisibilityIcon sx={{ fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4" fontWeight="bold">{stats.total_views || 0}</Typography>
                        <Typography variant="body2">Vistas Totales</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={`${Math.round((stats.total_views || 0) / (stats.total_pets || 1))} por publicación`}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.15)', 
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
              
              {/* Additional data */}
              <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                  <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Actividad reciente
                    </Typography>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6, color: 'text.secondary' }}>
                      <Stack spacing={2} alignItems="center">
                        <PendingActionsIcon sx={{ fontSize: 60, opacity: 0.5 }} />
                        <Typography>
                          Los datos de actividad reciente se generarán conforme el uso de la plataforma aumente
                        </Typography>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          href="/admin/pets"
                        >
                          Ver publicaciones
                        </Button>
                      </Stack>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} lg={4}>
                  <Stack spacing={3}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        Usuarios activos
                      </Typography>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h3" fontWeight="bold" color="primary">
                          {stats.active_users || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Usuarios que han iniciado sesión este mes
                        </Typography>
                        
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                          {(stats.active_users || 0) > 0 && (stats.total_users || 0) > 0 && (
                            <Chip 
                              label={`${Math.round(((stats.active_users || 0) / (stats.total_users || 1)) * 100)}% de usuarios activos`}
                              color="primary"
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Paper>
                    
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        Acciones rápidas
                      </Typography>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      <Stack spacing={2}>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          fullWidth
                          href="/admin/pets"
                        >
                          Gestionar Publicaciones
                        </Button>
                        
                        <Button 
                          variant="outlined" 
                          color="secondary" 
                          fullWidth
                          href="/admin/users"
                        >
                          Gestionar Usuarios
                        </Button>
                      </Stack>
                    </Paper>
                  </Stack>
                </Grid>
              </Grid>
            </>
          )}
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
        destination: '/login?redirectTo=/admin',
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
    // Get initial stats for the dashboard
    // This is a simplified version just to have some data on load
    // Full stats are loaded client-side
    
    // Get total pets
    const { data: totalPets, error: petsError } = await supabase
      .from('pets')
      .select('id', { count: 'exact' });
    
    if (petsError) throw petsError;
    
    // Get active pets
    const { data: activePets, error: activePetsError } = await supabase
      .from('pets')
      .select('id', { count: 'exact' })
      .eq('status', 'activo');
    
    if (activePetsError) throw activePetsError;
    
    // Get total users
    const { data: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });
    
    if (usersError) throw usersError;
    
    return {
      props: {
        initialStats: {
          total_pets: totalPets?.length || 0,
          active_pets: activePets?.length || 0,
          total_users: totalUsers?.length || 0,
        },
      },
    };
  } catch (error: any) {
    console.error('Error fetching admin dashboard stats:', error.message);
    
    return {
      props: {
        error: 'Error al cargar las estadísticas iniciales'
      },
    };
  }
};
