import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MainLayout from '@/components/layouts/MainLayout';
import AuthMiddleware from '@/middlewares/AuthMiddleware';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';
import { createPet } from '@/services/petService';
import dynamic from 'next/dynamic';
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
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Pets as PetsIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
  Save as SaveIcon,
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
});

// Define the steps for the form stepper
const steps = ['Datos básicos', 'Características', 'Ubicación', 'Fotos'];

export default function CreatePet() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Define form with Formik
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      pet_type: '',
      pet_size: '',
      pet_gender: '',
      pet_age: '',
      pet_color: '',
      address: '',
      latitude: null as number | null,
      longitude: null as number | null,
    },
    validationSchema: petSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        
        if (images.length === 0) {
          throw new Error('Debes agregar al menos una foto de la mascota');
        }
        
        await createPet(values, images);
        
        setSuccess(true);
        setTimeout(() => {
          router.push('/my-pets');
        }, 2000);
      } catch (err: any) {
        console.error('Error creating pet:', err);
        setError(err.message || 'Error al crear la publicación. Intenta de nuevo.');
        setActiveStep(3); // Go to images step if that's where the error is
      } finally {
        setLoading(false);
      }
    },
  });
  
  // Image upload dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Limit to 5 images max
    const newImages = [...images, ...acceptedFiles].slice(0, 5);
    setImages(newImages);
    
    // Create preview URLs
    const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  }, [images]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    maxFiles: 5,
  });
  
  // Remove an image
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newPreviewUrls = [...previewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
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
                
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Puedes subir hasta 5 imágenes (máximo 5MB cada una)
                </Typography>
                
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Seleccionar imágenes
                </Button>
              </Box>
              
              {images.length > 0 ? (
                <Grid container spacing={2}>
                  {previewUrls.map((url, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Box
                        sx={{
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          height: 150,
                          boxShadow: 2,
                          '&:hover .delete-icon': {
                            opacity: 1,
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={url}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          alt={`Image ${index + 1}`}
                        />
                        <IconButton
                          className="delete-icon"
                          sx={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            bgcolor: 'background.paper',
                            opacity: 0.7,
                            transition: 'opacity 0.2s',
                            '&:hover': {
                              bgcolor: 'background.paper',
                              opacity: 1,
                            },
                          }}
                          size="small"
                          onClick={() => removeImage(index)}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                        
                        {/* Primera imagen badge */}
                        {index === 0 && (
                          <Chip
                            label="Principal"
                            size="small"
                            color="primary"
                            sx={{
                              position: 'absolute',
                              bottom: 5,
                              left: 5,
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Debes agregar al menos una imagen de la mascota
                </Alert>
              )}
            </Grid>
          </Grid>
        );
      
      default:
        return null;
    }
  };

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
              Publicar Mascota
            </Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
            Publicar Mascota
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
              ¡Publicación creada exitosamente! Redirigiendo...
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
                      {loading ? 'Publicando...' : 'Publicar Mascota'}
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
