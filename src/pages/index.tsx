import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Pet } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import PetCard from '@/components/pets/PetCard';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Pagination,
  Chip,
  Stack,
  Divider,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fab,
  Tooltip,
  Container
} from '@mui/material';
import {
  Search as SearchIcon,
  Pets as PetsIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

type HomeProps = {
  pets: Pet[];
  petTypeCounts: {
    [key: string]: number;
  };
};

const ITEMS_PER_PAGE = 6;

export default function Home({ pets, petTypeCounts }: HomeProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  const [allPets, setAllPets] = useState<Pet[]>(pets);
  const [filteredPets, setFilteredPets] = useState<Pet[]>(pets);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [petType, setPetType] = useState('');
  const [petSize, setPetSize] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(!isMobile);
  
  // Filter pets when filters change
  useEffect(() => {
    let result = [...allPets];
    
    if (petType) {
      result = result.filter(pet => pet.pet_type === petType);
    }
    
    if (petSize) {
      result = result.filter(pet => pet.pet_size === petSize);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(pet => 
        pet.title.toLowerCase().includes(term) || 
        pet.description.toLowerCase().includes(term) ||
        (pet.address && pet.address.toLowerCase().includes(term))
      );
    }
    
    setFilteredPets(result);
    setPage(1); // Reset to first page when filters change
  }, [allPets, petType, petSize, searchTerm]);
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredPets.length / ITEMS_PER_PAGE);
  const paginatedPets = filteredPets.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  
  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Toggle filters display on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setPetType('');
    setPetSize('');
    setSearchTerm('');
  };
  
  return (
    <Box sx={{ pb: 4 }}>
      {/* Banner */}
      <Paper
        sx={{
          position: 'relative',
          color: '#fff',
          mb: { xs: 4, md: 6 },
          minHeight: { xs: 400, md: 450 },
          borderRadius: { xs: '0 0 24px 24px', md: 2 },
          overflow: 'hidden',
          boxShadow: { xs: 'none', md: 3 }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(https://source.unsplash.com/collection/542909/1600x900)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            background: {
              xs: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.8) 100%)',
              md: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.4) 100%)'
            },
            backdropFilter: 'blur(2px)'
          }}
        />
        <Container maxWidth="lg" sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
          <Grid 
            container 
            sx={{ 
              height: '100%',
              alignItems: { xs: 'center', md: 'center' },
              textAlign: { xs: 'center', md: 'left' }
            }}
          >
            <Grid 
              item 
              xs={12} 
              md={7} 
              lg={6} 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  p: { xs: 3, md: 6 },
                  pr: { md: 0 },
                  maxWidth: { xs: '100%', md: '90%' }
                }}
              >
                <Typography 
                  component="h1" 
                  variant={isMobile ? "h4" : "h3"} 
                  color="inherit" 
                  gutterBottom
                  sx={{ fontWeight: 700 }}
                >
                  Ayuda a los animales callejeros
                </Typography>
                <Typography 
                  variant="h6" 
                  color="inherit" 
                  paragraph
                  sx={{ 
                    fontWeight: 400,
                    display: { xs: 'block', sm: 'block' } 
                  }}
                >
                  Encuentra mascotas que necesitan un hogar o reporta animales callejeros para ayudarlos a encontrar un lugar seguro.
                </Typography>
                <Button
                  component={Link}
                  href={user ? "/pets/create" : "/login"}
                  variant="contained"
                  color="secondary"
                  size="large"
                  sx={{ 
                    mt: { xs: 2, md: 3 },
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: 3
                  }}
                  startIcon={<AddIcon />}
                >
                  {user ? "Publicar Mascota" : "Iniciar sesión para publicar"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>
      
      <Container maxWidth="lg">
        {/* Mobile filter button */}
        {isMobile && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={toggleFilters}
              sx={{ mb: 2 }}
            >
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>
          </Box>
        )}
        
        <Grid container spacing={3}>
          {/* Filters sidebar */}
          {(showFilters || !isMobile) && (
            <Grid item xs={12} md={3} order={{ xs: 2, md: 1 }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  mb: { xs: 3, md: 0 },
                  position: { md: 'sticky' },
                  top: { md: 24 }
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Filtros
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Buscar"
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
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="pet-type-label">Tipo de Mascota</InputLabel>
                    <Select
                      labelId="pet-type-label"
                      value={petType}
                      label="Tipo de Mascota"
                      onChange={(e) => setPetType(e.target.value)}
                    >
                      <MenuItem value="">Todas</MenuItem>
                      <MenuItem value="perro">Perros</MenuItem>
                      <MenuItem value="gato">Gatos</MenuItem>
                      <MenuItem value="ave">Aves</MenuItem>
                      <MenuItem value="conejo">Conejos</MenuItem>
                      <MenuItem value="otro">Otros</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="pet-size-label">Tamaño</InputLabel>
                    <Select
                      labelId="pet-size-label"
                      value={petSize}
                      label="Tamaño"
                      onChange={(e) => setPetSize(e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="pequeño">Pequeño</MenuItem>
                      <MenuItem value="mediano">Mediano</MenuItem>
                      <MenuItem value="grande">Grande</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={resetFilters}
                  disabled={!petType && !petSize && !searchTerm}
                >
                  Limpiar Filtros
                </Button>
                
                {isMobile && (
                  <Button 
                    variant="text" 
                    fullWidth
                    onClick={toggleFilters}
                    sx={{ mt: 2 }}
                  >
                    Ocultar filtros
                  </Button>
                )}
                
                {/* Stats */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                    Estadísticas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Total:</Typography>
                      <Typography variant="body2" fontWeight={500}>{allPets.length} mascotas</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Perros:</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {petTypeCounts.perro || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Gatos:</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {petTypeCounts.gato || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Otros:</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {petTypeCounts.otros || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          )}
          
          {/* Main content */}
          <Grid item xs={12} md={9} order={{ xs: 1, md: 2 }}>
            {/* Results header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="h2" fontWeight={600}>
                {searchTerm || petType || petSize ? 'Resultados de búsqueda' : 'Mascotas disponibles'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredPets.length} {filteredPets.length === 1 ? 'mascota' : 'mascotas'}
              </Typography>
            </Box>
            
            {/* Error message */}
            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}
            
            {/* Loading skeletons */}
            {loading && (
              <Grid container spacing={3}>
                {[...Array(6)].map((_, index) => (
                  <Grid item key={index} xs={12} sm={6} md={4}>
                    <PetCard pet={{} as Pet} isLoading={true} />
                  </Grid>
                ))}
              </Grid>
            )}
            
            {/* Pet list */}
            {!loading && paginatedPets.length > 0 && (
              <>
                <Grid container spacing={3}>
                  {paginatedPets.map((pet, index) => (
                    <Grid item key={pet.id} xs={12} sm={6} md={isTablet ? 6 : 4}>
                      <PetCard pet={pet} />
                    </Grid>
                  ))}
                </Grid>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                    <Pagination 
                      count={totalPages} 
                      page={page} 
                      onChange={handlePageChange} 
                      color="primary" 
                      size={isMobile ? "medium" : "large"}
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </>
            )}
            
            {/* No results */}
            {!loading && paginatedPets.length === 0 && (
              <Paper sx={{ textAlign: 'center', py: 6, px: 3 }}>
                <PetsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  No se encontraron mascotas
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Intenta cambiar los filtros o publica una nueva mascota
                </Typography>
                <Button
                  component={Link}
                  href={user ? "/pets/create" : "/login"}
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  startIcon={<AddIcon />}
                >
                  {user ? "Publicar Mascota" : "Iniciar sesión para publicar"}
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
      
      {/* Floating action button for mobile to add a new pet */}
      {user && isMobile && (
        <Tooltip title="Publicar nueva mascota">
          <Fab
            component={Link}
            href="/pets/create"
            color="secondary"
            aria-label="add pet"
            sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      )}
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerSupabaseClient();
  
  try {
    // Get all active pets
    const { data: pets, error } = await supabase
      .from('pets')
      .select(`
        *,
        profiles:user_id (name)
      `)
      .eq('status', 'activo')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Process the joined data to match our expected format
    const processedPets = pets.map(pet => ({
      ...pet,
      user_name: pet.profiles?.name || 'Usuario',
    }));
    
    // Count pets by type
    const petTypeCounts = processedPets.reduce((acc: {[key: string]: number}, pet) => {
      if (pet.pet_type === 'perro' || pet.pet_type === 'gato') {
        acc[pet.pet_type] = (acc[pet.pet_type] || 0) + 1;
      } else {
        acc.otros = (acc.otros || 0) + 1;
      }
      return acc;
    }, {});
    
    return {
      props: {
        pets: processedPets,
        petTypeCounts
      }
    };
  } catch (error) {
    console.error('Error fetching pets:', error);
    
    return {
      props: {
        pets: [],
        petTypeCounts: {}
      }
    };
  }
};
