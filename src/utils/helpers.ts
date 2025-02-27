import { Pet } from "@/lib/supabase";

// Format date to local string
export function formatDate(date: string | Date, includeTime: boolean = false): string {
  const dateObj = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  };
  
  return dateObj.toLocaleDateString('es-ES', options);
}

// Calculate time ago from a date
export function getTimeAgo(dateString: string): string {
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
  
  return formatDate(date);
}

// Pet type display name
export function getPetTypeName(type: Pet['pet_type']): string {
  switch(type) {
    case 'perro': return 'Perro';
    case 'gato': return 'Gato';
    case 'ave': return 'Ave';
    case 'conejo': return 'Conejo';
    case 'otro': return 'Otro';
    default: return type;
  }
}

// Get pet size display name
export function getPetSizeName(size: Pet['pet_size'] | undefined): string {
  if (!size) return 'No especificado';
  
  switch(size) {
    case 'pequeño': return 'Pequeño';
    case 'mediano': return 'Mediano';
    case 'grande': return 'Grande';
    default: return size;
  }
}

// Get pet gender display name
export function getPetGenderName(gender: Pet['pet_gender'] | undefined): string {
  if (!gender) return 'No especificado';
  
  switch(gender) {
    case 'macho': return 'Macho';
    case 'hembra': return 'Hembra';
    case 'desconocido': return 'Desconocido';
    default: return gender;
  }
}

// Get pet age display name
export function getPetAgeName(age: Pet['pet_age'] | undefined): string {
  if (!age) return 'No especificado';
  
  switch(age) {
    case 'cachorro': return 'Cachorro';
    case 'joven': return 'Joven';
    case 'adulto': return 'Adulto';
    case 'senior': return 'Senior';
    case 'desconocido': return 'Desconocido';
    default: return age;
  }
}

// Get pet status display name
export function getPetStatusName(status: Pet['status']): string {
  switch(status) {
    case 'activo': return 'Activo';
    case 'inactivo': return 'Inactivo';
    case 'encontrado': return 'Encontrado';
    case 'adoptado': return 'Adoptado';
    default: return status;
  }
}

// Get pet status color for MUI components
export function getPetStatusColor(status: Pet['status']): 'success' | 'warning' | 'info' | 'secondary' | 'default' {
  switch(status) {
    case 'activo': return 'success';
    case 'inactivo': return 'warning';
    case 'encontrado': return 'info';
    case 'adoptado': return 'secondary';
    default: return 'default';
  }
}

// Format image URL from Supabase
export function getImageUrl(path: string | undefined | null): string {
  if (!path) return 'https://source.unsplash.com/random?pet';
  
  // If it already has http/https, return as is
  if (path.startsWith('http')) return path;
  
  // If it's a Supabase storage URL
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pet-images/${path}`;
}

// Generate a random avatar color from a string (name, email, etc.)
export function stringToColor(string: string): string {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

// Get initials from a name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
}
