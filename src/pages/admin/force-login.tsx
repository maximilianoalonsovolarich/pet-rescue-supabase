import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  Container,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
  BugReport as BugIcon
} from '@mui/icons-material';

// Esta página proporciona un método directo para iniciar sesión como administrador,
// evitando cualquier problema con el flujo normal de autenticación

export default function ForceLogin() {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: 'codemaxon@gmail.com',
    password: 'admin123'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [debugMode, setDebugMode] = useState(true);
  const [response, setResponse] = useState<any>(null);
  const router = useRouter();

  // Función para manejar el inicio de sesión directo
  const handleForceLogin = async () => {
    try {
      setLoading(true);
      setError('');
      setResponse(null);

      if (debugMode) {
        console.log('Intentando inicio de sesión con:', {
          email: credentials.email,
          password: credentials.password
        });
      }

      // Usar el método de autenticación directo de Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        setResponse({ error: error });
        throw error;
      }

      // Guardar respuesta para depuración
      setResponse(data);
      setSuccess(true);
      
      // Redireccionar después de un breve retraso
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err: any) {
      console.error('Error de inicio de sesión directo:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los campos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Alternar visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LoginIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h5" component="h1" fontWeight="bold">
            Inicio de Sesión Directo
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="body1" paragraph>
          Esta página utiliza un método directo para iniciar sesión como administrador, evitando posibles problemas con el flujo normal de autenticación.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ¡Inicio de sesión exitoso! Redirigiendo al panel de administración...
          </Alert>
        )}

        <Box component="form" sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleInputChange}
            disabled={loading || success}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Contraseña"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
            onChange={handleInputChange}
            disabled={loading || success}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleForceLogin}
            disabled={loading || success}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Iniciar Sesión como Admin'
            )}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Button
              component={Link}
              href="/login"
              variant="text"
            >
              Volver al login normal
            </Button>
            
            <FormControlLabel
              control={
                <Switch
                  checked={debugMode}
                  onChange={() => setDebugMode(!debugMode)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BugIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">Modo debug</Typography>
                </Box>
              }
            />
          </Box>
        </Box>

        {/* Sección de depuración */}
        {debugMode && response && (
          <Paper sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', overflow: 'auto', maxHeight: 300 }}>
            <Typography variant="subtitle2" gutterBottom>
              Respuesta de la API:
            </Typography>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </Paper>
        )}

        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            Credenciales de administrador:
            <br />
            Email: codemaxon@gmail.com
            <br />
            Contraseña: admin123
          </Typography>
        </Alert>
      </Card>
    </Container>
  );
}