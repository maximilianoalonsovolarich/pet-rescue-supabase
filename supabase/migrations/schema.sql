-- Script para crear las tablas necesarias en Supabase
-- Ejecutar este script en SQL Editor de Supabase

-- Primero, verificamos si ya existen las tablas y las eliminamos para tener una base limpia
DROP TABLE IF EXISTS public.pets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear custom types for enums
CREATE TYPE pet_status_type AS ENUM ('activo', 'inactivo', 'encontrado', 'adoptado');
CREATE TYPE pet_type_type AS ENUM ('perro', 'gato', 'ave', 'conejo', 'otro');
CREATE TYPE pet_size_type AS ENUM ('pequeño', 'mediano', 'grande');
CREATE TYPE pet_gender_type AS ENUM ('macho', 'hembra', 'desconocido');
CREATE TYPE pet_age_type AS ENUM ('cachorro', 'joven', 'adulto', 'senior', 'desconocido');

-- Creamos la tabla de perfiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    profile_image TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Creamos la tabla de mascotas
CREATE TABLE public.pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    pet_type TEXT NOT NULL CHECK (pet_type IN ('perro', 'gato', 'ave', 'conejo', 'otro')),
    pet_size TEXT CHECK (pet_size IN ('pequeño', 'mediano', 'grande')),
    pet_color TEXT,
    pet_gender TEXT CHECK (pet_gender IN ('macho', 'hembra', 'desconocido')),
    pet_age TEXT CHECK (pet_age IN ('cachorro', 'joven', 'adulto', 'senior', 'desconocido')),
    image_url TEXT,
    additional_images TEXT[],
    latitude FLOAT,
    longitude FLOAT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'encontrado', 'adoptado')),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creación de índices para mejorar el rendimiento en búsquedas
CREATE INDEX pets_user_id_idx ON public.pets(user_id);
CREATE INDEX pets_status_idx ON public.pets(status);
CREATE INDEX pets_pet_type_idx ON public.pets(pet_type);

-- Configurar RLS (Row Level Security) para proteger los datos
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla de perfiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Políticas para la tabla de mascotas
CREATE POLICY "Pets are viewable by everyone" 
ON public.pets FOR SELECT USING (status = 'activo' OR user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Users can update their own pets" 
ON public.pets FOR UPDATE USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Users can delete their own pets" 
ON public.pets FOR DELETE USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Users can insert their own pets" 
ON public.pets FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

-- Trigger para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pets_modtime
BEFORE UPDATE ON public.pets
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insertar un usuario administrador para pruebas
-- Primero, eliminar el usuario si ya existe para evitar duplicados
DELETE FROM auth.users WHERE email = 'codemaxon@gmail.com';

-- Insertar un nuevo usuario con credenciales conocidas
INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at
) VALUES (
    'codemaxon@gmail.com',
    crypt('admin123', gen_salt('bf')), -- Encriptar la contraseña 'admin123'
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin User"}',
    'authenticated',
    'authenticated',
    now(),
    now()
);

-- Obtener el ID del usuario que acabamos de crear
DO $$
DECLARE
    user_id uuid;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = 'codemaxon@gmail.com' LIMIT 1;
    
    -- Crear el perfil del administrador en la tabla 'profiles'
    INSERT INTO public.profiles (
        id,
        name,
        email,
        phone,
        profile_image,
        is_admin,
        created_at,
        last_login
    ) VALUES (
        user_id,
        'Administrador',
        'codemaxon@gmail.com',
        '+123456789', -- puedes cambiar esto por un número real
        NULL, -- sin imagen de perfil por ahora
        TRUE, -- este es un administrador
        now(),
        now()
    )
    ON CONFLICT (id) 
    DO UPDATE SET 
        is_admin = TRUE,
        last_login = now();

END $$;
