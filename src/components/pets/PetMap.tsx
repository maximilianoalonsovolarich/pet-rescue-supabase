import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface PetMapProps {
  center: [number, number];
  zoom?: number;
  markerPosition?: [number, number];
  markerTitle?: string;
}

const PetMap: React.FC<PetMapProps> = ({ 
  center,
  zoom = 13,
  markerPosition,
  markerTitle
}) => {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {markerPosition && (
        <Marker position={markerPosition}>
          {markerTitle && (
            <Popup>
              {markerTitle}
            </Popup>
          )}
        </Marker>
      )}
    </MapContainer>
  );
};

export default PetMap;
