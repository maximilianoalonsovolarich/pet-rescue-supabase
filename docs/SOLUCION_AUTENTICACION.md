# Solución para Problemas de Autenticación en Pet Rescue

Este documento proporciona instrucciones detalladas para resolver los problemas de autenticación en la aplicación Pet Rescue, específicamente el error "Invalid login credentials" cuando se intenta iniciar sesión con el usuario administrador.

## Problema

Los siguientes problemas se han identificado:

1. Error "Invalid login credentials" al intentar iniciar sesión con el usuario administrador (codemaxon@gmail.com)
2. Posible falta de registros en la tabla `auth.identities` o inconsistencias en las tablas de autenticación
3. Problemas con el hash de la contraseña en la tabla `auth.users`

## Solución

La solución consiste en:

1. Ejecutar un script SQL que recrea correctamente el usuario administrador
2. Usar una página de inicio de sesión directa como alternativa

## Instrucciones Paso a Paso

### Paso 1: Ejecutar el Script SQL

1. Accede al [Dashboard de Supabase](https://app.supabase.com/) y selecciona tu proyecto
2. Ve a la sección **SQL Editor**
3. Crea una nueva consulta
4. Copia y pega el contenido completo del archivo `migrations/fix_admin_auth.sql`
5. Ejecuta la consulta y verifica los mensajes de salida para confirmar el éxito

Este script realizará tres acciones principales:
- Eliminar completamente cualquier registro existente del usuario admin
- Crear un nuevo usuario admin con las credenciales correctas
- Verificar que todo esté correctamente configurado

### Paso 2: Probar el Inicio de Sesión Normal

Después de ejecutar el script SQL, intenta iniciar sesión con las credenciales de administrador:
- Email: `codemaxon@gmail.com`
- Password: `admin123`

Si el inicio de sesión funciona correctamente, ¡perfecto! Si aún hay problemas, procede al Paso 3.

### Paso 3: Usar la Página de Inicio de Sesión Directa

Si continúas experimentando problemas de inicio de sesión después de ejecutar el script SQL, puedes usar la página de inicio de sesión directa que hemos añadido al proyecto:

1. Accede a la URL: `/admin/force-login`
2. Inicia sesión con las credenciales de administrador
3. Si aparecen errores, activa el "Modo debug" y revisa la respuesta de la API para obtener más información

## Explicación Técnica

### ¿Por qué ocurre este problema?

Los problemas de autenticación en Supabase generalmente se deben a:

1. **Inconsistencias en las tablas de autenticación**: Las tablas `auth.users`, `auth.identities` y `public.profiles` deben estar correctamente sincronizadas.
2. **Problemas con el hash de la contraseña**: Supabase usa un algoritmo específico de bcrypt para el hash de contraseñas.
3. **Falta de confirmación de email**: Las cuentas deben tener el campo `email_confirmed_at` configurado correctamente.
4. **Problemas con las identidades**: La tabla `auth.identities` debe contener un registro correcto para cada usuario.

### Cómo funciona la solución

El script SQL:
1. Elimina todos los registros relacionados con el usuario administrador para evitar conflictos
2. Crea un nuevo usuario con las credenciales correctas y el hash de contraseña adecuado
3. Establece correctamente todos los campos necesarios, incluyendo la confirmación de email
4. Crea un registro en `auth.identities` con los valores correctos
5. Asegura que el perfil en `public.profiles` existe y tiene el flag `is_admin` establecido en `true`

La página de inicio de sesión directa:
1. Realiza una llamada directa a la API de autenticación de Supabase
2. Proporciona información de depuración para diagnosticar posibles problemas

## Información Adicional

### Credenciales de Administrador

- **Email**: codemaxon@gmail.com
- **Password**: admin123

### Pasos de Verificación en Supabase

Para verificar que todo esté configurado correctamente:

1. En el Dashboard de Supabase, ve a **Authentication** > **Users**
2. Busca el usuario `codemaxon@gmail.com`
3. Verifica que aparece como "Confirmed" (confirmado)
4. Ve a **Table Editor** > **public** > **profiles**
5. Verifica que existe un registro para este usuario con `is_admin = true`

## Solución de Problemas

Si después de seguir todos estos pasos aún experimentas problemas:

1. Verifica en el Dashboard de Supabase que el usuario existe y está confirmado
2. Comprueba que las políticas RLS (Row Level Security) permiten el acceso adecuado
3. Asegúrate de que las variables de entorno de Supabase están correctamente configuradas en tu proyecto

## Contacto

Si tienes más preguntas o problemas, no dudes en contactar al equipo de desarrollo.

---

*Este documento fue creado el 27 de febrero de 2025 para resolver los problemas de autenticación en la aplicación Pet Rescue.*