-- Este script crea o actualiza un usuario administrador con las credenciales especificadas
-- IMPORTANTE: Este script es definitivo y sobrescribe cualquier configuración previa.

-- 1. Primero, verificamos si el usuario ya existe
DO $$
DECLARE
  user_exists BOOLEAN;
  admin_user_id UUID;
BEGIN
  -- Verificar existencia del usuario
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'codemaxon@gmail.com')
  INTO user_exists;

  RAISE NOTICE 'Usuario existe: %', user_exists;

  IF user_exists THEN
    -- Si existe, obtenemos su ID
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'codemaxon@gmail.com';
    RAISE NOTICE 'ID del usuario existente: %', admin_user_id;
    
    -- Actualizar la contraseña y los datos del usuario
    UPDATE auth.users
    SET 
      encrypted_password = crypt('admin123', gen_salt('bf')),
      email_confirmed_at = now(),
      confirmation_token = NULL,
      confirmation_sent_at = NULL,
      recovery_token = NULL,
      recovery_sent_at = NULL,
      raw_app_meta_data = jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
      ),
      raw_user_meta_data = jsonb_build_object(
        'name', 'Admin User',
        'full_name', 'Admin User'
      ),
      updated_at = now(),
      last_sign_in_at = now(),
      banned_until = NULL,
      aud = 'authenticated',
      role = 'authenticated',
      is_super_admin = false
    WHERE id = admin_user_id;

    -- Actualizar o crear la identidad del usuario
    DELETE FROM auth.identities WHERE user_id = admin_user_id;
    
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
      admin_user_id,
      admin_user_id,
      jsonb_build_object('sub', admin_user_id, 'email', 'codemaxon@gmail.com', 'email_verified', true),
      'email',
      now(),
      now(),
      now()
    );
  ELSE
    -- Si no existe, lo creamos desde cero
    admin_user_id := uuid_generate_v4();
    RAISE NOTICE 'Creando nuevo usuario con ID: %', admin_user_id;
    
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      last_sign_in_at,
      banned_until,
      aud,
      role,
      is_super_admin
    )
    VALUES (
      admin_user_id,
      (SELECT id FROM auth.instances LIMIT 1),
      'codemaxon@gmail.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      NULL,
      NULL,
      NULL,
      NULL,
      jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
      ),
      jsonb_build_object(
        'name', 'Admin User',
        'full_name', 'Admin User'
      ),
      now(),
      now(),
      now(),
      NULL,
      'authenticated',
      'authenticated',
      false
    );
    
    -- Crear la identidad del usuario
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
      admin_user_id,
      admin_user_id,
      jsonb_build_object('sub', admin_user_id, 'email', 'codemaxon@gmail.com', 'email_verified', true),
      'email',
      now(),
      now(),
      now()
    );
  END IF;
  
  -- 2. Ahora nos aseguramos de que exista en la tabla profiles y sea administrador
  
  -- Verificar si el perfil existe
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_user_id) THEN
    -- Actualizar el perfil existente para asegurarnos que es admin
    UPDATE public.profiles
    SET
      name = 'Admin User',
      email = 'codemaxon@gmail.com',
      is_admin = true,
      last_login = now()
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'Perfil de usuario actualizado con ID: %', admin_user_id;
  ELSE
    -- Crear el perfil desde cero
    INSERT INTO public.profiles (
      id,
      name,
      email,
      is_admin,
      created_at,
      last_login
    )
    VALUES (
      admin_user_id,
      'Admin User',
      'codemaxon@gmail.com',
      true,
      now(),
      now()
    );
    
    RAISE NOTICE 'Perfil de usuario creado con ID: %', admin_user_id;
  END IF;
  
  RAISE NOTICE 'Usuario administrador creado/actualizado correctamente con ID: %', admin_user_id;
END $$;