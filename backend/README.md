# Backend — ClubesApi

API REST en .NET 8 (ASP.NET Core) + Entity Framework Core + SQL Server.

## Estructura

```
src/
  ClubesApi.Domain/          Entidades y enums (sin dependencias externas)
  ClubesApi.Infrastructure/  DbContext, configuraciones EF Core y migraciones
  ClubesApi.Api/              Controllers, autenticación JWT, Program.cs
```

## Requisitos

- .NET 8 SDK
- SQL Server accesible (local, contenedor o Azure SQL)

## Configuración

Editar `src/ClubesApi.Api/appsettings.json` (o mejor, usar `dotnet user-secrets` /
variables de entorno en un ambiente real):

- `ConnectionStrings:ClubesDb` — cadena de conexión a SQL Server.
- `Jwt:Key` — secreto de firma de tokens (cambiar el valor de desarrollo).

## Correr localmente

```bash
dotnet restore
dotnet ef database update --project src/ClubesApi.Infrastructure --startup-project src/ClubesApi.Api
dotnet run --project src/ClubesApi.Api
```

Swagger queda disponible en `/swagger` en ambiente `Development`.

## Migraciones

```bash
dotnet ef migrations add NombreMigracion --project src/ClubesApi.Infrastructure --startup-project src/ClubesApi.Api --output-dir Data/Migrations
```

## Endpoints implementados (Fase 1 del roadmap)

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/espacios` (gestión de espacios, solo admin puede escribir)
- `GET/POST /api/reservas`, `POST /api/reservas/{id}/cancelar`
- `GET /api/pagos/pendientes-validacion`, `POST /api/pagos`, `POST /api/pagos/{id}/aprobar`, `POST /api/pagos/{id}/rechazar`
- `GET /api/clientes`, `GET /api/clientes/me`

Las entidades de Torneos (`Torneo`, `Zona`, `Equipo`, `Jugador`, `Partido`,
`EventoPartido`) y Económico (`Deuda`, `Gasto`) ya están en el modelo de datos y la
migración inicial, pero todavía no tienen controllers — corresponden a las Fases 2 y 3
del roadmap (ver `docs/07-roadmap-sugerido.md`).
