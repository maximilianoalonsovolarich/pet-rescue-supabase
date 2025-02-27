import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Pet, Profile } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import PetCard from '@/components/pets/PetCard';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
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
  useTheme,
  useMediaQuery,
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
  Phone as PhoneIcon,
} from '@mui/icons-material';

type DashboardProps = {
  userPets: Pet[];
  stats: {
    totalPets: number;
    activePets: number;
    views: number;
  };
};

export default function Dashboard({ userPets, stats }: DashboardProps) {
  const { profile, isAdmin } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
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
  
  // If user is admin, add admin action
  if (isAdmin) {
    quickActions.push({
      title: 'Panel de Administración',
      icon: <DashboardIcon sx={{ fontSize: 60, color: 'white' }} />,
      link: '/admin',
      color: '#1e1e2f',
      textColor: 'white'
    });
  }
  
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Mi Tablero
      </Typography>
      
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
                src={profile?.profile_image || undefined}
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
                  label={isAdmin ? 'Administrador' : 'Usuario'} 
                  color={isAdmin ? 'secondary' : 'primary'} 
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
                    <CardActionArea 
                      component={Link} 
                      href={action.link}
                      sx={{ 
                        height: '100%',
                        bgcolor: action.color && `${action.color}15`,
                      }}
                    >
                      <Box 
                        sx={{ 
                          p: 3, 
                          textAlign: 'center',
                          color: action.textColor
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
                      </Box>
                    </CardActionArea>
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
            
            {userPets.length > 0 ? (
              <Grid container spacing={3}>
                {userPets.slice(0, isMobile ? 2 : 3).map((pet) => (
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
            
            {userPets.length > 0 && userPets.length < 4 && (
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
              position: 'relative',
              overflow: 'hidden',
              color: 'white'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7))',
                  zIndex: 1
                }
              }}
            >
              <Image
                src="https://source.unsplash.com/random?pet"
                alt="Background"
                fill
                style={{ objectFit: 'cover' }}
              />
            </Box>
            
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Consejos para buenas publicaciones
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>1</Avatar>
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
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>2</Avatar>
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
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>3</Avatar>
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
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Create authenticated Supabase client
  const supabase = createServerSupabaseClient();
  
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  try {
    // Get user's pets
    const { data: userPets, error: petsError } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (petsError) throw petsError;
    
    // Calculate stats
    const activePets = userPets.filter(pet => pet.status === 'activo').length;
    const totalViews = userPets.reduce((sum, pet) => sum + (pet.views || 0), 0);
    
    const stats = {
      totalPets: userPets.length,
      activePets,
      views: totalViews
    };
    
    return {
      props: {
        userPets: userPets || [],
        stats
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    return {
      props: {
        userPets: [],
        stats: {
          totalPets: 0,
          activePets: 0,
          views: 0
        }
      },
    };
  }
};
