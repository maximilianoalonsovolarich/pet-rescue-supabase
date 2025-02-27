import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase';
import { GetServerSideProps } from 'next';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  Container,
  Divider,
  Paper
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';

interface DirectLoginProps {
  adminId?: string;
  adminExists: boolean;
  error?: string;
}

export default function DirectLogin({ adminId, adminExists, error: serverError }: DirectLoginProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(serverError || null);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  // Función para iniciar sesión directamente como administrador
  const loginAsAdmin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Iniciar sesión con las credenciales fijas del administrador
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'codemaxon@gmail.com',
        password: 'admin123'
      });
      
      if (error) throw error;
      
      setSuccess(true);
      setUserData(data);
      
      // Redirigir al dashboard después de un breve retraso
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
      
    } catch (err: any) {
      console.error('Error de inicio de sesión:', err);
      setError(err.message || 'Error al iniciar sesión');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ p: 4, borderRadius: 2, boxShadow: 5 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <LoginIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h5" component="h1" fontWeight="bold">
            Acceso Directo de Administrador
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {!adminExists ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            No se encontró ningún usuario administrador en la base de datos. 
            Por favor, ejecuta el script SQL para crear el usuario administrador primero.
          </Alert>
        ) : (
          <>
            <Typography variant="body1" paragraph>
              Esta página te permite iniciar sesión directamente como administrador sin pasar por la pantalla de login estándar.
            </Typography>
            
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="body2">
                <strong>Email:</strong> codemaxon@gmail.com
              </Typography>
              <Typography variant="body2">
                <strong>Contraseña:</strong> admin123
              </Typography>
              {adminId && (
                <Typography variant="body2">
                  <strong>ID:</strong> {adminId}
                </Typography>
              )}
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Inicio de sesión exitoso. Redirigiendo al panel de administración...
              </Alert>
            )}
            
            {userData && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default', fontSize: '0.8rem', maxHeight: 150, overflow: 'auto' }}>
                <pre>{JSON.stringify(userData, null, 2)}</pre>
              </Paper>
            )}
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={loginAsAdmin}
              disabled={loading || success}
              fullWidth
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión como Admin'}
            </Button>
          </>
        )}
        
        <Box mt={4}>
          <Typography variant="body2" color="text.secondary">
            Nota: Esta página es solo para uso administrativo durante la configuración del sistema.
            No compartas esta URL con usuarios no autorizados.
          </Typography>
        </Box>
      </Card>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Crear cliente de Supabase con permisos de admin
    const supabase = createServerSupabaseClient();
    
    // Verificar si existe el usuario administrador
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'codemaxon@gmail.com')
      .eq('is_admin', true)
      .single();
    
    if (adminError && adminError.code !== 'PGRST116') {
      throw adminError;
    }
    
    return {
      props: {
        adminExists: !!adminData,
        adminId: adminData?.id || null
      }
    };
  } catch (error: any) {
    console.error("Error en getServerSideProps:", error);
    return {
      props: {
        adminExists: false,
        error: error.message || "Error al verificar el usuario administrador"
      }
    };
  }
};