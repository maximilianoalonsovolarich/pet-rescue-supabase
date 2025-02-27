import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createServerSupabaseClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layouts/MainLayout';
import PetCard from '@/components/pets/PetCard';
import AuthMiddleware from '@/middlewares/AuthMiddleware';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Stack,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Breadcrumbs,
  useTheme,
  useMediaQuery,
  SelectChangeEvent,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Pets as PetsIcon,
  FilterAlt as FilterAltIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

// Define interface for props
interface MyPetsProps {
  initialPets: Pet[];
  error?: string;
}

export default function MyPets({ initialPets, error: serverError }: MyPetsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State
  const [pets, setPets] = useState<Pet[]>(initialPets || []);
  const [filteredPets, setFilteredPets] = useState<Pet[]>(initialPets || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(serverError || '');
  const [filter, setFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  
  // Filter pets when tab or filter changes
  useEffect(() => {
    let filtered = pets;
    
    // Apply tab filtering
    if (tabValue === 0) { // Todas
      filtered = pets;
    } else if (tabValue === 1) { // Activas
      filtered = pets.filter(pet => pet.status === 'activo');
    } else if (tabValue === 2) { // Inactivas
      filtered = pets.filter(pet => pet.status === 'inactivo');
    } else if (tabValue === 3) { // Encontradas/Adoptadas
      filtered = pets.filter(pet => pet.status === 'encontrado' || pet.status === 'adoptado');
    }
    
    // Apply additional filter if needed
    if (filter !== 'all') {
      filtered = filtered.filter(pet => pet.pet_type === filter);
    }
    
    setFilteredPets(filtered);
    setPage(1); // Reset to first page when filter changes
  }, [pets, filter, tabValue]);
  
  // Fetch pets
  const fetchPets = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setPets(data);
    } catch (err: any) {
      console.error('Error fetching pets:', err);
      setError('Error al cargar tus mascotas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilter(event.target.value);
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle delete
  const handleDeleteClick = (pet: Pet) => {
    setPetToDelete(pet);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!petToDelete) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petToDelete.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setPets(pets.filter(pet => pet.id !== petToDelete.id));
      setDeleteDialogOpen(false);
      setPetToDelete(null);
    } catch (err: any) {
      console.error('Error deleting pet:', err);
      setError('Error al eliminar la mascota: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Pagination
  const totalPages = Math.ceil(filteredPets.length / itemsPerPage);
  const currentPets = filteredPets.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  return (
    <AuthMiddleware>
      <MainLayout>
        <Box sx={{ mb: 6 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
            sx={{ mb: 3 }}
          >
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
              Inicio
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <PetsIcon sx={{ mr: 0.5 }} fontSize="small" />
              Mis Publicaciones
            </Typography>
          </Breadcrumbs>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={9}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                Mis Publicaciones
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={Link}
                href="/pets/create"
                sx={{ mt: { xs: 0, md: 1 } }}
              >
                Publicar Nueva
              </Button>
            </Grid>
          </Grid>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 4 }}>
              {error}
            </Alert>
          )}
          
          {/* Tabs for filtering */}
          <Paper 
            elevation={3} 
            sx={{ 
              mt: 3, 
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 3
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              p: 2
            }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : undefined}
              >
                <Tab label="Todas" />
                <Tab label="Activas" />
                <Tab label="Inactivas" />
                <Tab label="Encontradas/Adoptadas" />
              </Tabs>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mt: { xs: 2, sm: 0 },
                width: { xs: '100%', sm: 'auto' }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  <FilterAltIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <FormControl 
                    size="small" 
                    sx={{ minWidth: 120 }}
                    variant="outlined"
                  >
                    <InputLabel id="type-filter-label">Tipo</InputLabel>
                    <Select
                      labelId="type-filter-label"
                      value={filter}
                      onChange={handleFilterChange}
                      label="Tipo"
                    >
                      <MenuItem value="all">Todos</MenuItem>
                      <MenuItem value="perro">Perros</MenuItem>
                      <MenuItem value="gato">Gatos</MenuItem>
                      <MenuItem value="ave">Aves</MenuItem>
                      <MenuItem value="conejo">Conejos</MenuItem>
                      <MenuItem value="otro">Otros</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <IconButton
                  size="small"
                  onClick={fetchPets}
                  disabled={loading}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
          
          {/* Loading state */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {/* Pets grid */}
          {!loading && filteredPets.length === 0 ? (
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                mt: 2
              }}
            >
              <PetsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No tienes publicaciones {filter !== 'all' ? 'de este tipo' : ''} {tabValue > 0 ? 'con este estado' : ''}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Comienza publicando información sobre mascotas para ayudarlas
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={Link}
                href="/pets/create"
                sx={{ mt: 2 }}
              >
                Publicar Mascota
              </Button>
              
              {(filter !== 'all' || tabValue > 0) && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  sx={{ mt: 2, ml: 2 }}
                  onClick={() => {
                    setFilter('all');
                    setTabValue(0);
                  }}
                >
                  Limpiar Filtros
                </Button>
              )}
            </Paper>
          ) : (
            !loading && (
              <>
                <Grid container spacing={3}>
                  {currentPets.map((pet) => (
                    <Grid item xs={12} sm={6} md={4} key={pet.id}>
                      <Box sx={{ position: 'relative' }}>
                        <PetCard pet={pet} />
                        
                        {/* Edit/Delete overlay */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            display: 'flex',
                            gap: 1,
                            zIndex: 2
                          }}
                        >
                          <IconButton
                            size="small"
                            color="primary"
                            sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
                            component={Link}
                            href={`/pets/edit/${pet.id}`}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          
                          <IconButton
                            size="small"
                            color="error"
                            sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
                            onClick={() => handleDeleteClick(pet)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(event, value) => setPage(value)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )
          )}
          
          {/* Delete confirmation dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Eliminar publicación</DialogTitle>
            <DialogContent>
              <DialogContentText>
                ¿Estás seguro que deseas eliminar la publicación "{petToDelete?.title}"? Esta acción no se puede deshacer.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleConfirmDelete} 
                color="error" 
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </MainLayout>
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
        destination: '/login?redirectTo=/my-pets',
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
        initialPets: userPets || [],
      },
    };
  } catch (error: any) {
    console.error('Error fetching user pets:', error.message);
    
    return {
      props: {
        initialPets: [],
        error: 'Error al cargar tus mascotas. Por favor intenta de nuevo más tarde.'
      },
    };
  }
};
