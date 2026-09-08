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
- `MercadoPago:AccessToken` — access token de la cuenta de Mercado Pago (sandbox o
  producción). Sin esto, crear un pago con `metodo=MercadoPago` falla al llamar a la API real.
- `MercadoPago:NotificationUrl` — URL pública (no `localhost`) a la que Mercado Pago
  envía el webhook de confirmación; en desarrollo se puede exponer con una herramienta
  de túnel (ngrok o similar).

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

## Endpoints implementados

**Fase 1 — núcleo de reservas**
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/espacios` (gestión de espacios, solo admin puede escribir)
- `GET/POST /api/reservas`, `POST /api/reservas/{id}/cancelar`
- `GET /api/clientes`, `GET /api/clientes/me`

**Fase 2 — cobranza y económico**
- `POST /api/pagos` (los 4 medios; Mercado Pago crea una preferencia real y devuelve
  `checkoutUrl`, tarjeta directa confirma al instante como placeholder hasta que el
  negocio elija una pasarela, transferencia y efectivo igual que en Fase 1)
- `POST /api/pagos/webhook/mercadopago` (público, sin auth: notificación de Mercado Pago)
- `GET /api/pagos/pendientes-validacion`, `POST /api/pagos/{id}/aprobar`, `POST /api/pagos/{id}/rechazar`
- `GET/POST/DELETE /api/deudas`, `POST /api/deudas/{id}/marcar-pagada`
- `GET/POST/DELETE /api/gastos`
- `GET /api/reportes/balance`, `GET /api/reportes/ocupacion`

**Fase 3 — torneos**
- `GET/POST /api/torneos` (al crear un torneo se genera automáticamente una "Zona Única")
- `GET/POST /api/torneos/{id}/equipos`
- `GET/POST /api/equipos/{equipoId}/jugadores`, `DELETE /api/jugadores/{id}`
- `POST /api/torneos/{id}/generar-fixture` (round-robin todos-contra-todos; **solo Liga**
  por ahora — zonas+playoffs y eliminación directa quedan como valores válidos del enum
  `sistema_competencia` pero sin generador automático todavía)
- `GET /api/torneos/{id}/fixture`
- `PUT /api/partidos/{id}/programar` (asigna espacio/fecha/hora; valida que no choque con
  una reserva ni con otro partido en el mismo espacio/horario — así comparte el
  Calendario Maestro con las reservas sueltas)
- `POST /api/partidos/{id}/resultado` (marcador + eventos de gol/asistencia/tarjeta;
  recargar el resultado reemplaza los eventos anteriores)
- `GET /api/partidos` (partidos ya programados en un rango de fechas, para el Calendario Maestro)
- `GET /api/torneos/{id}/tabla`, `/goleadores`, `/tarjetas` (siempre calculados sobre
  `Partido` + `EventoPartido`, nunca cargados a mano)

`Partido.EspacioId/Fecha/Hora` son opcionales: el fixture se genera antes de saber
cuándo/dónde se juega cada partido (estado `Generado`); `PUT .../programar` los completa
y pasa el partido a `Programado`.

La pasarela de tarjeta directa sigue "a definir" (ver `docs/05-reglas-de-negocio.md`):
no se integró ninguna porque el negocio todavía no eligió cuál.
