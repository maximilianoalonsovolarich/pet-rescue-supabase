-- Script para crear el usuario administrador
-- Ejecutar este script DESPUÉS de que las tablas estén creadas

-- Eliminar el usuario si ya existe
DELETE FROM auth.users WHERE email = 'codemaxon@gmail.com';

-- Crear nuevo usuario administrador
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
) VALUES (
    uuid_generate_v4(),
    'codemaxon@gmail.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
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
        is_admin,
        created_at
    ) VALUES (
        user_id,
        'Administrador',
        'codemaxon@gmail.com',
        TRUE,
        NOW()
    );
END $$;