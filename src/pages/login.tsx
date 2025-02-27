import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';

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
  useTheme,
  useMediaQuery,
  CircularProgress,
  Card,
  FormControlLabel,
  Checkbox
} from '@mui/material';

// Icons
import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  
  const { signIn } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { darkMode } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      return setError('Por favor complete todos los campos');
    }
    
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      
      // Check for redirect param
      const redirectPath = router.query.redirect as string;
      router.push(redirectPath || '/dashboard');
    } catch (error: any) {
      const errorMessage = error.message || 'Error al iniciar sesión';
      setError(
        errorMessage.includes('Invalid login') ? 
          'Credenciales inválidas. Por favor verifique su email y contraseña.' : 
          errorMessage
      );
    } finally {
      setLoading(false);
    }
  };
  
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
            src="https://source.unsplash.com/collection/542909/1600x900"
            alt="Pets"
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
              Pet Rescue
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 500 }}>
              Una plataforma para encontrar y ayudar a mascotas callejeras o perdidas.
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ py: 2 }}>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
            Iniciar Sesión
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
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
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Recordarme"
                checked={remember}
                onChange={(e, checked) => setRemember(checked)}
              />
              
              <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  ¿Olvidaste tu contraseña?
                </Typography>
              </Link>
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Typography 
                  variant="body2" 
                  align="center"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  ¿No tienes una cuenta?{' '}
                  <Link href="/register" style={{ textDecoration: 'none', color: theme.palette.primary.main, fontWeight: 600 }}>
                    Regístrate aquí
                  </Link>
                </Typography>
              </Grid>
            </Grid>
            
            <Card 
              variant="outlined" 
              sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderRadius: 2
              }}
            >
              <Typography variant="body2" align="center" color="text.secondary">
                Credenciales de demostración:
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Usuario
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    usuario@ejemplo.com
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Contraseña
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    usuario123
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" display="block" align="center" color="text.secondary" sx={{ mt: 1 }}>
                Para acceso administrativo: <strong>codemaxon@gmail.com / admin123</strong>
              </Typography>
            </Card>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
