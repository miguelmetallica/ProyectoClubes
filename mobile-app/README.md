# App Cliente

Expo (React Native) + TypeScript. Consume la API de `../backend`.

## Configuración

La URL de la API se lee de `app.json` → `expo.extra.apiUrl`. Ajustar ese valor si el
backend no corre en `http://localhost:5237/api` (en un dispositivo físico o emulador
Android, `localhost` no apunta a la máquina host — usar la IP de la red local o
`10.0.2.2` en el emulador de Android).

## Correr localmente

```bash
npm install
npm start
```

## Estructura

```
src/screens/        Pantallas: Login, Register, Inicio, Reservar, MisReservas, Torneos, Pagos, Club
src/navigation/      Stack de auth + tabs principales (React Navigation)
src/lib/api.ts       Cliente HTTP hacia el backend
src/lib/auth-context.tsx   Sesión (JWT) persistida en AsyncStorage
```

Torneos ya consume la API real (selector de torneo, tabla de posiciones y fixture, de
solo lectura). Pagos sigue como placeholder: no hay endpoint de historial de pagos del
cliente todavía (Fase 2 del roadmap, ver `../docs/07-roadmap-sugerido.md`). Reservar usa
inputs de texto para fecha/horario en lugar de la grilla de disponibilidad por franjas
de `docs/04-pantallas.md`, que requiere que el backend exponga los horarios libres por
espacio y fecha.
