# Cachos

Tienda de calzado construida con React y Vite.

## Estructura

- `src/app`: composición y entrada de la aplicación.
- `src/pages`: páginas completas, como la página de inicio.
- `src/components/layout`: navegación, avisos y pie de página compartidos.
- `src/components/home`: secciones de la página de inicio.
- `src/features/catalog`: API, normalización, filtros y vista de catálogo.
- `src/features/cart`: estado y componentes del carrito.
- `src/data`: contenido estático de la tienda, incluido el catálogo y las fichas de productos.
- `src/utils`: utilidades compartidas, como el formato de precios.

## Desarrollo

El proyecto usa pnpm 10.8.1 mediante Corepack:

```powershell
corepack pnpm install
corepack pnpm dev
corepack pnpm lint
corepack pnpm build
```