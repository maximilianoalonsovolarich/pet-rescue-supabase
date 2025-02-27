-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('pet-images', 'pet-images', true)
ON CONFLICT DO NOTHING;

-- Set up policies for storage buckets
CREATE POLICY "Public Access to Profile Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images' AND (auth.uid()::text = (storage.foldername(name))[1]));

-- Set up policies for pet images
CREATE POLICY "Public Access to Pet Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'pet-images');

CREATE POLICY "Authenticated users can upload pet images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pet-images' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can update their own pet images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pet-images' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can delete their own pet images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pet-images' AND (auth.uid()::text = (storage.foldername(name))[1]));

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users (id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  profile_image TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create RLS policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any profile"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- Admin users can update any profile
CREATE POLICY "Admin users can update any profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND is_admin = true
));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create pets table
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pet_type TEXT NOT NULL CHECK (pet_type IN ('perro', 'gato', 'ave', 'conejo', 'otro')),
  pet_size TEXT CHECK (pet_size IN ('pequeño', 'mediano', 'grande')),
  pet_color TEXT,
  pet_gender TEXT CHECK (pet_gender IN ('macho', 'hembra', 'desconocido')),
  pet_age TEXT CHECK (pet_age IN ('cachorro', 'joven', 'adulto', 'senior', 'desconocido')),
  image_url TEXT,
  additional_images TEXT[],
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  status TEXT NOT NULL CHECK (status IN ('activo', 'inactivo', 'encontrado', 'adoptado')) DEFAULT 'activo',
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create RLS policies for pets table
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pets"
ON public.pets FOR SELECT
USING (true);

CREATE POLICY "Users can create their own pets"
ON public.pets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets"
ON public.pets FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets"
ON public.pets FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admin users can update any pet
CREATE POLICY "Admin users can update any pet" 
ON public.pets FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND is_admin = true
));

-- Admin users can delete any pet
CREATE POLICY "Admin users can delete any pet" 
ON public.pets FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND is_admin = true
));

-- Create a function to increment pet view count
CREATE OR REPLACE FUNCTION public.increment_pet_views(pet_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE pets
  SET views = views + 1
  WHERE id = pet_id;
END;
$$;