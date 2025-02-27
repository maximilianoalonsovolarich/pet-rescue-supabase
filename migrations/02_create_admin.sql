-- This script creates an admin user with email: codemaxon@gmail.com and password: admin123

-- First, check if the user already exists
DO $$
DECLARE
  user_exists BOOLEAN;
  user_id UUID;
BEGIN
  -- Check if the user already exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'codemaxon@gmail.com'
  ) INTO user_exists;
  
  -- If the user doesn't exist, create it
  IF NOT user_exists THEN
    -- Insert the user using Supabase's auth.users table with proper hashing
    SELECT auth.uid() INTO user_id;
    
    -- Use Supabase Auth's sign-up function
    SELECT id INTO user_id FROM auth.users WHERE email = 'codemaxon@gmail.com';
    
    IF user_id IS NULL THEN
      -- Use direct insertion if the function is not available
      user_id := uuid_generate_v4();
      
      INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        aud,
        role
      )
      VALUES (
        user_id,
        (SELECT id FROM auth.instances LIMIT 1),
        'codemaxon@gmail.com',
        -- Use Supabase's auth.crypt_password function that properly formats the password
        auth.crypt_password('admin123'),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Admin User"}',
        now(),
        'authenticated',
        'authenticated'
      );
      
      -- Add a confirmation token to ensure the account is confirmed
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
      
      -- Make sure the profile gets created manually if the trigger doesn't work
      INSERT INTO public.profiles (id, name, email, is_admin)
      VALUES (user_id, 'Admin User', 'codemaxon@gmail.com', true)
      ON CONFLICT (id) DO NOTHING;
    END IF;
  ELSE
    -- Get the user ID
    SELECT id INTO user_id FROM auth.users WHERE email = 'codemaxon@gmail.com';
  END IF;
  
  -- Always ensure this user is an admin (even if it already existed)
  UPDATE public.profiles
  SET is_admin = true
  WHERE email = 'codemaxon@gmail.com';
  
  -- Output the created user ID for reference
  RAISE NOTICE 'Admin user ID: %', user_id;
END $$;