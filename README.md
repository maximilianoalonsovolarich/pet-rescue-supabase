# Pet Rescue Supabase

Aplicación para facilitar la gestión de mascotas perdidas y en adopción utilizando Supabase como backend.

## Configuración inicial de la base de datos

### Método automático (recomendado)

1. Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_llave_anonima_de_supabase
   SUPABASE_SERVICE_ROLE_KEY=tu_llave_de_servicio_de_supabase
   ```

2. Instala las dependencias del proyecto:
   ```
   npm install
   ```

3. Ejecuta el script de configuración de la base de datos:
   ```
   npm run setup-db
   ```

### Método manual (alternativa)

Si prefieres configurar la base de datos manualmente, sigue estos pasos:

1. Ve a [Supabase](https://supabase.com) e inicia sesión en tu cuenta
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a la sección "SQL Editor"
4. Ejecuta los scripts en el siguiente orden:
   - `migrations/00_setup_exec_sql.sql`
   - `migrations/01_schema.sql`
   - `migrations/02_create_admin.sql`

## Uso del usuario administrador

Después de ejecutar los scripts de configuración, podrás iniciar sesión con las siguientes credenciales:

- Email: codemaxon@gmail.com
- Contraseña: admin123

## Estructura de la base de datos

### Tabla `profiles`
Almacena información de los usuarios.
- `id`: UUID del usuario (referencia a auth.users)
- `name`: Nombre del usuario
- `email`: Email del usuario
- `phone`: Número telefónico (opcional)
- `profile_image`: URL de la imagen de perfil (opcional)
- `is_admin`: Indicador si el usuario es administrador
- `created_at`: Fecha de creación
- `last_login`: Último inicio de sesión

### Tabla `pets`
Contiene los registros de mascotas perdidas o en adopción con campos como:
- `id`: UUID único de la mascota
- `user_id`: ID del usuario que creó la publicación
- `title`: Título de la publicación
- `description`: Descripción detallada
- `pet_type`: Tipo de mascota (perro, gato, ave, conejo, otro)
- `pet_size`: Tamaño (pequeño, mediano, grande)
- `pet_color`: Color de la mascota
- `pet_gender`: Género (macho, hembra, desconocido)
- `pet_age`: Edad aproximada (cachorro, joven, adulto, senior, desconocido)
- `image_url`: URL de la imagen principal
- `additional_images`: URLs de imágenes adicionales
- `latitude` y `longitude`: Coordenadas donde se vio/encontró
- `address`: Dirección textual
- `status`: Estado (activo, inactivo, encontrado, adoptado)
- `views`: Contador de visualizaciones
- `created_at` y `updated_at`: Fechas de creación y última actualización
