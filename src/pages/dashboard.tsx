import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Pet, Profile } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { createServerSupabaseClient } from '@/lib/supabase';
import PetCard from '@/components/pets/PetCard';
import { getTimeAgo, getPetTypeName } from '@/utils/helpers';

// Material UI
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Divider,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  LinearProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Pets as PetsIcon,
  Add as AddIcon,
  Article as ArticleIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Dashboard as DashboardIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface DashboardProps {
  userPets: Pet[];
  error?: string;
}

export default function Dashboard({ userPets, error: serverError }: DashboardProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(serverError || '');
  const theme = useTheme();
  const router = useRouter();
  
  // Calculate stats from the user's pets
  const stats = {
    totalPets: userPets?.length || 0,
    activePets: userPets?.filter(pet => pet.status === 'activo').length || 0,
    views: userPets?.reduce((sum, pet) => sum + (pet.views || 0), 0) || 0,
  };

  // Quick action cards
  const quickActions = [
    {
      title: 'Publicar Nueva Mascota',
      icon: <AddIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      link: '/pets/create',
      color: theme.palette.primary.main
    },
    {
      title: 'Ver Mis Publicaciones',
      icon: <ArticleIcon sx={{ fontSize: 60, color: 'secondary.main' }} />,
      link: '/my-pets',
      color: theme.palette.secondary.main
    },
    {
      title: 'Editar Mi Perfil',
      icon: <PersonIcon sx={{ fontSize: 60, color: 'info.main' }} />,
      link: '/profile',
      color: theme.palette.info.main
    }
  ];
  
  // Add admin action if user is admin
  if (profile?.is_admin) {
    quickActions.push({
      title: 'Panel de Administración',
      icon: <DashboardIcon sx={{ fontSize: 60, color: 'white' }} />,
      link: '/admin',
      color: '#1e1e2f',
      textColor: 'white'
    });
  }

  if (!user) {
    router.push('/login');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  // Display loading state while client-side checking happens
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          Mi Tablero
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={4}>
          {/* Summary stats */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: '100%', 
                    background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PetsIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h3" fontWeight="bold">{stats.totalPets}</Typography>
                      <Typography variant="body2">Mascotas Publicadas</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: '100%', 
                    background: `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`,
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ArticleIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h3" fontWeight="bold">{stats.activePets}</Typography>
                      <Typography variant="body2">Publicaciones Activas</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: '100%', 
                    background: `linear-gradient(135deg, ${theme.palette.info.light}, ${theme.palette.info.main})`,
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <VisibilityIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h3" fontWeight="bold">{stats.views}</Typography>
                      <Typography variant="body2">Vistas Totales</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          
          {/* User profile information */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    mr: 2, 
                    bgcolor: theme.palette.primary.main,
                    border: '2px solid white',
                    boxShadow: 2
                  }}
                >
                  {profile?.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Mi Perfil
                  </Typography>
                  <Chip 
                    label={profile?.is_admin ? 'Administrador' : 'Usuario'} 
                    color={profile?.is_admin ? 'secondary' : 'primary'} 
                    size="small" 
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Editar perfil">
                  <IconButton 
                    component={Link} 
                    href="/profile"
                    color="primary"
                    sx={{ 
                      bgcolor: 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected'
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Nombre
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                    {profile?.name}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                    {profile?.email}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Completar perfil
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ flexGrow: 1, mr: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={profile?.phone ? 100 : 50} 
                        sx={{ height: 8, borderRadius: 4 }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {profile?.phone ? '100%' : '50%'}
                    </Typography>
                  </Box>
                  {!profile?.phone && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Añade tu número de teléfono para completar tu perfil
                    </Alert>
                  )}
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    component={Link}
                    href="/profile"
                    variant="contained"
                    fullWidth
                    startIcon={<PersonIcon />}
                  >
                    Editar Perfil
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          
          {/* Quick actions */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Acciones Rápidas
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card 
                      elevation={3}
                      sx={{ 
                        borderRadius: 2,
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 6
                        }
                      }}
                    >
                      <Button
                        component={Link}
                        href={action.link}
                        sx={{ 
                          height: '100%',
                          width: '100%',
                          bgcolor: action.color && `${action.color}15`,
                          p: 3,
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          color: action.textColor || 'inherit'
                        }}
                      >
                        {action.icon}
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mt: 1,
                            fontWeight: 600,
                            color: action.textColor ? action.textColor : 'inherit'
                          }}
                        >
                          {action.title}
                        </Typography>
                      </Button>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          
          {/* Recent pets */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Mis Publicaciones Recientes
                </Typography>
                <Button
                  component={Link}
                  href="/my-pets"
                  color="primary"
                  endIcon={<ArticleIcon />}
                >
                  Ver Todas
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {userPets && userPets.length > 0 ? (
                <Grid container spacing={3}>
                  {userPets.slice(0, 3).map((pet) => (
                    <Grid item key={pet.id} xs={12} sm={6} md={4}>
                      <PetCard pet={pet} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <PetsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                    No tienes publicaciones aún
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    ¡Comienza publicando información sobre mascotas callejeras para ayudarlas!
                  </Typography>
                  <Button
                    component={Link}
                    href="/pets/create"
                    variant="contained"
                    startIcon={<AddIcon />}
                    size="large"
                  >
                    Publicar Mascota
                  </Button>
                </Box>
              )}
              
              {userPets && userPets.length > 0 && userPets.length < 4 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    component={Link}
                    href="/pets/create"
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                  >
                    Publicar Nueva Mascota
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Tips section */}
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(https://source.unsplash.com/random?pet)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white'
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Consejos para buenas publicaciones
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <PhotoCameraIcon sx={{ fontSize: 30, mr: 2, color: theme.palette.secondary.light }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Añade fotos claras
                      </Typography>
                      <Typography variant="body2">
                        Las imágenes nítidas y bien iluminadas ayudan a identificar a la mascota.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <ArticleIcon sx={{ fontSize: 30, mr: 2, color: theme.palette.secondary.light }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Descripción detallada
                      </Typography>
                      <Typography variant="body2">
                        Incluye toda la información relevante como color, tamaño y comportamiento.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <LocationOnIcon sx={{ fontSize: 30, mr: 2, color: theme.palette.secondary.light }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Ubicación exacta
                      </Typography>
                      <Typography variant="body2">
                        Una ubicación precisa aumenta las posibilidades de encontrar al dueño.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
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
        destination: '/login?redirect=/dashboard',
        permanent: false,
      },
    };
  }
  
  try {
    // Get the current user's pets
    const { data: userPets, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return {
      props: {
        userPets: userPets || [],
      },
    };
  } catch (error: any) {
    console.error('Error fetching user pets:', error.message);
    
    return {
      props: {
        userPets: [],
        error: 'Error al cargar tus mascotas. Por favor intenta de nuevo más tarde.'
      },
    };
  }
};
