import React, { useState, useCallback, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layouts/MainLayout';
import AuthMiddleware from '@/middlewares/AuthMiddleware';
import { createServerSupabaseClient, supabase } from '@/lib/supabase';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';
import { updatePet } from '@/services/petService';
import dynamic from 'next/dynamic';
import { Pet } from '@/lib/supabase';
import { getImageUrl } from '@/utils/helpers';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  FormHelperText,
  IconButton,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Breadcrumbs,
  Card,
  useTheme,
  useMediaQuery,
  SelectChangeEvent
} from '@mui/material';
import {
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
  Pets as PetsIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon
} from '@mui/icons-material';

// Dynamically import the map component to avoid SSR issues
const LocationPicker = dynamic(() => import('@/components/pets/LocationPicker'), { 
  ssr: false,
  loading: () => <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <CircularProgress />
  </Box>
});

// Validation schema
const petSchema = Yup.object({
  title: Yup.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(100, 'El título no puede tener más de 100 caracteres')
    .required('El título es requerido'),
  description: Yup.string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(1000, 'La descripción no puede tener más de 1000 caracteres')
    .required('La descripción es requerida'),
  pet_type: Yup.string()
    .oneOf(['perro', 'gato', 'ave', 'conejo', 'otro'], 'Tipo de mascota inválido')
    .required('El tipo de mascota es requerido'),
  pet_size: Yup.string()
    .oneOf(['pequeño', 'mediano', 'grande'], 'Tamaño de mascota inválido')
    .required('El tamaño de la mascota es requerido'),
  pet_gender: Yup.string()
    .oneOf(['macho', 'hembra', 'desconocido'], 'Género de mascota inválido')
    .required('El género de la mascota es requerido'),
  pet_age: Yup.string()
    .oneOf(['cachorro', 'joven', 'adulto', 'senior', 'desconocido'], 'Edad de mascota inválida')
    .required('La edad de la mascota es requerida'),
  pet_color: Yup.string()
    .max(50, 'El color no puede tener más de 50 caracteres'),
  address: Yup.string()
    .max(200, 'La dirección no puede tener más de 200 caracteres'),
  latitude: Yup.number()
    .nullable(),
  longitude: Yup.number()
    .nullable(),
  status: Yup.string()
    .oneOf(['activo', 'inactivo', 'encontrado', 'adoptado'], 'Estado inválido')
    .required('El estado es requerido'),
});

// Define the steps for the form stepper
const steps = ['Datos básicos', 'Características', 'Ubicación', 'Estado y fotos'];

interface EditPetProps {
  pet: Pet;
  error?: string;
}

