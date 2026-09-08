# ProyectoClubes — Sistema de Reservas Multideporte + Torneos

Sistema de gestión para un complejo de alquiler de canchas (fútbol, pádel y otros
deportes) y piletas de natación, con un módulo de torneos propios integrado.

Adaptado a partir del análisis de la app **Las Cañas** (referencia de mercado para
gestión de torneos), extendido con un motor de reservas de espacios, pagos y
administración económica que Las Cañas no cubre.

## Qué incluye este repositorio

Además de la documentación funcional y técnica, el repositorio ya tiene el **esqueleto
de código** de las tres partes del sistema, listo para ir sumando la lógica de negocio
de cada fase del roadmap.

| Documento | Contenido |
|---|---|
| [`docs/01-vision-y-alcance.md`](docs/01-vision-y-alcance.md) | Qué es el sistema, para quién, y qué queda fuera de esta primera versión |
| [`docs/02-arquitectura-y-navegacion.md`](docs/02-arquitectura-y-navegacion.md) | Las dos partes del sistema (Panel Admin web + App Cliente móvil) y su navegación |
| [`docs/03-flujos-clave.md`](docs/03-flujos-clave.md) | Flujo de reserva, flujo de pago (4 medios), flujo de cancelación, flujo de torneo |
| [`docs/04-pantallas.md`](docs/04-pantallas.md) | Inventario completo de pantallas: objetivo, qué muestra, cómo funciona, de dónde sale |
| [`docs/05-reglas-de-negocio.md`](docs/05-reglas-de-negocio.md) | Seña, cancelación, medios de pago, formato de torneo — todo lo decidido y lo que falta precisar |
| [`docs/06-modelo-de-datos.md`](docs/06-modelo-de-datos.md) | Entidades, campos, tipos sugeridos y relaciones — listo para migraciones |
| [`docs/07-roadmap-sugerido.md`](docs/07-roadmap-sugerido.md) | Propuesta de fases de construcción (MVP → V2) |

## Estructura del monorepo

| Carpeta | Qué es | Stack |
|---|---|---|
| [`backend/`](backend/) | API REST | .NET 8 (ASP.NET Core) + Entity Framework Core + SQL Server |
| [`admin-panel/`](admin-panel/) | Panel de Administración (web/tablet) | Next.js + React + TypeScript + Tailwind |
| [`mobile-app/`](mobile-app/) | App del Cliente (celular) | Expo (React Native) + TypeScript |

Cada carpeta tiene su propio README con instrucciones de instalación y ejecución.
En términos generales:

```bash
# Backend (requiere SQL Server; ver backend/README.md para la connection string)
cd backend
dotnet ef database update --project src/ClubesApi.Infrastructure --startup-project src/ClubesApi.Api
dotnet run --project src/ClubesApi.Api

# Panel Administrador
cd admin-panel
cp .env.local.example .env.local   # ajustar NEXT_PUBLIC_API_URL si hace falta
npm install
npm run dev

# App Cliente
cd mobile-app
npm install
npm start
```

### Estado actual (alineado con `docs/07-roadmap-sugerido.md`)

- **Modelado por completo**: las 12 entidades del modelo de datos (Identidad/Reservas,
  Torneos, Económico) ya están creadas en `backend/`, con su migración inicial de EF Core.
- **Fase 1 (núcleo de reservas)**: expuesta como API — autenticación JWT, `Espacios`,
  `Reservas` (con detección de solapamiento y cancelación según ventana configurable por
  espacio) y `Pagos`. El panel admin y la app cliente ya consumen estos endpoints.
- **Fase 2 (cobranza)**: los 4 medios de pago funcionando (Mercado Pago con preferencia
  real + webhook de confirmación, transferencia con validación manual, tarjeta directa
  y efectivo), más el módulo económico completo (`Deuda`, `Gasto`) y un balance general
  en Reportes. La pasarela de tarjeta sigue siendo un placeholder porque el negocio
  todavía no eligió cuál usar (ver `docs/05-reglas-de-negocio.md`).
- **Fase 3 (torneos)**: entidades modeladas en la base de datos, pero sin endpoints ni
  pantallas todavía — es el próximo paso natural.
- **Fase 4 (reportes)**: el balance y la facturación por espacio ya están; falta el %
  de ocupación real, que requiere modelar los horarios de apertura del complejo.

## Origen

Este diseño funcional nace de adaptar el sistema **Club Sports** (torneos de fútbol
y pádel, inspirado en la app Las Cañas) a un negocio de alquiler de espacios
deportivos. Cada decisión en estos documentos indica si viene de ese análisis
original (**Documento**) o es una incorporación específica para este negocio
(**Nuevo**), siguiendo el mismo criterio de no asumir nada que no esté definido.

Existe además una referencia visual (mockups de cada pantalla) generada durante el
diseño funcional; pedila al equipo de producto si hace falta como apoyo para UI/UX.
