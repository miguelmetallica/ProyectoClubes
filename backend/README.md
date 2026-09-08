# Backend — ClubesApi

API REST en .NET 10 (ASP.NET Core) + Entity Framework Core + SQL Server.

## Estructura

```
src/
  ClubesApi.Domain/          Entidades y enums (sin dependencias externas)
  ClubesApi.Infrastructure/  DbContext, configuraciones EF Core y migraciones
  ClubesApi.Api/              Controllers, autenticación JWT, Program.cs
```

## Requisitos

- .NET 10 SDK (elegido por ser la versión LTS más nueva disponible al momento de armar
  el proyecto — soporte largo, igual que .NET 8; .NET 9 es "STS", con soporte más corto)
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

### Primer usuario admin

`POST /api/auth/register` siempre crea clientes con rol `Cliente` — no hay forma de
crear un admin desde la API. Al arrancar, `AdminSeeder` crea automáticamente un usuario
Admin si están configurados `Seed:AdminEmail` y `Seed:AdminPassword` (ambos vacíos por
defecto en `appsettings.json`, así que en producción no seedea nada hasta que se
configuren explícitamente). Es idempotente: si el email ya existe, no hace nada.

En **Development** (`appsettings.Development.json`) ya viene configurado un admin de
desarrollo:

```
email: admin@clubes.local
password: Admin123!
```

⚠️ Son credenciales de desarrollo, no secretas — **nunca configurar `Seed:AdminEmail`/
`Seed:AdminPassword` en producción con esta contraseña**. En un ambiente real, definir
esas dos variables (vía `dotnet user-secrets` o variables de entorno) con una contraseña
propia solo la primera vez, o crear el admin a mano y no configurar el seed.

## Notas técnicas importantes

Dos gotchas de ASP.NET Core que costó encontrar (solo aparecen en runtime, contra una
base de datos real — nunca en `dotnet build` ni generando el Swagger) y que no hay que
revertir sin querer:

- **DTOs de request son records con constructor primario**: los atributos de validación
  van sin el prefijo `property:` (`[Required]`, no `[property: Required]`). Usar
  `[property: ...]` hace que ASP.NET Core tire `InvalidOperationException` al validar
  *cualquier* request con body — rompe todos los POST/PUT de la API.
- **`AddJwtBearer` tiene `options.MapInboundClaims = false`** en `Program.cs`. Sin esto,
  ASP.NET Core remapea el claim corto `sub` a la URI larga `ClaimTypes.NameIdentifier`
  al validar el token, y `ClaimsPrincipalExtensions.GetClienteId()` deja de encontrarlo
  — rompe todo endpoint autenticado que necesite el usuario actual.

También: al agrupar (`GroupBy`) sobre resultados que vienen de varios `Include`/joins de
navegación, no se puede proyectar directo a un record con un agregado (`g.Count()`) en el
mismo `Select` — EF Core no lo traduce a SQL. El patrón usado en el proyecto (ver
`TorneosController.GetTarjetas`, `GetGoleadores`, `ReportesController.GetHorariosPico`)
es materializar con `.ToListAsync()` primero y agrupar en memoria después.

## Migraciones

```bash
dotnet ef migrations add NombreMigracion --project src/ClubesApi.Infrastructure --startup-project src/ClubesApi.Api --output-dir Data/Migrations
```

## Endpoints implementados

**Fase 1 — núcleo de reservas**
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/espacios` (gestión de espacios, solo admin puede escribir)
- `GET/POST /api/reservas`, `POST /api/reservas/{id}/cancelar` (el monto a reintegrar
  es lo realmente pagado y validado, no un cálculo teórico — si nunca se cobró nada, no
  hay nada que reintegrar)
- `GET /api/clientes`, `GET /api/clientes/me`

**Fase 2 — cobranza y económico**
- `POST /api/pagos` (los 4 medios; Mercado Pago crea una preferencia real y devuelve
  `checkoutUrl`; tarjeta directa es la única que confirma al instante, como placeholder
  hasta que el negocio elija una pasarela; transferencia y efectivo quedan `Pendiente`
  hasta que un admin los confirma manualmente. Valida que el monto sea al menos la seña
  del espacio, y que la reserva no tenga ya un pago activo — `Reserva` tiene muchos
  `Pago` a lo largo del tiempo, no uno solo, para permitir reintentar tras un rechazo)
- `POST /api/pagos/webhook/mercadopago` (público, sin auth: notificación de Mercado Pago)
- `GET /api/pagos/pendientes-validacion` (transferencias y efectivo pendientes),
  `POST /api/pagos/{id}/aprobar`, `POST /api/pagos/{id}/rechazar` (ambos aplican a
  transferencia o efectivo — para efectivo es "el cliente pagó en persona al llegar")
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

**Fase 4 — reportes y afinado**
- `GET/PUT /api/configuracion` (horarios de apertura del complejo — fila única, se crea
  con valores por defecto la primera vez que se consulta)
- `GET /api/reportes/ocupacion` ahora devuelve además `horasOcupadas` y `ocupacionPct`,
  calculado contra los horarios de apertura configurados
- `GET /api/reportes/horarios-pico` (franjas horarias más reservadas en el rango elegido)
- `Espacio.VencimientoValidacionHoras`: configurable por espacio (0 = sin vencimiento).
  Un `BackgroundService` (`VencimientoReservasService`, corre cada 15 minutos) cancela
  automáticamente las reservas con transferencia pendiente de validación que superaron
  ese vencimiento, resolviendo el "Punto a evaluar" de `docs/05-reglas-de-negocio.md`
  sobre turnos "tomados" sin pago real confirmado.
- Se agregó un `JsonConverter<TimeOnly>` global: el converter por defecto de .NET solo
  acepta `"HH:mm:ss"`, pero el `<input type="time">` de HTML produce `"HH:mm"`. Ahora la
  API acepta ambos formatos al leer y siempre serializa como `"HH:mm"`.

La pasarela de tarjeta directa sigue "a definir" (ver `docs/05-reglas-de-negocio.md`):
no se integró ninguna porque el negocio todavía no eligió cuál. La seña mínima para
efectivo tampoco se implementó — el mismo documento dice explícitamente que se revisa
"cuando se ajuste Configuración con datos reales de no-show".
