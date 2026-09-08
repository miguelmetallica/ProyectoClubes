# Panel Administrador

Next.js + React + TypeScript + Tailwind. Consume la API de `../backend`.

## Configuración

```bash
cp .env.local.example .env.local
```

Ajustar `NEXT_PUBLIC_API_URL` si el backend no corre en `http://localhost:5237/api`.

## Correr localmente

```bash
npm install
npm run dev
```

## Estructura

```
src/app/login/            Login
src/app/(admin)/           Rutas protegidas (requieren sesión con rol Admin)
  page.tsx                  Dashboard
  espacios/                 Gestión de espacios (CRUD completo)
  calendario/                Calendario maestro (lectura)
  clientes/                   Listado de clientes
  pagos/                        Validar pagos (aprobar/rechazar transferencias)
  torneos/, reportes/, configuracion/   Placeholders — Fases 3 y 4 del roadmap
src/lib/api.ts              Cliente HTTP hacia el backend
src/lib/auth-context.tsx    Sesión (JWT) persistida en localStorage
```
