# Admin Dashboard Backend (Frontend + Supabase)

Un panel de administración en React (Vite + TypeScript) integrado con Supabase (Auth, DB y Storage) para gestionar productos multi-tenant (cada cliente ve/modifica solo sus propios productos), con carga de imágenes a Storage y control de inventario (SKU, stock, umbral, etc.).

## Características

- **Auth Supabase** con `@supabase/supabase-js` y contexto `AuthContext`.
- **Productos** con aislamiento por usuario (`user_id`) y RLS estrictas.
- **Cargas de imágenes** a bucket público `product-images` en Supabase Storage.
- **Inventario**: `sku`, `stock`, `track_inventory`, `low_stock_threshold` (colores Azul/Amarillo/Rojo según nivel).
- **Filtros de lista**: búsqueda, estado, y por `slug` (categoría).
- **Listo para deploy** en Vercel.

## Stack

- Frontend: Vite + React + TypeScript + TailwindCSS + Lucide Icons
- Backend BaaS: Supabase (Postgres + Auth + Storage)

## Requisitos

- Node 18+ y Bun
- Proyecto Supabase activo con URL y ANON KEY

## Variables de entorno

Crear `.env` o `.env.local` en la raíz con:

```env
VITE_SUPABASE_URL=https://<YOUR-PROJECT>.supabase.co
VITE_SUPABASE_ANON_KEY=<YOUR-ANON-KEY>
```

## Instalación

```bash
bun install
```

## Desarrollo

```bash
bun run dev
```

App en `http://localhost:5173/`.

## Build y Preview local

```bash
bun run build
bun run preview
```

## Funcionamiento de inventario

- `SKU`: identificador interno de producto (texto libre).
- `track_inventory`: habilita el control de stock en UI.
- `stock`: cantidad disponible (entero ≥ 0).
- `low_stock_threshold`: entero ≥ 0 (define “poco stock”).
- Colores en lista:
  - Rojo: `stock === 0`
  - Amarillo: `0 < stock <= low_stock_threshold`
  - Azul: `stock > low_stock_threshold`

## Licencia

