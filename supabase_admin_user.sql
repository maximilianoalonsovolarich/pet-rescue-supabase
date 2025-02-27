-- Script para crear correctamente un usuario administrador en Supabase
-- NOTA: Este script ha sido probado con la estructura actual de auth.users

-- Primero, eliminamos el usuario existente (si existe)
DELETE FROM auth.users WHERE email = 'codemaxon@gmail.com';

-- Insertamos el nuevo usuario con los campos mínimos necesarios
-- Sin tocar las columnas generadas automáticamente como confirmed_at
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,  -- Esta establece confirmed_at indirectamente
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
) VALUES (
    uuid_generate_v4(),
    'codemaxon@gmail.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),  -- Confirma el email
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin User"}',
    'authenticated',
    'authenticated'
);

-- Creamos el perfil de administrador
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Obtenemos el ID del usuario recién creado
    SELECT id INTO user_id FROM auth.users WHERE email = 'codemaxon@gmail.com' LIMIT 1;
    
    -- Eliminamos el perfil si ya existe
    DELETE FROM public.profiles WHERE email = 'codemaxon@gmail.com';
    
    -- Creamos el perfil con rol de administrador
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
    
    -- Mensaje de confirmación
    RAISE NOTICE 'Usuario administrador creado con éxito. ID: %', user_id;
END $$;
