# Pet Rescue Supabase

Aplicación para facilitar la gestión de mascotas perdidas y en adopción utilizando Supabase como backend.

## Configuración inicial de la base de datos

Para configurar la base de datos en Supabase, sigue estos pasos:

1. Ve a [Supabase](https://supabase.com) e inicia sesión en tu cuenta
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a la sección "SQL Editor"
4. Ejecuta los scripts en el siguiente orden:

### 1. Configuración de esquema y tablas

```sql
-- Copiar el contenido del archivo setup_database.sql
```

### 2. Creación del usuario administrador (opcional)

```sql
-- Copiar el contenido del archivo create_admin_user.sql
```

## Uso del usuario administrador

Después de ejecutar los scripts, puedes iniciar sesión con las siguientes credenciales:

- Email: codemaxon@gmail.com
- Contraseña: admin123

## Estructura de la base de datos

### Tabla `profiles`
Almacena información de los usuarios.

### Tabla `pets`
Contiene los registros de mascotas perdidas o en adopción con campos como:
- Tipo de mascota (perro, gato, etc.)
- Tamaño
- Género
- Edad
- Ubicación
- Estado (activo, inactivo, encontrado, adoptado)
