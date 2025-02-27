import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Pet } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Divider,
  Skeleton,
  Stack,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Pets as PetsIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Visibility as VisibilityIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';

interface PetCardProps {
  pet: Pet;
  isLoading?: boolean;
  withActions?: boolean;
  onClick?: () => void;
}

const PetCard: React.FC<PetCardProps> = ({ 
  pet, 
  isLoading = false, 
  withActions = true, 
  onClick 
}) => {
  const [elevation, setElevation] = useState(2);

  // Function to get pet type display name
  const getPetTypeName = (type: Pet['pet_type']) => {
    switch(type) {
      case 'perro': return 'Perro';
      case 'gato': return 'Gato';
      case 'ave': return 'Ave';
      case 'conejo': return 'Conejo';
      case 'otro': return 'Otro';
      default: return type;
    }
  };

  // Calculate time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Hace un momento';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    }
    
    return `${date.toLocaleDateString('es-ES')}`;
  };

  // Get status chip color
  const getStatusColor = (status: Pet['status']) => {
    switch(status) {
      case 'activo': return 'success';
      case 'inactivo': return 'warning';
      case 'encontrado': return 'info';
      case 'adoptado': return 'secondary';
      default: return 'default';
    }
  };

  // Get status display name
  const getStatusName = (status: Pet['status']) => {
    switch(status) {
      case 'activo': return 'Activo';
      case 'inactivo': return 'Inactivo';
      case 'encontrado': return 'Encontrado';
      case 'adoptado': return 'Adoptado';
      default: return status;
    }
  };

  // loading skeleton
  if (isLoading) {
    return (
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 3,
        }}
      >
        <Skeleton variant="rectangular" height={220} animation="wave" />
        <CardContent>
          <Skeleton variant="text" height={40} width="80%" animation="wave" />
          <Skeleton variant="text" height={20} animation="wave" />
          <Skeleton variant="text" height={20} animation="wave" />
          <Skeleton variant="text" height={20} width="60%" animation="wave" />
        </CardContent>
        <CardActions>
          <Skeleton variant="rectangular" height={36} width={100} animation="wave" />
          <Box sx={{ flexGrow: 1 }} />
          <Skeleton variant="rectangular" height={36} width={100} animation="wave" />
        </CardActions>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s',
        transform: elevation === 5 ? 'translateY(-8px)' : 'none',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default'
      }}
      elevation={elevation}
      onMouseEnter={() => setElevation(5)}
      onMouseLeave={() => setElevation(2)}
      onClick={onClick}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="div"
          sx={{ 
            position: 'relative', 
            height: 220,
            transition: 'transform 0.5s',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        >
          <Image
            src={pet.image_url 
              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pet-images/${pet.image_url}` 
              : 'https://source.unsplash.com/random?pet'}
            alt={pet.title}
            fill
            style={{ objectFit: 'cover' }}
          />
        </CardMedia>
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10,
            display: 'flex',
            gap: 1
          }}
        >
          <Chip 
            icon={<PetsIcon />} 
            label={getPetTypeName(pet.pet_type)} 
            color={pet.pet_type === 'perro' ? 'primary' : pet.pet_type === 'gato' ? 'secondary' : 'default'}
            size="small"
            sx={{ 
              fontWeight: 'bold',
              background: pet.pet_type === 'perro' ? 'rgba(63, 81, 181, 0.85)' : 
                          pet.pet_type === 'gato' ? 'rgba(245, 0, 87, 0.85)' : 
                          'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              color: 'white'
            }}
          />
        </Box>
        
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            display: 'flex',
            gap: 1
          }}
        >
          {pet.pet_size && (
            <Chip 
              label={pet.pet_size.charAt(0).toUpperCase() + pet.pet_size.slice(1)} 
              size="small"
              sx={{ 
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                backdropFilter: 'blur(4px)'
              }}
            />
          )}
          
          <Chip 
            label={getStatusName(pet.status)} 
            color={getStatusColor(pet.status)}
            size="small"
            sx={{ 
              backdropFilter: 'blur(4px)',
            }}
          />
        </Box>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography 
          gutterBottom 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 600,
            display: '-webkit-box',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {pet.title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2, 
            minHeight: 60, 
            display: '-webkit-box',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {pet.description}
        </Typography>
        
        <Stack spacing={1} sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimeIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
            <Typography variant="body2" color="text.secondary">
              {getTimeAgo(pet.created_at)}
            </Typography>
          </Box>
          
          {pet.address && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <LocationIcon color="action" sx={{ mr: 1, fontSize: 18, mt: 0.3 }} />
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {pet.address}
              </Typography>
            </Box>
          )}
          
          {pet.views > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VisibilityIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
              <Typography variant="body2" color="text.secondary">
                {pet.views} {pet.views === 1 ? 'vista' : 'vistas'}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
      
      {withActions && (
        <>
          <Divider />
          <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
            <Tooltip title="Me gusta">
              <IconButton
                size="small" 
                color="secondary"
                aria-label="añadir a favoritos"
              >
                <FavoriteBorderIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Button 
              component={Link} 
              href={`/pets/${pet.id}`}
              variant="contained"
              color="primary"
              size="small"
              endIcon={<VisibilityIcon />}
            >
              Ver Más
            </Button>
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default PetCard;
