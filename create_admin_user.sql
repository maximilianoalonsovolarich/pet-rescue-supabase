-- Script para crear el usuario administrador
-- IMPORTANTE: Ejecutar este script DESPUÉS de que las tablas estén creadas

-- Eliminar el usuario si ya existe para evitar duplicados
DELETE FROM auth.users WHERE email = 'codemaxon@gmail.com';

-- Insertar un nuevo usuario administrador
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    is_anonymous,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
) VALUES (
    uuid_generate_v4(),
    'codemaxon@gmail.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    '',
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    false,
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin User"}',
    'authenticated',
    'authenticated'
);

-- Crear el perfil de administrador
DO $$
DECLARE
    user_id uuid;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = 'codemaxon@gmail.com' LIMIT 1;
    
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
END $$;
