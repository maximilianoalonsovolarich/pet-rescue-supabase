import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Card,
  Container
} from '@mui/material';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';

export default function CreateAdmin() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [adminExists, setAdminExists] = useState(false);

  // Check if admin already exists
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'codemaxon@gmail.com')
          .eq('is_admin', true)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking admin:', error);
          return;
        }
        
        if (data) {
          setAdminExists(true);
          setUserInfo(data);
        }
      } catch (error) {
        console.error('Error checking admin:', error);
      }
    };
    
    checkAdmin();
  }, []);

  const createAdminUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Create the user through Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'codemaxon@gmail.com',
        password: 'admin123',
        options: {
          data: {
            full_name: 'Admin User',
          },
        }
      });
      
      if (authError) {
        throw new Error(`Error creating auth user: ${authError.message}`);
      }
      
      // 2. Update the profile to be an admin
      if (authData.user) {
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', authData.user.id);
        
        if (profileError) {
          throw new Error(`Error updating profile: ${profileError.message}`);
        }
        
        // Fetch the complete user info
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        setSuccess(true);
        setUserInfo(profile);
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      setError(error.message || 'Something went wrong');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };
  
  const resetAdminPassword = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the password reset functionality
      const { error } = await supabase.auth.resetPasswordForEmail('codemaxon@gmail.com', {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      setError('Se ha enviado un correo de recuperación de contraseña');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setError(error.message || 'Error al restablecer contraseña');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ p: 4, borderRadius: 2, boxShadow: 5 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <AdminIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h5" component="h1" fontWeight="bold">
            Crear Usuario Administrador
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {adminExists ? (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              El usuario administrador ya existe
            </Alert>
            
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" gutterBottom>
                Información del administrador:
              </Typography>
              <Typography variant="body2">
                <strong>ID:</strong> {userInfo?.id}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {userInfo?.email}
              </Typography>
              <Typography variant="body2">
                <strong>Nombre:</strong> {userInfo?.name || 'Admin User'}
              </Typography>
              <Typography variant="body2">
                <strong>Es admin:</strong> {userInfo?.is_admin ? 'Sí' : 'No'}
              </Typography>
            </Paper>
            
            <Typography variant="body2" paragraph>
              Si no puedes iniciar sesión con este usuario, puedes enviar un correo de recuperación
              para restablecer la contraseña:
            </Typography>
            
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={resetAdminPassword}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Enviar correo de recuperación'}
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body1" paragraph>
              Esta página te permite crear un usuario administrador con las siguientes credenciales:
            </Typography>
            
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="body2">
                <strong>Email:</strong> codemaxon@gmail.com
              </Typography>
              <Typography variant="body2">
                <strong>Contraseña:</strong> admin123
              </Typography>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Usuario administrador creado exitosamente
              </Alert>
            )}
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={createAdminUser}
              disabled={loading || success}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Crear Usuario Admin'}
            </Button>
          </>
        )}
        
        <Box mt={4}>
          <Typography variant="body2" color="text.secondary">
            Nota: Esta página solo debe ser usada durante la configuración inicial. Una vez creado el usuario administrador, 
            considera eliminar esta página o restringir su acceso.
          </Typography>
        </Box>
      </Card>
    </Container>
  );
}