import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Avatar,
  Button,
  TextField,
  Paper,
  Box,
  Grid,
  Typography,
  Alert,
  InputAdornment,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Card,
  Fade
} from '@mui/material';
import {
  LockReset as LockResetIcon,
  Email as EmailIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// Validation schema
const resetSchema = Yup.object({
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
});

export default function ForgotPassword() {
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const { resetPassword, loading: authLoading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: resetSchema,
    onSubmit: async (values) => {
      try {
        setResetError('');
        await resetPassword(values.email);
        setResetSent(true);
      } catch (error) {
        console.error('Password reset error:', error);
        setResetError('No se pudo enviar el correo de recuperación. Intenta de nuevo.');
      }
    },
  });

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container component="main" sx={{ height: { xs: 'auto', md: '100vh' } }}>
      <Grid
        item
        xs={false}
        sm={false}
        md={7}
        lg={8}
        sx={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1548681528-6a5c45b66b42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&h=900&q=80)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: { xs: 'none', md: 'block' },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: 'white',
            padding: 4
          }}
        >
          <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
            Pet Rescue
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 500 }}>
            Una plataforma para encontrar y ayudar a mascotas callejeras o perdidas.
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={12} md={5} lg={4} component={Paper} elevation={0} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center'
          }}
        >
          <Fade in={true} timeout={800}>
            <Card 
              sx={{ 
                p: 4, 
                maxWidth: 450, 
                width: '100%',
                boxShadow: theme.shadows[8],
                borderRadius: 2
              }}
            >
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main', mx: 'auto', width: 56, height: 56 }}>
                  <LockResetIcon fontSize="large" />
                </Avatar>
                <Typography component="h1" variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                  Recuperar Contraseña
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                  Te enviaremos un correo para restablecer tu contraseña
                </Typography>
              </Box>
              
              {resetError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {resetError}
                </Alert>
              )}
              
              {resetSent ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Se ha enviado un correo de recuperación a la dirección proporcionada. 
                  Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
                </Alert>
              ) : (
                <Box component="form" noValidate onSubmit={formik.handleSubmit}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Correo Electrónico"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                    disabled={formik.isSubmitting}
                    endIcon={formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                  >
                    {formik.isSubmitting ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                  </Button>
                </Box>
              )}
              
              <Grid container spacing={1} alignItems="center" sx={{ mt: 2 }}>
                <Grid item xs={12} textAlign="center">
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary" fontWeight={500}>
                      Volver a Iniciar Sesión
                    </Typography>
                  </Link>
                </Grid>
              </Grid>
            </Card>
          </Fade>
        </Box>
      </Grid>
    </Grid>
  );
}