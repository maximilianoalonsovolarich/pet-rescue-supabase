-- Este script corrige el problema de usuario duplicado utilizando los datos que ya existen
-- Ya que tenemos la información del usuario, vamos a actualizar directamente su contraseña

DO $$
DECLARE
  admin_id UUID := '22a89acd-92a3-4ade-aaf6-3ca1c4eec523'; -- ID exacto del usuario existente
BEGIN
  -- 1. Actualizar las credenciales del usuario existente
  UPDATE auth.users 
  SET 
    email_confirmed_at = now(),
    -- Eliminamos confirmed_at ya que es una columna generada que no puede actualizarse directamente
    recovery_token = NULL,
    recovery_sent_at = NULL,
    encrypted_password = crypt('admin123', gen_salt('bf')), -- Restablecer contraseña
    raw_user_meta_data = jsonb_build_object('name', 'Admin User', 'full_name', 'Admin User'),
    updated_at = now()
  WHERE id = admin_id;
  
  RAISE NOTICE 'Usuario administrador actualizado con ID: %', admin_id;
  
  -- 2. Asegurarse de que existe una identidad para este usuario
  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = admin_id AND provider = 'email') THEN
    -- Crear la identidad si no existe
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      admin_id,
      admin_id,
      jsonb_build_object('sub', admin_id, 'email', 'codemaxon@gmail.com', 'email_verified', true),
      'email',
      'codemaxon@gmail.com',
      now(),
      now(),
      now()
    );
    
    RAISE NOTICE 'Identidad creada para el usuario administrador';
  ELSE
    -- Actualizar la identidad existente
    UPDATE auth.identities 
    SET 
      identity_data = jsonb_build_object('sub', admin_id, 'email', 'codemaxon@gmail.com', 'email_verified', true),
      provider_id = 'codemaxon@gmail.com',
      updated_at = now()
    WHERE user_id = admin_id AND provider = 'email';
    
    RAISE NOTICE 'Identidad actualizada para el usuario administrador';
  END IF;
  
  -- 3. Asegurarse de que existe un perfil para este usuario y es administrador
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_id) THEN
    -- Crear el perfil si no existe
    INSERT INTO public.profiles (
      id,
      name,
      email,
      is_admin,
      created_at,
      last_login
    )
    VALUES (
      admin_id,
      'Admin User',
      'codemaxon@gmail.com',
      true,
      now(),
      now()
    );
    
    RAISE NOTICE 'Perfil creado para el usuario administrador';
  ELSE
    -- Actualizar el perfil existente
    UPDATE public.profiles 
    SET 
      name = 'Admin User',
      is_admin = true,
      last_login = now()
    WHERE id = admin_id;
    
    RAISE NOTICE 'Perfil actualizado para el usuario administrador';
  END IF;
  
  RAISE NOTICE 'Configuración del usuario administrador completada con éxito';
  RAISE NOTICE 'Credenciales: Email=codemaxon@gmail.com, Password=admin123';
END $$;