# 01 · Visión y alcance

## Qué es

Una plataforma de dos partes para un complejo que alquila canchas de varios
deportes (fútbol, pádel, otros) y piletas de natación, y que además organiza sus
propios torneos:

1. **Panel de Administración** (web/tablet) — gestión completa del negocio.
2. **App del Cliente** (celular) — reserva de turnos, pago, y seguimiento de torneos.

## Para quién

- **Cliente**: alquila un turno suelto (cancha o pileta) y/o participa de un torneo.
- **Capitán de equipo**: cliente con un rol adicional dentro de un torneo.
- **Administrador**: dueño/operador del complejo, gestiona espacios, turnos, pagos
  y torneos.

## Qué resuelve esta primera versión (v1)

- Reserva de espacios multideporte, incluyendo pileta en dos modalidades: turno de
  pileta completa y reserva por carril individual.
- Pago de la seña por 4 medios: Mercado Pago, tarjeta directa, transferencia
  bancaria (con validación manual) y efectivo en el club.
- Cancelación con política de seña y ventana configurable **por tipo de espacio**
  (no un valor único para todo el complejo).
- Torneos propios de fútbol/pádel: creación, equipos, jugadores, carga de
  resultados y tabla de posiciones generada automáticamente (nunca cargada a mano).
- Dashboard y reportes de ocupación/rentabilidad por espacio.
- Módulo económico: pagos, deudas, gastos y balance.

## Qué queda fuera de v1 (a propósito)

Estas decisiones fueron tomadas explícitamente para no bloquear el arranque del
desarrollo — están documentadas, no olvidadas:

- **Clases con instructor** (natación, pádel): fuera de v1. El modelo de datos no
  debe asumirlas, pero tampoco debe hacerlas imposibles de agregar después.
- **Formato de torneo fijo**: no se define un único formato. El sistema debe
  soportar zonas + playoffs, liga (todos contra todos) y eliminación directa como
  **opciones configurables** al crear cada torneo — ver `05-reglas-de-negocio.md`.
- **% de seña y ventana de cancelación como valores globales**: se definieron como
  **campos configurables por tipo de espacio**, no como una constante del sistema.

## Referencia de mercado

El punto de partida fue el análisis de la app **Las Cañas**, que centraliza
información de torneos (resultados, goleadores, estadísticas, tabla de
posiciones) pero **no gestiona reservas de espacios ni pagos** — ahí está la
diferencia central de este proyecto: Las Cañas *muestra* una tabla ya armada,
este sistema tiene que *generarla* sola.
