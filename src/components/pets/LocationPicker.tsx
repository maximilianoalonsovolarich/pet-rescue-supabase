import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Button,
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  MyLocation as MyLocationIcon,
  Search as SearchIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';

// Fix for marker icons in Next.js
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icon issue in Next.js
const fixLeafletIcon = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl.src,
    iconUrl: iconUrl.src,
    shadowUrl: shadowUrl.src,
  });
};

// Call once
fixLeafletIcon();

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialPosition?: { lat: number; lng: number };
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect,
  initialPosition
}) => {
  const [position, setPosition] = useState<[number, number] | null>(
    initialPosition 
      ? [initialPosition.lat, initialPosition.lng] 
      : null
  );
  const [address, setAddress] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef<L.Map | null>(null);
  
  useEffect(() => {
    // If we have an initial position, try to get its address
    if (initialPosition && !address) {
      reverseGeocode(initialPosition.lat, initialPosition.lng);
    }
  }, [initialPosition, address]);
  
  // Default center if no position set
  const defaultCenter: [number, number] = [40.416775, -3.70379]; // Madrid, Spain
  
  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setError('');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          reverseGeocode(latitude, longitude);
          
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
          }
          
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('No pudimos obtener tu ubicación. ' + error.message);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError('Geolocalización no está disponible en tu navegador');
    }
  };
  
  // Search for an address
  const searchAddress = async () => {
    if (!searchInput.trim()) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Use Nominatim OpenStreetMap service for geocoding
      const response = await fetch(
        \`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(searchInput)}\`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
        setAddress(display_name);
        
        // Update parent component
        onLocationSelect(parseFloat(lat), parseFloat(lon), display_name);
        
        if (mapRef.current) {
          mapRef.current.setView([parseFloat(lat), parseFloat(lon)], 15);
        }
      } else {
        setError('No se encontró ninguna ubicación con esa dirección');
      }
    } catch (error) {
      console.error('Error searching address:', error);
      setError('Error al buscar la dirección');
    } finally {
      setLoading(false);
    }
  };
  
  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      
      // Use Nominatim OpenStreetMap service for reverse geocoding
      const response = await fetch(
        \`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}\`
      );
      
      const data = await response.json();
      
      if (data && data.display_name) {
        setAddress(data.display_name);
        
        // Update parent component
        onLocationSelect(lat, lng, data.display_name);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Don't show an error to the user for reverse geocoding
    } finally {
      setLoading(false);
    }
  };
  
  // Component to handle map clicks
  const MapEventHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        reverseGeocode(lat, lng);
      },
      locationfound: (e) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        reverseGeocode(lat, lng);
        mapRef.current?.flyTo(e.latlng, 15);
      },
    });
    
    return null;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Search controls */}
      <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar dirección..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            endAdornment: (
              <Tooltip title="Buscar">
                <IconButton 
                  size="small" 
                  onClick={searchAddress}
                  disabled={loading || !searchInput.trim()}
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )
          }}
          disabled={loading}
        />
        
        <Tooltip title="Usar mi ubicación actual">
          <IconButton 
            onClick={getCurrentLocation}
            color="primary"
            disabled={loading}
          >
            <MyLocationIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {/* Selected address display */}
      {position && address && (
        <Box sx={{ px: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Ubicación seleccionada:
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              display: 'flex', 
              alignItems: 'flex-start'
            }}
          >
            <LocationOnIcon 
              fontSize="small" 
              color="error" 
              sx={{ mr: 0.5, mt: 0.3, flexShrink: 0 }} 
            />
            {address}
          </Typography>
        </Box>
      )}
      
      {/* Map container */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <MapContainer 
          center={position || initialPosition ? [position?.[0] || initialPosition!.lat, position?.[1] || initialPosition!.lng] : defaultCenter} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {position && (
            <Marker position={position} />
          )}
          
          <MapEventHandler />
        </MapContainer>
        
        {/* Instructions overlay */}
        {!position && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: 2,
              borderRadius: 2,
              p: 2,
              zIndex: 1000,
              textAlign: 'center',
              maxWidth: 250
            }}
          >
            <Typography variant="body2">
              Haz clic en cualquier lugar del mapa para seleccionar una ubicación
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LocationPicker;
