# Ambey Moda

Catálogo web de indumentaria de **Ambey Moda**. Está pensado para que los clientes encuentren prendas rápidamente y se comuniquen por WhatsApp; el equipo de la tienda puede administrar el catálogo desde el mismo sitio.

## ¿Qué se puede hacer?

### Como visitante

- Ver todos los productos disponibles.
- Buscar una prenda por nombre.
- Filtrar productos por categoría.
- Abrir la ficha de cada producto para ver descripción, disponibilidad y todas sus fotos.
- Ampliar las imágenes.
- Contactar a Ambey Moda por Instagram o WhatsApp. Desde el detalle, el mensaje de WhatsApp incluye automáticamente el nombre del producto consultado.

### Como administrador

Después de iniciar sesión desde **Cuenta**, se puede:

- Crear productos con imagen principal y fotos adicionales.
- Editar nombre, descripción, categoría, stock e imágenes de un producto.
- Eliminar productos que no tengan ventas registradas.
- Crear, renombrar y eliminar categorías.
- Mover productos entre categorías antes de eliminar una.

## Recorrido rápido

```text
Inicio
  ├─ Buscar o elegir una categoría
  ├─ Abrir un producto
  │    ├─ Ver fotos y disponibilidad
  │    └─ Consultar por WhatsApp
  └─ Cuenta (administración)
       ├─ Crear producto
       ├─ Editar producto
       └─ Administrar categorías
```

## Ejecutarlo localmente

Necesitás Node.js y un proyecto de Supabase.

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Luego abrí [http://127.0.0.1:5173](http://127.0.0.1:5173).

Antes de iniciar, completá el archivo `.env` con las credenciales públicas de Supabase:

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_KEY=TU_CLAVE_PUBLICA
```

En Supabase también hay que habilitar el proveedor de autenticación por email, crear el usuario administrador y ejecutar `supabase/security_policies.sql` en el SQL Editor.

## Estructura esencial

```text
src/
├── Inicio.jsx             Catálogo, buscador y filtros.
├── DetalleProducto.jsx    Ficha del producto, galería y edición.
├── CrearProducto.jsx      Formulario para cargar productos y fotos.
├── editarCategoria.jsx    Administración de categorías y sus productos.
├── Cuenta.jsx             Inicio y cierre de sesión.
├── Navbar.jsx             Navegación, Instagram y WhatsApp.
├── App.jsx                Rutas y protección de las pantallas privadas.
├── supabaseClient.js      Conexión con Supabase.
├── hooks/                 Estado de sesión y permiso de administrador.
└── utils/                 Conversión de imágenes a Base64.

supabase/
└── security_policies.sql  Permisos de lectura pública y edición autenticada.
```

## Datos que usa

El catálogo se conecta a Supabase y utiliza:

- `Productos`: nombre, descripción, imagen, categoría y stock.
- `categorias`: grupos para organizar el catálogo.
- `FotosProducto`: fotos extra y orden de la galería.
- `DetalleVentas`: evita borrar productos que ya tienen ventas asociadas.

## Tecnología

React + Vite para la interfaz, React Router para la navegación y Supabase para autenticación y base de datos.

## Comandos útiles

```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run preview  # Vista previa del build
npm run lint     # Revisión de código
```
