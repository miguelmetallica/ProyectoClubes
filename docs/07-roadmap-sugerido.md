# 07 · Roadmap sugerido

Propuesta de orden de construcción. No es una estimación de tiempos —depende del
equipo— sino una sugerencia de **qué habilita qué**, para no bloquearse.

## Fase 1 — Núcleo de reservas (MVP)

Sin esto no hay negocio funcionando; es el mínimo para reemplazar la gestión
manual actual.

- Entidades: `Cliente`, `Espacio`, `Reserva`, `Pago`.
- Pantallas cliente: Inicio, Selección de espacio, Calendario de disponibilidad,
  Confirmación y pago, Mis reservas.
- Pantallas admin: Gestión de espacios, Calendario maestro, Dashboard básico.
- Al menos **un** medio de pago funcionando de punta a punta (recomendado:
  Mercado Pago, por ser confirmación automática) antes de sumar los otros tres.
- Cancelación con seña/ventana configurable por espacio.

## Fase 2 — Cerrar el circuito de pago y cobranza

- Sumar transferencia (con `Validar pagos`) y efectivo.
- Tarjeta directa si se decide una pasarela propia (puede convivir con Mercado
  Pago o reemplazarlo, a definir con el negocio).
- Módulo económico: `Deuda`, `Gasto`, reportes de balance.

## Fase 3 — Torneos

- Entidades: `Torneo`, `Zona`, `Equipo`, `Jugador`, `Partido`, `Evento_partido`.
- Empezar por **un solo** `sistema_competencia` para el primer torneo real
  (definir con el negocio cuál), aunque el campo quede modelado como enum
  abierto a los tres desde el día uno.
- Pantallas: Crear torneo, Equipos, Carga de resultados, Tabla de posiciones
  (cliente).

## Fase 4 — Reportes y afinado

- Reportes de ocupación/rentabilidad por espacio y horario.
- Revisar con datos reales los puntos abiertos de `05-reglas-de-negocio.md`
  (seña mínima para efectivo, vencimiento automático de transferencias
  pendientes).

## Más adelante (fuera de este roadmap)

- Clases con instructor.
- Otros deportes más allá de fútbol/pádel/natación.

## Cómo usar esto

Cada fase es un conjunto de entidades + pantallas que ya están completamente
especificadas en `04-pantallas.md` y `06-modelo-de-datos.md` — no hace falta
volver a discutir el alcance funcional para arrancar, solo priorizar el orden
según la fecha de lanzamiento que maneje el negocio.
