-- Create users table extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for enums
CREATE TYPE pet_status_type AS ENUM ('activo', 'inactivo', 'encontrado', 'adoptado');
CREATE TYPE pet_type_type AS ENUM ('perro', 'gato', 'ave', 'conejo', 'otro');
CREATE TYPE pet_size_type AS ENUM ('pequeño', 'mediano', 'grande');
CREATE TYPE pet_gender_type AS ENUM ('macho', 'hembra', 'desconocido');
CREATE TYPE pet_age_type AS ENUM ('cachorro', 'joven', 'adulto', 'senior', 'desconocido');

-- Create users table (handled by Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  profile_image TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create pets table
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pet_type pet_type_type NOT NULL,
  pet_size pet_size_type,
  pet_color TEXT,
  pet_gender pet_gender_type,
  pet_age pet_age_type,
  image_url TEXT,
  additional_images TEXT[],
  latitude DECIMAL,
  longitude DECIMAL,
  address TEXT,
  status pet_status_type DEFAULT 'activo',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security (RLS)
-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create policies for pets table
CREATE POLICY "Pets are viewable by everyone" 
ON public.pets FOR SELECT USING (true);

CREATE POLICY "Users can insert their own pets" 
ON public.pets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets" 
ON public.pets FOR UPDATE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Users can delete their own pets" 
ON public.pets FOR DELETE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update function to increment view count
CREATE OR REPLACE FUNCTION increment_pet_views(pet_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.pets SET views = views + 1 WHERE id = pet_id;
END;
$$ LANGUAGE plpgsql;

-- Create admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'codemaxon@gmail.com', 
   crypt('admin123', gen_salt('bf')), now(), 
   '{"name":"Administrador"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Set admin flag for the admin user
UPDATE public.profiles
SET is_admin = true
WHERE email = 'codemaxon@gmail.com';
