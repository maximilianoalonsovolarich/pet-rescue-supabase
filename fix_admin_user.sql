-- Script para corregir el usuario administrador existente
-- Ejecutar este script en SQL Editor de Supabase

-- Actualizamos el usuario existente con los campos que faltan
UPDATE auth.users
SET 
    created_at = NOW(),
    updated_at = NOW(),
    last_sign_in_at = NOW(),
    is_anonymous = false,
    confirmed_at = NOW(),
    invited_at = NULL,
    confirmation_token = '',
    recovery_token = NULL,
    recovery_sent_at = NULL,
    email_change_token_new = NULL,
    email_change = NULL,
    email_change_sent_at = NULL,
    reauthentication_token = ''
WHERE 
    email = 'codemaxon@gmail.com';

-- Verificamos también si existe el perfil en la tabla profiles
DO $$
DECLARE
    user_id uuid;
    profile_exists boolean;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = 'codemaxon@gmail.com' LIMIT 1;
    
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
    
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (
            id,
            name,
            email,
            phone,
            is_admin,
            created_at,
            last_login
        ) VALUES (
            user_id,
            'Administrador',
            'codemaxon@gmail.com',
            '+123456789',
            TRUE,
            NOW(),
            NOW()
        );
    END IF;
END $$;

-- Si después de ejecutar este script sigue sin funcionar, la alternativa más 
-- segura es eliminar y recrear el usuario usando la interfaz de Supabase:
-- 1. Elimina el usuario existente desde la interfaz
-- 2. Crea un nuevo usuario desde "Add User" en la interfaz de Supabase
-- 3. Asigna manualmente el rol de administrador actualizando la tabla profiles