export default function EditPet({ pet, error: serverError }: EditPetProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(serverError || '');
  const [success, setSuccess] = useState(false);
  
  // Set initial preview URL from pet image
  useEffect(() => {
    if (pet && pet.image_url && !previewUrl) {
      setPreviewUrl(getImageUrl(pet.image_url));
    }
  }, [pet, previewUrl]);
  
  // Define form with Formik
  const formik = useFormik({
    initialValues: {
      title: pet?.title || '',
      description: pet?.description || '',
      pet_type: pet?.pet_type || '',
      pet_size: pet?.pet_size || '',
      pet_gender: pet?.pet_gender || '',
      pet_age: pet?.pet_age || '',
      pet_color: pet?.pet_color || '',
      address: pet?.address || '',
      latitude: pet?.latitude || null,
      longitude: pet?.longitude || null,
      status: pet?.status || 'activo',
    },
    validationSchema: petSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        
        await updatePet(pet.id, values, newImage || undefined);
        
        setSuccess(true);
        setTimeout(() => {
          router.push(\`/pets/\${pet.id}\`);
        }, 2000);
      } catch (err: any) {
        console.error('Error updating pet:', err);
        setError(err.message || 'Error al actualizar la publicación. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    },
  });
  
  // Image upload dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      const file = acceptedFiles[0];
      setNewImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    maxFiles: 1,
  });
  
  // Remove the image
  const removeImage = () => {
    setNewImage(null);
    // Restore original image if available
    if (pet?.image_url) {
      setPreviewUrl(getImageUrl(pet.image_url));
    } else {
      setPreviewUrl(null);
    }
  };
  
  // Handle location selection
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    formik.setFieldValue('latitude', lat);
    formik.setFieldValue('longitude', lng);
    formik.setFieldValue('address', address);
  };
  
  // Step navigation
  const handleNext = () => {
    // Validate current step fields
    const fieldsToValidate: {[key: number]: string[]} = {
      0: ['title', 'description', 'pet_type'],
      1: ['pet_size', 'pet_gender', 'pet_age', 'pet_color'],
      // Step 2 (location) is optional
    };
    
    const currentFieldsToValidate = fieldsToValidate[activeStep] || [];
    
    if (currentFieldsToValidate.length > 0) {
      // Touch the fields so errors show
      currentFieldsToValidate.forEach(field => {
        formik.setFieldTouched(field, true);
      });
      
      // Validate only these fields
      const errors = currentFieldsToValidate
        .filter(field => formik.errors[field as keyof typeof formik.errors])
        .map(field => formik.errors[field as keyof typeof formik.errors]);
      
      if (errors.length > 0) {
        return;
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Render different form steps
  const renderStep = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Título"
                placeholder="Ej: Perro labrador encontrado en el parque"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={formik.touched.pet_type && Boolean(formik.errors.pet_type)}>
                <InputLabel id="pet-type-label">Tipo de mascota</InputLabel>
                <Select
                  labelId="pet-type-label"
                  id="pet_type"
                  name="pet_type"
                  value={formik.values.pet_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Tipo de mascota"
                  disabled={loading}
                >
                  <MenuItem value="perro">Perro</MenuItem>
                  <MenuItem value="gato">Gato</MenuItem>
                  <MenuItem value="ave">Ave</MenuItem>
                  <MenuItem value="conejo">Conejo</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </Select>
                <FormHelperText>
                  {formik.touched.pet_type && formik.errors.pet_type}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Descripción"
                placeholder="Describe las características de la mascota, dónde fue encontrada, etc."
                multiline
                rows={6}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                disabled={loading}
              />
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.pet_size && Boolean(formik.errors.pet_size)}>
                <InputLabel id="pet-size-label">Tamaño</InputLabel>
                <Select
                  labelId="pet-size-label"
                  id="pet_size"
                  name="pet_size"
                  value={formik.values.pet_size}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Tamaño"
                  disabled={loading}
                >
                  <MenuItem value="pequeño">Pequeño</MenuItem>
                  <MenuItem value="mediano">Mediano</MenuItem>
                  <MenuItem value="grande">Grande</MenuItem>
                </Select>
                <FormHelperText>
                  {formik.touched.pet_size && formik.errors.pet_size}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.pet_gender && Boolean(formik.errors.pet_gender)}>
                <InputLabel id="pet-gender-label">Género</InputLabel>
                <Select
                  labelId="pet-gender-label"
                  id="pet_gender"
                  name="pet_gender"
                  value={formik.values.pet_gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Género"
                  disabled={loading}
                >
                  <MenuItem value="macho">Macho</MenuItem>
                  <MenuItem value="hembra">Hembra</MenuItem>
                  <MenuItem value="desconocido">Desconocido</MenuItem>
                </Select>
                <FormHelperText>
                  {formik.touched.pet_gender && formik.errors.pet_gender}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.pet_age && Boolean(formik.errors.pet_age)}>
                <InputLabel id="pet-age-label">Edad aproximada</InputLabel>
                <Select
                  labelId="pet-age-label"
                  id="pet_age"
                  name="pet_age"
                  value={formik.values.pet_age}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Edad aproximada"
                  disabled={loading}
                >
                  <MenuItem value="cachorro">Cachorro</MenuItem>
                  <MenuItem value="joven">Joven</MenuItem>
                  <MenuItem value="adulto">Adulto</MenuItem>
                  <MenuItem value="senior">Senior</MenuItem>
                  <MenuItem value="desconocido">Desconocido</MenuItem>
                </Select>
                <FormHelperText>
                  {formik.touched.pet_age && formik.errors.pet_age}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="pet_color"
                name="pet_color"
                label="Color"
                placeholder="Ej: Marrón y blanco"
                value={formik.values.pet_color}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.pet_color && Boolean(formik.errors.pet_color)}
                helperText={formik.touched.pet_color && formik.errors.pet_color}
                disabled={loading}
              />
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                name="address"
                label="Dirección"
                placeholder="Ingresa una dirección o selecciona en el mapa"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  height: 400, 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <LocationPicker 
                  onLocationSelect={handleLocationSelect} 
                  initialPosition={
                    formik.values.latitude && formik.values.longitude
                      ? { lat: formik.values.latitude, lng: formik.values.longitude }
                      : undefined
                  }
                />
              </Paper>
              
              <FormHelperText>
                La ubicación nos ayuda a que otras personas puedan encontrar más fácilmente a la mascota.
              </FormHelperText>
            </Grid>
          </Grid>
        );
      
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                <InputLabel id="status-label">Estado de la publicación</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Estado de la publicación"
                  disabled={loading}
                >
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="inactivo">Inactivo</MenuItem>
                  <MenuItem value="encontrado">Encontrado</MenuItem>
                  <MenuItem value="adoptado">Adoptado</MenuItem>
                </Select>
                <FormHelperText>
                  {formik.touched.status && formik.errors.status}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Imagen principal
              </Typography>
              
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                  transition: 'all 0.2s',
                  mb: 3
                }}
              >
                <input {...getInputProps()} />
                <PhotoCameraIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                
                <Typography variant="body1" gutterBottom>
                  {isDragActive ? 'Suelta la imagen aquí' : 'Arrastra una nueva imagen o haz clic para seleccionar'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Puedes cambiar la imagen principal (máximo 5MB)
                </Typography>
                
                <Button
                  variant="contained"
                  startIcon={<PhotoCameraIcon />}
                  sx={{ mt: 2 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Seleccionar imagen
                </Button>
              </Box>
              
              {previewUrl && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Vista previa:
                  </Typography>
                  
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 300,
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: 2,
                    }}
                  >
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                    
                    {newImage && (
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          bgcolor: 'background.paper',
                          '&:hover': {
                            bgcolor: 'background.default',
                          },
                        }}
                        onClick={removeImage}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        );
      
      default:
        return null;
    }
  };

  // If no pet data is available
  if (!pet) {
    return (
      <AuthMiddleware>
        <MainLayout>
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Mascota no encontrada
            </Typography>
            <Typography variant="body1" paragraph>
              La mascota que intentas editar no existe o no tienes acceso a ella.
            </Typography>
            <Button 
              component={Link} 
              href="/my-pets" 
              variant="contained"
              startIcon={<ArrowBackIcon />}
            >
              Volver a mis mascotas
            </Button>
          </Box>
        </MainLayout>
      </AuthMiddleware>
    );
  }

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
            <Link href="/my-pets" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <PetsIcon sx={{ mr: 0.5 }} fontSize="small" />
              Mis Publicaciones
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              Editar Publicación
            </Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
            Editar Publicación
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 4 }}
              icon={<CheckIcon fontSize="inherit" />}
            >
              ¡Publicación actualizada exitosamente! Redirigiendo...
            </Alert>
          )}
          
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel={!isMobile}
              orientation={isMobile ? 'vertical' : 'horizontal'}
              sx={{ mb: 4 }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Divider sx={{ mb: 4 }} />
            
            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ mb: 4 }}>
                {renderStep(activeStep)}
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0 || loading}
                  startIcon={<NavigateBeforeIcon />}
                >
                  Atrás
                </Button>
                
                <Box>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={loading || success}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    >
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={loading || success}
                      endIcon={<NavigateNextIcon />}
                    >
                      Siguiente
                    </Button>
                  )}
                </Box>
              </Box>
            </form>
          </Paper>
        </Box>
      </MainLayout>
    </AuthMiddleware>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerSupabaseClient();
  const { id } = context.params || {};
  
  // Check if user is authenticated on the server
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // If no session, redirect to login
  if (!session) {
    return {
      redirect: {
        destination: '/login?redirectTo=/pets/edit/' + id,
        permanent: false,
      },
    };
  }
  
  try {
    // Get the pet
    const { data: pet, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    // Check if the user is the owner or an admin
    if (pet.user_id !== session.user.id) {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
      
      if (!profile?.is_admin) {
        return {
          redirect: {
            destination: '/my-pets',
            permanent: false,
          },
        };
      }
    }
    
    return {
      props: {
        pet,
      },
    };
  } catch (error: any) {
    console.error(`Error fetching pet with ID ${id}:`, error.message);
    
    return {
      props: {
        pet: null,
        error: 'Error al cargar la información de la mascota'
      },
    };
  }
};
