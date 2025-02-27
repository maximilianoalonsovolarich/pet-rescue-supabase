-- Script para crear el usuario administrador en Supabase
-- Para ejecutar este script, ve a la consola de Supabase > SQL Editor

-- Primero, eliminar el usuario si ya existe para evitar duplicados
DELETE FROM auth.users WHERE email = 'codemaxon@gmail.com';

-- Insertar un nuevo usuario con credenciales conocidas
INSERT INTO auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    confirmation_token,
    confirmed_at
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Esto se reemplazará automáticamente por la instancia correcta
    uuid_generate_v4(), -- Genera un nuevo UUID para el ID del usuario
    'codemaxon@gmail.com',
    crypt('admin123', gen_salt('bf')), -- Encriptar la contraseña 'admin123'
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin User"}',
    'authenticated',
    'authenticated',
    '',
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