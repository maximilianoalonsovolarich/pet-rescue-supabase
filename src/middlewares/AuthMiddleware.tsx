import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface AuthMiddlewareProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (adminOnly && !isAdmin) {
        router.push('/');
      }
    }
  }, [user, loading, router, adminOnly, isAdmin]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (!user || (adminOnly && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
};

export default AuthMiddleware;
