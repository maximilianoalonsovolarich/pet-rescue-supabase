import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '@/lib/supabase';
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
  Fade
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// Validation schema
const resetSchema = Yup.object({
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: resetSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setResetError('');
        
        const { data, error } = await supabase.auth.updateUser({
          password: values.password,
        });
        
        if (error) {
          throw error;
        }
        
        setResetSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (error) {
        console.error('Reset password error:', error);
        setResetError('No se pudo actualizar la contraseña. Es posible que el enlace haya expirado.');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    // Verify the recovery token is present in the URL
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // Remove the '#'
    
    if (!params.get('access_token')) {
      setResetError('Enlace de recuperación inválido o expirado');
    }
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
                  Actualizar Contraseña
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                  Ingresa tu nueva contraseña
                </Typography>
              </Box>
              
              {resetError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {resetError}
                </Alert>
              )}
              
              {resetSuccess ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Tu contraseña se ha actualizado correctamente. Serás redirigido al inicio de sesión.
                </Alert>
              ) : (
                <Box component="form" noValidate onSubmit={formik.handleSubmit}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Nueva Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
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
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirmar Contraseña"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleClickShowConfirmPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                    disabled={loading || Boolean(resetError)}
                    endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
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