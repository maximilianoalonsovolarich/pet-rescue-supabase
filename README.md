# 🐾 Pet Rescue App

Aplicación web para publicar y gestionar información de mascotas callejeras o perdidas. Plataforma completa con funcionalidades para usuarios y administradores.

## 📋 Tecnologías

- **Next.js 14+**: Framework de React con renderizado del lado del servidor (SSR) y generación estática
- **TypeScript**: Tipado estático para un desarrollo más robusto
- **Supabase**: Base de datos, autenticación y almacenamiento de archivos
- **Material UI**: Componentes estilizados para una interfaz de usuario moderna
- **Leaflet**: Visualización de mapas interactivos
- **Formik + Yup**: Gestión de formularios y validación

## ✨ Características

### Generales
- Registro e inicio de sesión de usuarios con Supabase Auth
- Perfiles de usuario con datos de contacto e imagen
- CRUD completo de publicaciones de mascotas con múltiples imágenes
- Filtros avanzados y búsqueda
- Paginación de resultados
- Ubicación geográfica precisa con mapas
- Interfaz de usuario moderna, responsive y adaptable
- Modo oscuro/claro
- Panel de administración con estadísticas

### Usuario normal
- Publicar información de mascotas encontradas con múltiples imágenes
- Detalles extendidos sobre las mascotas (tamaño, género, edad, color)
- Ver publicaciones de otros usuarios con filtros avanzados
- Contactar con otros usuarios
- Gestionar y actualizar sus propias publicaciones
- Personalizar su perfil

### Administrador
- Panel de administración completo
- Estadísticas detalladas con gráficos
- Gestión de publicaciones y estados
- Gestión avanzada de usuarios
- Moderar contenido inapropiado

## 🚀 Instalación

### Requisitos previos
- Node.js (v18 o superior) y npm
- Cuenta en Supabase

### Configuración del entorno
1. Clona este repositorio
2. Copia el archivo `.env.local.example` a `.env.local` y configura las variables de entorno con tus credenciales de Supabase
3. Instala las dependencias: `npm install`
4. Ejecuta el servidor de desarrollo: `npm run dev`
5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 📱 Funcionalidades móviles
- Diseño completamente responsive
- Interfaz optimizada para dispositivos móviles
- Acceso a la cámara para tomar fotos directamente
- Geolocalización para marcar ubicación actual

## 👨‍💻 Credenciales de administrador
- Email: codemaxon@gmail.com
- Contraseña: admin123

## 🌐 Despliegue

Esta aplicación puede desplegarse fácilmente en plataformas como Vercel o Netlify. Configura las variables de entorno necesarias en la plataforma de despliegue.
