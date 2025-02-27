-- Script para limpiar completamente la base de datos
-- Ejecutar esto primero en el SQL Editor de Supabase

-- Eliminar tablas existentes
DROP TABLE IF EXISTS public.pets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Eliminar tipos personalizados existentes
DROP TYPE IF EXISTS pet_status_type CASCADE;
DROP TYPE IF EXISTS pet_type_type CASCADE;
DROP TYPE IF EXISTS pet_size_type CASCADE;
DROP TYPE IF EXISTS pet_gender_type CASCADE;
DROP TYPE IF EXISTS pet_age_type CASCADE;

-- Eliminar funciones y triggers
DROP FUNCTION IF EXISTS update_modified_column() CASCADE;

-- Eliminar políticas de seguridad existentes
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Pets are viewable by everyone" ON public.pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can insert their own pets" ON public.pets;

-- Eliminar índices existentes
DROP INDEX IF EXISTS pets_user_id_idx;
DROP INDEX IF EXISTS pets_status_idx;
DROP INDEX IF EXISTS pets_pet_type_idx;

-- Eliminar usuarios existentes
DELETE FROM auth.users WHERE email = 'codemaxon@gmail.com';