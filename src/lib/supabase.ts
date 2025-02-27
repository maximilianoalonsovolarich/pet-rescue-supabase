import { createClient } from '@supabase/supabase-js';

// These environment variables are set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for the browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export type Profile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile_image?: string;
  is_admin: boolean;
  created_at: string;
  last_login?: string;
};

export type Pet = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  pet_type: 'perro' | 'gato' | 'ave' | 'conejo' | 'otro';
  pet_size?: 'pequeño' | 'mediano' | 'grande';
  pet_color?: string;
  pet_gender?: 'macho' | 'hembra' | 'desconocido';
  pet_age?: 'cachorro' | 'joven' | 'adulto' | 'senior' | 'desconocido';
  image_url?: string;
  additional_images?: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
  status: 'activo' | 'inactivo' | 'encontrado' | 'adoptado';
  views: number;
  created_at: string;
  updated_at: string;
  // Additional fields joined from profiles
  user_name?: string;
  user_email?: string;
  user_phone?: string;
};

// Server-side Supabase client (with admin rights)
// Only use this on the server, never expose it to the client
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey);
};
