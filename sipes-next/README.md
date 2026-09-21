# SIPES Next

Frontend de SIPES para el Sprint 1. Consume directamente el backend NestJS real; no contiene mocks ni rutas API simuladas.

## Inicio local

1. Levanta `../Backend` en `http://localhost:3001`.
2. Copia `.env.example` como `.env.local` si necesitas cambiar la URL.
3. Ejecuta `npm install` y luego `npm run dev`.
4. Abre `http://localhost:3000/pedidos`.

## Variables

- `SIPES_API_URL`: origen del backend NestJS, sin `/api` al final.

La documentación de la estructura está en `docs/ESTRUCTURA_SPRINT_1.md`.
