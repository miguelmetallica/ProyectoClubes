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
  calendario/                Calendario maestro (reservas + partidos ya programados)
  clientes/                   Listado de clientes + deudas por cliente (alta/marcar pagada)
  pagos/                        Validar pagos (aprobar/rechazar transferencias)
  gastos/                        Alta/baja de gastos
  reportes/                     Balance general y facturación por espacio (rango de fechas)
  torneos/                       Crear torneo, equipos/jugadores, generar fixture,
                                    programar partidos, cargar resultados, tabla/goleadores/tarjetas
  configuracion/                Placeholder — horarios de apertura
src/lib/api.ts              Cliente HTTP hacia el backend
src/lib/auth-context.tsx    Sesión (JWT) persistida en localStorage
```
