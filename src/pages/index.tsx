import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/layouts/MainLayout';
import PetCard from '@/components/pets/PetCard';
import { getPets, PetFilters } from '@/services/petService';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Container,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Pagination,
  Paper,
  Alert,
  CircularProgress,
  Fade,
  Zoom,
  Fab,
  Tooltip,
  useTheme,
  useMediaQuery,
  SelectChangeEvent,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Pets as PetsIcon,
  Add as AddIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

// Define the props type for this page
interface HomePageProps {
  initialPets: {
    pets: any[];
    count: number;
  };
}

export default function HomePage({ initialPets }: HomePageProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const router = useRouter();
  
  // State for filtering and pagination
  const [pets, setPets] = useState(initialPets.pets);
  const [totalPets, setTotalPets] = useState(initialPets.count);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PetFilters>({
    pet_type: '',
    pet_size: '',
    pet_gender: '',
    status: 'activo',
    search: '',
    limit: 6
  });
  const [showFilters, setShowFilters] = useState(!isMobile);
  
  // Effect to fetch pets when filters or page changes
  useEffect(() => {
    const fetchFilteredPets = async () => {
      try {
        setLoading(true);
        const result = await getPets({
          ...filters,
          page: page - 1,
        });
        setPets(result.pets);
        setTotalPets(result.count);
      } catch (error) {
        console.error('Error fetching pets:', error);
        setError('Error al cargar las mascotas. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilteredPets();
  }, [filters, page]);
  
  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalPets / (filters.limit || 6));
  
  // Handler for page change
  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handler for filter changes
  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filters change
  };
  
  // Toggle filters display on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      pet_type: '',
      pet_size: '',
      pet_gender: '',
      status: 'activo',
      search: '',
      limit: 6
    });
    setPage(1);
  };

  return (
    <MainLayout>
      {/* Hero Banner */}
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
            zIndex: 0
          }}
        >
          <Image
            src="https://images.unsplash.com/photo-1548681528-6a5c45b66b42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&h=900&q=80"
            alt="Mascotas"
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center 30%'
            }}
          />
        </Box>
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
            backdropFilter: 'blur(2px)',
            zIndex: 1
          }}
        />
        <Container maxWidth="lg" sx={{ height: '100%', position: 'relative', zIndex: 2 }}>
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
                  top: { md: 24 },
                  borderRadius: 2
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
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
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
                      value={filters.pet_type}
                      label="Tipo de Mascota"
                      onChange={(e: SelectChangeEvent) => handleFilterChange('pet_type', e.target.value)}
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
                      value={filters.pet_size}
                      label="Tamaño"
                      onChange={(e: SelectChangeEvent) => handleFilterChange('pet_size', e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="pequeño">Pequeño</MenuItem>
                      <MenuItem value="mediano">Mediano</MenuItem>
                      <MenuItem value="grande">Grande</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="pet-gender-label">Género</InputLabel>
                    <Select
                      labelId="pet-gender-label"
                      value={filters.pet_gender}
                      label="Género"
                      onChange={(e: SelectChangeEvent) => handleFilterChange('pet_gender', e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="macho">Macho</MenuItem>
                      <MenuItem value="hembra">Hembra</MenuItem>
                      <MenuItem value="desconocido">Desconocido</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={resetFilters}
                  disabled={!filters.pet_type && !filters.pet_size && !filters.pet_gender && !filters.search}
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
                      <Typography variant="body2" fontWeight={500}>{totalPets} mascotas</Typography>
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
                {filters.search || filters.pet_type || filters.pet_size || filters.pet_gender ? 'Resultados de búsqueda' : 'Mascotas disponibles'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {totalPets} {totalPets === 1 ? 'mascota' : 'mascotas'}
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
                  <Grid item key={index} xs={12} sm={6} md={isTablet ? 6 : 4}>
                    <PetCard pet={{} as any} isLoading={true} />
                  </Grid>
                ))}
              </Grid>
            )}
            
            {/* Pet list */}
            {!loading && pets.length > 0 && (
              <>
                <Grid container spacing={3}>
                  {pets.map((pet, index) => (
                    <Grid item key={pet.id} xs={12} sm={6} md={isTablet ? 6 : 4}>
                      <PetCard 
                        pet={pet}
                        onClick={() => router.push(`/pets/${pet.id}`)}
                      />
                    </Grid>
                  ))}
                </Grid>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                    <Pagination 
                      count={totalPages} 
                      page={page} 
                      onChange={handleChangePage} 
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
            {!loading && pets.length === 0 && (
              <Paper sx={{ textAlign: 'center', py: 6, px: 3, borderRadius: 2 }}>
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
      
      {/* Floating action button for mobile */}
      {user && isMobile && (
        <Tooltip title="Publicar nueva mascota">
          <Fab
            component={Link}
            href="/pets/create"
            color="secondary"
            aria-label="add pet"
            sx={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1000 }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      )}
    </MainLayout>
  );
}

// Server-side rendering to fetch initial pets
export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerSupabaseClient();
  
  try {
    // Fetch initial active pets
    let query = supabase
      .from('pets')
      .select(`
        *,
        profiles:user_id (name, email, phone)
      `)
      .eq('status', 'activo')
      .order('created_at', { ascending: false })
      .range(0, 5);
    
    const { data: pets, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    // Process the data to match our Pet type
    const processedPets = pets.map((pet: any) => ({
      ...pet,
      user_name: pet.profiles?.name,
      user_email: pet.profiles?.email,
      user_phone: pet.profiles?.phone,
    }));
    
    return {
      props: {
        initialPets: {
          pets: processedPets,
          count: count || processedPets.length,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching initial pets:', error);
    
    return {
      props: {
        initialPets: {
          pets: [],
          count: 0,
        },
      },
    };
  }
};
