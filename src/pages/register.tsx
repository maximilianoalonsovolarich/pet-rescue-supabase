import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Material UI
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
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery,
  Checkbox,
  FormControlLabel
} from '@mui/material';

// Icons
import {
  PersonAdd as PersonAddIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Person as PersonIcon,
  Lock as LockIcon
} from '@mui/icons-material';

// Validation schema
const validationSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: yup
    .string()
    .email('Ingresa un correo electrónico válido')
    .required('El correo electrónico es requerido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Debes confirmar la contraseña'),
  agreeToTerms: yup
    .boolean()
    .oneOf([true], 'Debes aceptar los términos y condiciones')
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signUp } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError('');
        setSuccess('');
        
        await signUp(values.email, values.password, values.name);
        
        setSuccess('¡Registro exitoso! Redireccionando al tablero...');
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } catch (error: any) {
        const errorMessage = error.message || 'Error durante el registro';
        
        if (errorMessage.includes('already exists')) {
          setError('Este correo electrónico ya está registrado. Por favor intenta con otro.');
        } else {
          setError(errorMessage);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Grid container component="main" sx={{ height: { xs: 'auto', sm: '80vh' }, minHeight: { xs: '100vh', sm: '600px' } }}>
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          position: 'relative',
          display: { xs: 'none', sm: 'block' }
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image
            src="https://source.unsplash.com/random?animals"
            alt="Animals"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 1
            }}
          />
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
              Únete a Pet Rescue
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 500 }}>
              Crea una cuenta para ayudar a mascotas perdidas o callejeras a encontrar un hogar.
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ py: 2 }}>
        <Box
          sx={{
            my: 4,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <PersonAddIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
            Registro de Usuario
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              {success}
            </Alert>
          )}
          
          <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Nombre Completo"
                  autoComplete="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Correo Electrónico"
                  autoComplete="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirmar Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="agreeToTerms"
                      name="agreeToTerms"
                      color="primary"
                      checked={formik.values.agreeToTerms}
                      onChange={formik.handleChange}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Acepto los términos y condiciones de servicio
                    </Typography>
                  }
                />
                {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
                  <Typography variant="caption" color="error">
                    {formik.errors.agreeToTerms}
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={formik.isSubmitting}
              startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {formik.isSubmitting ? 'Registrando...' : 'Registrarse'}
            </Button>
          </Box>
          
          <Divider sx={{ width: '100%', my: 2 }} />
            
          <Typography variant="body2" color="text.secondary">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" style={{ textDecoration: 'none', color: theme.palette.primary.main, fontWeight: 600 }}>
              Inicia sesión aquí
            </Link>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
