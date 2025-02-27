#!/usr/bin/env node

/**
 * Herramientas para administrar el usuario administrador en Supabase
 * 
 * Este script ofrece varios comandos para verificar y gestionar el usuario administrador:
 * 
 * - check: Verifica si existe el usuario administrador y muestra su estado
 * - reset: Elimina y vuelve a crear el usuario administrador
 * - login: Intenta iniciar sesión con el usuario administrador
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

// Comprobar variables de entorno
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n🔴 Error: Faltan variables de entorno de Supabase.');
  console.log('Asegúrate de tener un archivo .env.local con las siguientes variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Crear cliente Supabase con permisos de administrador
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Constantes
const ADMIN_EMAIL = 'codemaxon@gmail.com';
const ADMIN_PASSWORD = 'admin123';

// Configuración de la interfaz de línea de comandos
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Menú principal
function showMenu() {
  console.log('\n🔧 Herramientas para Administrar Usuario Admin\n');
  console.log('1. Verificar usuario administrador');
  console.log('2. Reiniciar usuario administrador (eliminar y recrear)');
  console.log('3. Probar inicio de sesión');
  console.log('4. Salir\n');
  
  rl.question('Selecciona una opción (1-4): ', (answer) => {
    switch (answer.trim()) {
      case '1':
        checkAdminUser();
        break;
      case '2':
        resetAdminUser();
        break;
      case '3':
        testLogin();
        break;
      case '4':
        console.log('👋 ¡Adiós!');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('⚠️ Opción no válida. Intenta de nuevo.');
        showMenu();
    }
  });
}

// Verificar usuario administrador
async function checkAdminUser() {
  console.log('\n🔍 Verificando usuario administrador...');
  
  try {
    // Verificar usuario en auth.users
    const { data: authUser, error: authError } = await supabase
      .from('auth_users_view') // Vista que muestra información de auth.users
      .select('id, email, email_confirmed_at, last_sign_in_at')
      .eq('email', ADMIN_EMAIL)
      .maybeSingle();
    
    if (authError) {
      console.error('Error al consultar auth.users:', authError.message);
      console.log('Intentando consultar directamente profiles...');
    }
    
    // Verificar perfil en public.profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, is_admin')
      .eq('email', ADMIN_EMAIL)
      .maybeSingle();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error al consultar profiles:', profileError.message);
    }
    
    console.log('\n📊 Resultado de la verificación:');
    console.log('-------------------------------');
    
    if (authUser) {
      console.log('✅ Usuario en auth.users:');
      console.log(`   ID: ${authUser.id}`);
      console.log(`   Email: ${authUser.email}`);
      console.log(`   Email confirmado: ${authUser.email_confirmed_at ? 'Sí' : 'No'}`);
      console.log(`   Último inicio de sesión: ${authUser.last_sign_in_at || 'Nunca'}`);
    } else {
      console.log('❌ No se encontró el usuario en auth.users');
    }
    
    if (profile) {
      console.log('\n✅ Perfil en public.profiles:');
      console.log(`   ID: ${profile.id}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Nombre: ${profile.name}`);
      console.log(`   Es administrador: ${profile.is_admin ? 'Sí' : 'No'}`);
    } else {
      console.log('\n❌ No se encontró el perfil en public.profiles');
    }
    
    // Consistencia entre auth y profiles
    if (authUser && profile) {
      if (authUser.id === profile.id) {
        console.log('\n✅ El ID del usuario y el perfil son consistentes.');
      } else {
        console.log('\n⚠️ El ID del usuario y el perfil NO son consistentes:');
        console.log(`   ID en auth.users: ${authUser.id}`);
        console.log(`   ID en profiles: ${profile.id}`);
      }
    }
    
    console.log('\n⭐ Credenciales para inicio de sesión:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Contraseña: ${ADMIN_PASSWORD}`);
    
  } catch (error) {
    console.error('Error inesperado:', error.message);
  }
  
  waitForKeypress();
}

// Reiniciar usuario administrador
async function resetAdminUser() {
  console.log('\n⚠️ Esta operación eliminará el usuario administrador existente y lo volverá a crear.');
  rl.question('¿Estás seguro? (s/n): ', async (answer) => {
    if (answer.toLowerCase() !== 's' && answer.toLowerCase() !== 'si' && answer.toLowerCase() !== 'sí') {
      console.log('Operación cancelada.');
      waitForKeypress();
      return;
    }
    
    try {
      console.log('\n🔄 Reiniciando usuario administrador...');
      
      // 1. Obtener el ID del usuario si existe
      const { data: user } = await supabase
        .from('auth_users_view')
        .select('id')
        .eq('email', ADMIN_EMAIL)
        .maybeSingle();
      
      if (user) {
        console.log(`Usuario existente encontrado con ID: ${user.id}`);
        console.log('Eliminando usuario y perfil...');
        
        // 2. Eliminar el perfil
        await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);
        
        // 3. Intentar eliminar el usuario de auth
        // Nota: Esto podría requerir un SQL directo que no es posible con el cliente normal
        console.log('Eliminando datos de auth.users...');
        
        try {
          // Esto intentará ejecutar SQL personalizado para eliminar el usuario
          // Pero es posible que no funcione sin permisos adecuados
          await supabase.rpc('delete_auth_user', { user_id: user.id });
          console.log('Usuario eliminado correctamente.');
        } catch (deleteError) {
          console.log('No se pudo eliminar automáticamente el usuario de auth.users.');
          console.log('Se intentará crear/actualizar el usuario de todos modos.');
        }
      }
      
      // 4. Crear un nuevo usuario administrador a través de Supabase Auth API
      console.log('Creando nuevo usuario administrador...');
      
      // Borrar usuario existente si hay uno con el mismo email
      await supabase.auth.admin.deleteUser(ADMIN_EMAIL);
      
      // Crear nuevo usuario
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: 'Admin User' },
        app_metadata: { is_admin: true }
      });
      
      if (createError) {
        throw createError;
      }
      
      console.log(`✅ Usuario creado correctamente con ID: ${newUser.user.id}`);
      
      // 5. Asegurarse que el perfil tenga el flag de admin
      await supabase
        .from('profiles')
        .upsert({
          id: newUser.user.id,
          email: ADMIN_EMAIL,
          name: 'Admin User',
          is_admin: true
        });
      
      console.log('✅ Perfil de administrador configurado correctamente.');
      
      console.log('\n🎉 Usuario administrador reiniciado con éxito.');
      console.log('Credenciales:');
      console.log(`- Email: ${ADMIN_EMAIL}`);
      console.log(`- Contraseña: ${ADMIN_PASSWORD}`);
      
    } catch (error) {
      console.error('❌ Error al reiniciar el usuario administrador:', error.message);
      console.log('\nPrueba ejecutando el script SQL manualmente desde el SQL Editor en Supabase:');
      console.log('migrations/05_fix_admin_user.sql');
    }
    
    waitForKeypress();
  });
}

// Probar inicio de sesión
async function testLogin() {
  console.log('\n🔑 Probando inicio de sesión con usuario administrador...');
  
  try {
    // Iniciar sesión con el cliente normal (no admin) para simular login real
    const regularClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await regularClient.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (error) {
      console.error('❌ Error al iniciar sesión:', error.message);
      console.log('\nPosibles causas:');
      console.log('- La contraseña no es correcta.');
      console.log('- El usuario no existe o no está confirmado.');
      console.log('- La encriptación de la contraseña no es compatible con Supabase Auth.');
      console.log('\nSugerencia: Utiliza la opción 2 para reiniciar el usuario administrador.');
    } else {
      console.log('✅ Inicio de sesión exitoso!');
      console.log(`Usuario: ${data.user.email}`);
      console.log(`ID: ${data.user.id}`);
      console.log('Sesión válida establecida.');
      
      // Verificar si el usuario es admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();
        
      if (profile && profile.is_admin) {
        console.log('✅ El usuario tiene permisos de administrador en la base de datos.');
      } else {
        console.log('⚠️ El usuario NO tiene permisos de administrador en la base de datos.');
      }
    }
  } catch (error) {
    console.error('Error inesperado:', error.message);
  }
  
  waitForKeypress();
}

// Esperar pulsación de tecla para continuar
function waitForKeypress() {
  console.log('\nPresiona cualquier tecla para continuar...');
  process.stdin.once('data', () => {
    showMenu();
  });
}

// Ejecución principal
console.log('🔐 Utilidad de Gestión de Usuario Administrador');
console.log('===============================================');
console.log(`URL de Supabase: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

showMenu();