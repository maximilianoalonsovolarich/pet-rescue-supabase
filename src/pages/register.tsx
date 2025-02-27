import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
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
  Stepper,
  Step,
  StepLabel,
  Stack
} from '@mui/material';
import {
  PersonAddAlt as PersonAddIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();
  
  // Password visibility toggle
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  // Handle form step navigation
  const handleNext = () => {
    // Validate first step
    if (activeStep === 0) {
      if (!name || !email) {
        setError('Por favor complete todos los campos obligatorios');
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Por favor ingrese un email válido');
        return;
      }
    }
    
    // Validate second step
    if (activeStep === 1) {
      if (!password || !confirmPassword) {
        setError('Por favor complete todos los campos obligatorios');
        return;
      }
      
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
    }
    
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Submit the form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      return setError('Por favor complete todos los campos obligatorios');
    }
    
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }
    
    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Register with supabase and create profile
      await signUp(email, password, name);
      
      // Successfully registered
      setActiveStep(3); // Move to success step
    } catch (error: any) {
      console.error('Error al registrar:', error);
      let message = 'Error al registrar usuario';
      
      if (error?.message?.includes('User already registered')) {
        message = 'El email ya está registrado';
      }
      
      setError(message);
      setActiveStep(0); // Go back to first step on error
    } finally {
      setLoading(false);
    }
  };
  
  // Redirect to dashboard after registration
  const handleContinue = () => {
    router.push('/login');
  };
  
  // Form steps content
  const steps = [
    {
      label: 'Información Personal',
      content: (
        <>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Nombre Completo"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </>
      )
    },
    {
      label: 'Contraseña',
      content: (
        <>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </>
      )
    },
    {
      label: 'Información de Contacto',
      content: (
        <>
          <TextField
            margin="normal"
            fullWidth
            name="phone"
            label="Teléfono (opcional)"
            id="phone"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            El teléfono es opcional pero permitirá a otros usuarios contactarte más fácilmente si publicas una mascota.
          </Alert>
        </>
      )
    },
    {
      label: 'Confirmación',
      content: (
        <Box sx={{ textAlign: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'success.main', mx: 'auto', width: 56, height: 56 }}>
            <PersonAddIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            ¡Registro exitoso!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Tu cuenta ha sido creada correctamente. Se envió un email de verificación a {email}.
          </Typography>
          <Alert severity="success" sx={{ mb: 2 }}>
            Revisa tu bandeja de entrada para activar tu cuenta y luego inicia sesión.
          </Alert>
        </Box>
      )
    }
  ];
  
  return (
    <Grid container component="main" sx={{ minHeight: '100vh' }}>
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
            src="https://source.unsplash.com/random?animals"
            alt="Mascotas"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 1
            }}
          />
        </Box>
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
            ¡Únete a Pet Rescue!
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 500 }}>
            Regístrate para ayudar a mascotas callejeras o perdidas a encontrar un hogar.
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <PersonAddIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mt: 2, mb: 4 }}>
            Registro
          </Typography>
          
          <Stepper activeStep={activeStep} alternativeLabel sx={{ width: '100%', mb: 4 }}>
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {/* Form content for each step */}
            {steps[activeStep].content}
            
            {/* Navigation buttons */}
            <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 3 }}>
              {activeStep > 0 && activeStep < 3 && (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={loading}
                  startIcon={<ArrowBackIcon />}
                >
                  Atrás
                </Button>
              )}
              
              {activeStep < 2 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                  sx={{ ml: 'auto' }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Siguiente
                </Button>
              )}
              
              {activeStep === 2 && (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ ml: 'auto' }}
                  endIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                >
                  {loading ? 'Registrando...' : 'Registrarse'}
                </Button>
              )}
              
              {activeStep === 3 && (
                <Button
                  variant="contained"
                  onClick={handleContinue}
                  fullWidth
                  color="primary"
                >
                  Ir a iniciar sesión
                </Button>
              )}
            </Stack>
            
            {/* Login link */}
            {activeStep < 3 && (
              <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                <Grid item>
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      {"¿Ya tienes una cuenta? Inicia sesión"}
                    </Typography>
                  </Link>
                </Grid>
              </Grid>
            )}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Register;
