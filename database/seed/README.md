# Datos de prueba (seed)

`seed-data.sql` carga datos de ejemplo para las 12 tablas del modelo de datos
(`docs/06-modelo-de-datos.md`), pensado para SQL Server.

## Cantidades

| Tabla | Filas | Motivo |
|---|---|---|
| Cliente | 100 | pedido |
| Reserva | 100 | pedido |
| Pago | 90 | 10 reservas quedan en `pendiente_pago` sin pago cargado todavía, a propósito — así se ve ese estado real |
| Jugador | ~88 | resultado de repartir 4-5 jugadores por equipo entre 20 equipos |
| Partido | 100 | pedido |
| Evento_partido | 100 | pedido |
| Deuda | 100 | pedido |
| Gasto | 100 | pedido |
| Espacio | 14 | cantidad realista para un complejo (100 canchas no tendría sentido) |
| Torneo | 3 | ídem |
| Zona | 5 | ídem (2 por torneo de liga/zonas, 1 para el de eliminación directa) |
| Equipo | 20 | ídem (4 por zona) |

## Cómo usar

1. Correr las migraciones / creación de tablas primero (el esquema de
   referencia está en `docs/06-modelo-de-datos.md`).
2. Ejecutar `seed-data.sql` contra la base — respeta el orden de dependencias
   de FK (Cliente y Espacio primero, Evento_partido al final antes de Deuda y
   Gasto).
3. Si los nombres reales de tabla/columna en el backend difieren de los del
   documento (por convención de Entity Framework, por ejemplo plural en inglés),
   ajustar los `INSERT INTO` con un buscar-y-reemplazar — los valores y el
   orden de columnas no cambian.

## Reproducibilidad

Generado con una semilla fija (`random.seed(42)`), así que si hace falta
regenerarlo con más o menos filas, el resultado es determinístico. El script
generador no se versiona acá porque no forma parte de la app — pedilo si lo
necesitás para ajustar cantidades.

## Contenido de ejemplo

- Torneos: **Apertura 2027** (zonas + playoffs), **Clausura 2027** (liga),
  **Copa Verano Pádel** (eliminación directa) — los tres formatos configurables
  que define `05-reglas-de-negocio.md` están representados.
- Reservas con los 4 medios de pago y los 5 estados posibles del pipeline
  (`pendiente_pago`, `pendiente_validacion`, `confirmada`, `cancelada`,
  `no_show`).
- Cancelaciones con reintegro de seña calculado según si la cancelación fue
  dentro o fuera de la ventana configurada del espacio.
