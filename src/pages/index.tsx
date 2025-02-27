import { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Components
import PetCard from '@/components/pets/PetCard';

// Material UI
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  InputAdornment,
  Pagination,
  Chip,
  Stack,
  Alert,
  Fade,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Card,
  CardContent
} from '@mui/material';

// Icons
import {
  Search as SearchIcon,
  Pets as PetsIcon,
  FilterAlt as FilterAltIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// Constants
const ITEMS_PER_PAGE = 6;

// Types
interface HomeProps {
  initialPets: Pet[];
  petCountByType: {
    type: string;
    count: number;
  }[];
  totalPets: number;
}

export default function Home({ initialPets, petCountByType, totalPets }: HomeProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  // State
  const [pets, setPets] = useState<Pet[]>(initialPets);
  const [filteredPets, setFilteredPets] = useState<Pet[]>(initialPets);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [petType, setPetType] = useState('');
  const [petSize, setPetSize] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(!isMobile);

  // Effect to filter pets
  useEffect(() => {
    let result = [...pets];
    
    // Filter by pet type
    if (petType) {
      result = result.filter(pet => pet.pet_type === petType);
    }
    
    // Filter by pet size
    if (petSize) {
      result = result.filter(pet => pet.pet_size === petSize);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(pet => 
        pet.title.toLowerCase().includes(term) || 
        pet.description.toLowerCase().includes(term) ||
        (pet.address && pet.address.toLowerCase().includes(term))
      );
    }
    
    setFilteredPets(result);
    setPage(1); // Reset page when filters change
  }, [pets, petType, petSize, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredPets.length / ITEMS_PER_PAGE);
  const paginatedPets = filteredPets.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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
    <Box>
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
            height: '100%',
            width: '100%',
            zIndex: 0
          }}
        >
          <Image
            src="https://source.unsplash.com/collection/542909/1600x900"
            alt="Mascotas"
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
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
              startIcon={<FilterAltIcon />}
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
                      <Typography variant="body2" fontWeight={500}>{totalPets} mascotas</Typography>
                    </Box>
                    {petCountByType.map((item) => (
                      <Box 
                        key={item.type} 
                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {item.type === 'perro' ? 'Perros' : 
                          item.type === 'gato' ? 'Gatos' : 
                          item.type === 'ave' ? 'Aves' : 
                          item.type === 'conejo' ? 'Conejos' : 'Otros'}:
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {item.count}
                        </Typography>
                      </Box>
                    ))}
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
                    <PetCard 
                      pet={{} as Pet}
                      isLoading={true}
                    />
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
                      <PetCard 
                        pet={pet} 
                        withActions 
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
        
        {/* Features section */}
        <Box sx={{ my: 8, py: 4 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            textAlign="center" 
            gutterBottom
            sx={{ fontWeight: 600, mb: 2 }}
          >
            ¿Cómo funciona?
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            textAlign="center" 
            sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}
          >
            Pet Rescue te permite publicar información de mascotas perdidas o callejeras para 
            ayudarlas a encontrar un hogar o reunirse con sus dueños.
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      mx: 'auto'
                    }}
                  >
                    <AddIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Publica información
                  </Typography>
                  <Typography variant="body2">
                    Comparte detalles, fotos y ubicación de la mascota que encontraste o perdiste
                    para aumentar las posibilidades de que sea reconocida.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      bgcolor: 'secondary.main', 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      mx: 'auto'
                    }}
                  >
                    <PetsIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Conecta con otros
                  </Typography>
                  <Typography variant="body2">
                    La comunidad de Pet Rescue puede ayudar a identificar y localizar mascotas
                    perdidas o encontrar un hogar para animales callejeros.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      bgcolor: 'success.main', 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      mx: 'auto'
                    }}
                  >
                    <LocationIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Encuentra ubicaciones
                  </Typography>
                  <Typography variant="body2">
                    Utiliza los mapas interactivos para localizar dónde fue vista por última vez
                    la mascota o dónde se encuentra actualmente.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        {/* CTA section */}
        <Paper 
          elevation={3}
          sx={{ 
            p: 6, 
            my: 6, 
            textAlign: 'center',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #3f51b5 30%, #303f9f 90%)',
            color: 'white'
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Únete a nuestra comunidad
          </Typography>
          <Typography variant="body1" paragraph sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            Ayuda a mascotas necesitadas publicando información o adoptando un nuevo amigo.
            Registrarse es gratis y solo toma unos minutos.
          </Typography>
          <Button
            component={Link}
            href={user ? "/pets/create" : "/register"}
            variant="contained"
            color="secondary"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            {user ? "Publicar Mascota" : "Registrarse Ahora"}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // Fetch active pets
  const { data: pets, error } = await supabase
    .from('pets')
    .select('*')
    .eq('status', 'activo')
    .order('created_at', { ascending: false })
    .limit(24);
  
  // Get count by pet type
  const { data: petCountByType, error: countError } = await supabase
    .from('pets')
    .select('pet_type, count')
    .eq('status', 'activo')
    .group('pet_type');
  
  // Get total count
  const { count: totalPets } = await supabase
    .from('pets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'activo');
  
  if (error || countError) {
    console.error('Error fetching data:', error || countError);
    return {
      props: {
        initialPets: [],
        petCountByType: [],
        totalPets: 0
      },
      revalidate: 60 // Revalidate at most once per minute
    };
  }
  
  return {
    props: {
      initialPets: pets || [],
      petCountByType: petCountByType || [],
      totalPets: totalPets || 0
    },
    revalidate: 60 // Revalidate at most once per minute
  };
};
