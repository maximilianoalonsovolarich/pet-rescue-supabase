import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { supabase } from '@/lib/supabase';

const EnvDebug: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setLoading(true);
        
        // Try a simple query to check if we can connect
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        
        if (error) {
          throw error;
        }
        
        setConnected(true);
        setError(null);
      } catch (err: any) {
        setConnected(false);
        setError(err.message || 'Error connecting to Supabase');
      } finally {
        setLoading(false);
      }
    };
    
    checkConnection();
  }, []);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKeyPartial = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5)}...` 
    : 'Not set';
  
  return (
    <Paper sx={{ p: 2, mt: 2, backgroundColor: 'rgba(0,0,0,0.03)' }}>
      <Typography variant="subtitle2" gutterBottom>
        Diagnóstico de Conexión
      </Typography>
      
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2">
          <strong>URL:</strong> {supabaseUrl || 'No configurada'}
        </Typography>
        <Typography variant="body2">
          <strong>API Key:</strong> {supabaseKeyPartial}
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <Typography variant="body2">Verificando conexión...</Typography>
          </Box>
        ) : connected ? (
          <Alert severity="success" sx={{ mt: 1 }} icon={false}>
            Conexión establecida con Supabase
          </Alert>
        ) : (
          <Alert severity="error" sx={{ mt: 1 }} icon={false}>
            Error de conexión: {error}
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default EnvDebug;