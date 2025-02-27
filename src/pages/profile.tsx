import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  IconButton,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import AuthMiddleware from '@/middlewares/AuthMiddleware';

// Validation schema
const profileSchema = Yup.object({
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre es requerido'),
  phone: Yup.string()
    .matches(/^[0-9\s+\-()]{8,15}$/, 'Número de teléfono inválido')
    .nullable(),
});

export default function Profile() {
  const { user, profile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'success' });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Set preview URL based on existing profile image
    if (profile?.profile_image) {
      const url = \`\${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-images/\${profile.profile_image}\`;
      setPreviewUrl(url);
    }
  }, [profile]);

  const formik = useFormik({
    initialValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
    },
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        // Upload profile image if selected
        let profileImagePath = profile?.profile_image;
        
        if (profileImage) {
          setUploading(true);
          const imagePath = \`\${user!.id}/\${Date.now()}\`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-images')
            .upload(imagePath, profileImage, {
              cacheControl: '3600',
              upsert: false,
            });
          
          if (uploadError) {
            throw uploadError;
          }
          
          // Delete old profile image if exists
          if (profile?.profile_image) {
            await supabase.storage
              .from('profile-images')
              .remove([profile.profile_image]);
          }
          
          profileImagePath = imagePath;
          setUploading(false);
        }
        
        // Update profile
        await updateUserProfile({
          name: values.name,
          phone: values.phone || null,
          profile_image: profileImagePath,
        });
        
        setMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
        setOpenSnackbar(true);
      } catch (error) {
        console.error('Error updating profile:', error);
        setMessage({ text: 'Error al actualizar el perfil', type: 'error' });
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProfileImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreviewUrl(null);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (!user || !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <AuthMiddleware>
      <MainLayout>
        <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
            Mi Perfil
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card elevation={3} sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Avatar
                      src={previewUrl || undefined}
                      alt={profile.name}
                      sx={{ width: 120, height: 120, mb: 2, boxShadow: 3 }}
                    >
                      {profile.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <label htmlFor="icon-button-file">
                      <input
                        accept="image/*"
                        id="icon-button-file"
                        type="file"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                      <IconButton
                        color="primary"
                        aria-label="upload picture"
                        component="span"
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          right: 0,
                          backgroundColor: 'background.paper',
                          boxShadow: 2,
                          '&:hover': { backgroundColor: 'background.default' }
                        }}
                      >
                        <PhotoCameraIcon />
                      </IconButton>
                    </label>
                    
                    {previewUrl && (
                      <IconButton
                        color="error"
                        aria-label="remove picture"
                        onClick={handleRemoveImage}
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          left: 0,
                          backgroundColor: 'background.paper',
                          boxShadow: 2,
                          '&:hover': { backgroundColor: 'background.default' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    {profile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profile.email}
                  </Typography>
                  
                  {profile.phone && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {profile.phone}
                    </Typography>
                  )}
                  
                  {profile.is_admin && (
                    <Alert severity="info" sx={{ mt: 2, width: '100%' }}>
                      Tienes permisos de administrador
                    </Alert>
                  )}
                </CardContent>
              </Card>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => router.push('/dashboard')}
                sx={{ mt: 2 }}
              >
                Ir al Tablero
              </Button>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <EditIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                    Editar Información
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 4 }} />
                
                <Box component="form" onSubmit={formik.handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="name"
                        name="name"
                        label="Nombre completo"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                        disabled={loading}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="email"
                        name="email"
                        label="Correo electrónico"
                        value={profile.email}
                        disabled
                        helperText="No se puede cambiar el correo electrónico"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="phone"
                        name="phone"
                        label="Teléfono"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={
                          (formik.touched.phone && formik.errors.phone) || 
                          "Recomendamos añadir un teléfono para que puedan contactarte"
                        }
                        disabled={loading}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={loading || uploading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    >
                      {loading ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={message.type === 'success' ? 'success' : 'error'} 
              sx={{ width: '100%' }}
            >
              {message.text}
            </Alert>
          </Snackbar>
        </Box>
      </MainLayout>
    </AuthMiddleware>
  );
}
