-- Este script reinicia la contraseña del usuario administrador
-- Usará el formato de contraseña correcto que espera Supabase Auth

DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Buscar el ID del usuario administrador
  SELECT id INTO user_id FROM auth.users WHERE email = 'codemaxon@gmail.com';
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró el usuario con email codemaxon@gmail.com';
  END IF;
  
  -- Actualizar la contraseña utilizando el método que recomienda Supabase
  UPDATE auth.users
  SET 
    -- Contraseña 'admin123' con un salt generado por Supabase
    encrypted_password = crypt('admin123', gen_salt('bf')),
    -- Asegurarnos que la cuenta está confirmada
    email_confirmed_at = now(),
    confirmed_at = now(),
    -- Metadatos actualizados
    raw_app_meta_data = '{"provider":"email","providers":["email"]}',
    raw_user_meta_data = '{"full_name":"Admin User"}',
    updated_at = now()
  WHERE id = user_id;
  
  -- Asegurarnos que la identidad del usuario está correctamente configurada
  DELETE FROM auth.identities WHERE user_id = user_id;
  
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    user_id,
    user_id,
    jsonb_build_object('sub', user_id, 'email', 'codemaxon@gmail.com'),
    'email',
    now(),
    now(),
    now()
  );
  
  -- Asegurarnos que el usuario es administrador en la tabla profiles
  UPDATE public.profiles
  SET 
    is_admin = true,
    name = 'Admin User'
  WHERE id = user_id;
  
  RAISE NOTICE 'Contraseña reiniciada correctamente para el usuario con ID: %', user_id;
END $$;