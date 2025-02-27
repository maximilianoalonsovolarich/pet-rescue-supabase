import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layouts/MainLayout';
import { createServerSupabaseClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/lib/supabase';
import { getPetById } from '@/services/petService';
import { useAuth } from '@/contexts/AuthContext';
import PetCard from '@/components/pets/PetCard';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  Avatar,
  Stack,
  Card,
  CardContent,
  IconButton,
  Breadcrumbs,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Pets as PetsIcon,
  Place as PlaceIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChevronRight as ChevronRightIcon,
  NavigateNext as NavigateNextIcon,
  CheckCircle as CheckCircleIcon,
  Category as CategoryIcon,
  PriorityHigh as PriorityHighIcon,
  Share as ShareIcon,
  WhatsApp as WhatsAppIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { 
  getPetTypeName, 
  getPetSizeName, 
  getPetGenderName, 
  getPetAgeName, 
  formatDate,
  getImageUrl
} from '@/utils/helpers';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const MapWithNoSSR = dynamic(() => import('@/components/pets/PetMap'), { 
  ssr: false,
  loading: () => <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <CircularProgress />
  </Box>
});

interface PetDetailsProps {
  pet: Pet & { similar_pets?: any[] };
  error?: string;
}

export default function PetDetails({ pet, error: serverError }: PetDetailsProps) {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(serverError || '');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Handle no pet data
  if (!pet) {
    return (
      <MainLayout>
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Mascota no encontrada
          </Typography>
          <Typography variant="body1" paragraph>
            La mascota que estás buscando no existe o ha sido eliminada.
          </Typography>
          <Button 
            component={Link} 
            href="/" 
            variant="contained"
            startIcon={<ArrowBackIcon />}
          >
            Volver al inicio
          </Button>
          
          {error && (
            <Alert severity="error" sx={{ mt: 4, mx: 'auto', maxWidth: 500 }}>
              {error}
            </Alert>
          )}
        </Box>
      </MainLayout>
    );
  }
  
  // Get all images for gallery
  const allImages = [
    pet.image_url ? getImageUrl(pet.image_url) : 'https://source.unsplash.com/random?pet',
    ...(pet.additional_images?.map(img => getImageUrl(img)) || [])
  ];
  
  // Check if user is owner of this pet
  const isOwner = user && user.id === pet.user_id;
  
  // Handle pet deletion
  const handleDelete = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', pet.id);
      
      if (error) throw error;
      
      router.push('/my-pets');
    } catch (err: any) {
      console.error('Error deleting pet:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // Handle sharing
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pet.title,
        text: \`Mira esta mascota: \${pet.title}\`,
        url: window.location.href,
      });
    }
  };
  
  // Handle WhatsApp sharing
  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(\`¡Mira esta mascota en Pet Rescue! \${pet.title}: \${window.location.href}\`);
    window.open(\`https://wa.me/?text=\${message}\`, '_blank');
  };

  return (
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
            {pet.title}
          </Typography>
        </Breadcrumbs>
        
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={4}>
          {/* Main content */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 2, 
                overflow: 'hidden',
                mb: 4
              }}
            >
              {/* Main image */}
              <Box sx={{ 
                position: 'relative', 
                height: { xs: 300, sm: 400, md: 500 },
                backgroundColor: 'rgba(0,0,0,0.05)'
              }}>
                <Image
                  src={allImages[currentImage]}
                  alt={pet.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
                
                {/* Status chip */}
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  <Chip 
                    label={getPetStatusName(pet.status)}
                    color={pet.status === 'activo' ? 'success' : pet.status === 'inactivo' ? 'warning' : 'info'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Box>
              
              {/* Thumbnail images */}
              {allImages.length > 1 && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    p: 2, 
                    gap: 1, 
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': {
                      height: 6,
                    }
                  }}
                >
                  {allImages.map((img, index) => (
                    <Box 
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: 1,
                        cursor: 'pointer',
                        position: 'relative',
                        border: index === currentImage ? '2px solid' : '2px solid transparent',
                        borderColor: 'primary.main'
                      }}
                    >
                      <Image
                        src={img}
                        alt={\`Imagen \${index + 1}\`}
                        fill
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
            
            {/* Pet details */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                  {pet.title}
                </Typography>
                
                <Stack direction="row" spacing={1}>
                  {isOwner && (
                    <>
                      <IconButton 
                        color="primary"
                        component={Link}
                        href={\`/pets/edit/\${pet.id}\`}
                      >
                        <EditIcon />
                      </IconButton>
                      
                      <IconButton 
                        color="error"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                  
                  <IconButton color="primary" onClick={handleShare}>
                    <ShareIcon />
                  </IconButton>
                  
                  <IconButton color="success" onClick={handleWhatsAppShare}>
                    <WhatsAppIcon />
                  </IconButton>
                </Stack>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                <Chip
                  icon={<CategoryIcon />}
                  label={getPetTypeName(pet.pet_type)}
                  color={pet.pet_type === 'perro' ? 'primary' : 'secondary'}
                  size="medium"
                />
                
                {pet.pet_size && (
                  <Chip
                    label={getPetSizeName(pet.pet_size)}
                    variant="outlined"
                    size="medium"
                  />
                )}
                
                {pet.pet_gender && (
                  <Chip
                    label={getPetGenderName(pet.pet_gender)}
                    variant="outlined"
                    size="medium"
                  />
                )}
                
                {pet.pet_age && (
                  <Chip
                    label={getPetAgeName(pet.pet_age)}
                    variant="outlined"
                    size="medium"
                  />
                )}
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Descripción
              </Typography>
              
              <Typography variant="body1" paragraph>
                {pet.description}
              </Typography>
              
              <Box sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarTodayIcon sx={{ mr: 1, fontSize: 18 }} />
                  Publicado: {formatDate(pet.created_at, true)}
                </Typography>
                
                {pet.updated_at && (
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                    Actualizado: {formatDate(pet.updated_at, true)}
                  </Typography>
                )}
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Location section */}
              {(pet.latitude && pet.longitude) || pet.address ? (
                <>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Ubicación
                  </Typography>
                  
                  {pet.address && (
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        mb: 2 
                      }}
                    >
                      <PlaceIcon color="error" sx={{ mr: 1, mt: 0.3 }} />
                      {pet.address}
                    </Typography>
                  )}
                  
                  {pet.latitude && pet.longitude && (
                    <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                      <MapWithNoSSR 
                        center={[pet.latitude, pet.longitude]} 
                        zoom={15}
                        markerPosition={[pet.latitude, pet.longitude]}
                        markerTitle={pet.title}
                      />
                    </Box>
                  )}
                </>
              ) : null}
            </Paper>
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Contact info */}
            <Card 
              elevation={3} 
              sx={{ 
                mb: 3, 
                borderRadius: 2
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Información de contacto
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      mr: 2,
                      bgcolor: 'primary.main'
                    }}
                  >
                    {pet.user_name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {pet.user_name || 'Usuario'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Publicador
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ my: 2 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1 
                    }}
                  >
                    <EmailIcon color="primary" sx={{ mr: 1 }} />
                    {pet.user_email}
                  </Typography>
                  
                  {pet.user_phone && (
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}
                    >
                      <PhoneIcon color="primary" sx={{ mr: 1 }} />
                      {pet.user_phone}
                    </Typography>
                  )}
                </Box>
                
                {pet.user_phone && (
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{ mt: 2 }}
                    startIcon={<WhatsAppIcon />}
                    component="a"
                    href={\`https://wa.me/\${pet.user_phone.replace(/\\s+/g, '')}\`}
                    target="_blank"
                  >
                    Contactar por WhatsApp
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  startIcon={<EmailIcon />}
                  component="a"
                  href={\`mailto:\${pet.user_email}?subject=Interés en: \${pet.title}\`}
                >
                  Enviar correo
                </Button>
              </CardContent>
            </Card>
            
            {/* Similar pets */}
            {pet.similar_pets && pet.similar_pets.length > 0 && (
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Mascotas similares
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Stack spacing={2}>
                  {pet.similar_pets.map((similarPet: any) => (
                    <Box 
                      key={similarPet.id}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                      component={Link}
                      href={\`/pets/\${similarPet.id}\`}
                    >
                      <Box 
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          borderRadius: 1,
                          position: 'relative',
                          overflow: 'hidden',
                          mr: 2,
                          flexShrink: 0
                        }}
                      >
                        <Image
                          src={similarPet.image_url ? getImageUrl(similarPet.image_url) : 'https://source.unsplash.com/random?pet'}
                          alt={similarPet.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </Box>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {similarPet.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getPetTypeName(similarPet.pet_type)}
                        </Typography>
                      </Box>
                      
                      <ChevronRightIcon color="action" />
                    </Box>
                  ))}
                </Stack>
                
                <Button
                  fullWidth
                  variant="text"
                  component={Link}
                  href={\`/?pet_type=\${pet.pet_type}\`}
                  sx={{ mt: 2 }}
                >
                  Ver más similares
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Eliminar publicación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas eliminar esta publicación? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerSupabaseClient();
  const { id } = context.params || {};
  
  if (!id || typeof id !== 'string') {
    return {
      props: {
        pet: null,
        error: 'ID de mascota inválido'
      }
    };
  }
  
  try {
    const pet = await getPetById(id);
    
    return {
      props: {
        pet
      }
    };
  } catch (error: any) {
    console.error(`Error fetching pet with ID ${id}:`, error);
    
    return {
      props: {
        pet: null,
        error: 'Error al cargar la información de la mascota'
      }
    };
  }
};
