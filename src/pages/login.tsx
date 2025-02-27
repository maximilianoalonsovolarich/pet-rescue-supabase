import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
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
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Card,
  Fade,
  Divider
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// Validation schema
const loginSchema = Yup.object({
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        setLoginError('');
        await signIn(values.email, values.password);
        router.push('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
        setLoginError('Email o contraseña incorrectos');
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

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
                  <LockOutlinedIcon fontSize="large" />
                </Avatar>
                <Typography component="h1" variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                  Iniciar Sesión
                </Typography>
              </Box>
              
              {loginError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {loginError}
                </Alert>
              )}
              
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
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Box sx={{ textAlign: 'right', mt: 1 }}>
                  <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary.main">
                      ¿Olvidaste tu contraseña?
                    </Typography>
                  </Link>
                </Box>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={formik.isSubmitting}
                  endIcon={formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                >
                  {formik.isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
                
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    o
                  </Typography>
                </Divider>
                
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={12} textAlign="center">
                    <Link href="/register" style={{ textDecoration: 'none' }}>
                      <Typography variant="body2" color="primary" fontWeight={500}>
                        {"¿No tienes una cuenta? Regístrate"}
                      </Typography>
                    </Link>
                  </Grid>
                </Grid>
                
                <Box mt={4}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2" align="center">
                      Para la cuenta admin, usa:<br />
                      <strong>codemaxon@gmail.com / admin123</strong>
                    </Typography>
                  </Alert>
                </Box>
              </Box>
            </Card>
          </Fade>
        </Box>
      </Grid>
    </Grid>
  );
}
