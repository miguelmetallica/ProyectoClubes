# ProyectoClubes — Sistema de Reservas Multideporte + Torneos

Sistema de gestión para un complejo de alquiler de canchas (fútbol, pádel y otros
deportes) y piletas de natación, con un módulo de torneos propios integrado.

Adaptado a partir del análisis de la app **Las Cañas** (referencia de mercado para
gestión de torneos), extendido con un motor de reservas de espacios, pagos y
administración económica que Las Cañas no cubre.

## Qué incluye este repositorio

Esta primera entrega es **documentación funcional y técnica**, pensada para que el
equipo de desarrollo pueda arrancar a programar sin depender de reuniones previas.
No incluye código todavía.

| Documento | Contenido |
|---|---|
| [`docs/01-vision-y-alcance.md`](docs/01-vision-y-alcance.md) | Qué es el sistema, para quién, y qué queda fuera de esta primera versión |
| [`docs/02-arquitectura-y-navegacion.md`](docs/02-arquitectura-y-navegacion.md) | Las dos partes del sistema (Panel Admin web + App Cliente móvil) y su navegación |
| [`docs/03-flujos-clave.md`](docs/03-flujos-clave.md) | Flujo de reserva, flujo de pago (4 medios), flujo de cancelación, flujo de torneo |
| [`docs/04-pantallas.md`](docs/04-pantallas.md) | Inventario completo de pantallas: objetivo, qué muestra, cómo funciona, de dónde sale |
| [`docs/05-reglas-de-negocio.md`](docs/05-reglas-de-negocio.md) | Seña, cancelación, medios de pago, formato de torneo — todo lo decidido y lo que falta precisar |
| [`docs/06-modelo-de-datos.md`](docs/06-modelo-de-datos.md) | Entidades, campos, tipos sugeridos y relaciones — listo para migraciones |
| [`docs/07-roadmap-sugerido.md`](docs/07-roadmap-sugerido.md) | Propuesta de fases de construcción (MVP → V2) |

## Origen

Este diseño funcional nace de adaptar el sistema **Club Sports** (torneos de fútbol
y pádel, inspirado en la app Las Cañas) a un negocio de alquiler de espacios
deportivos. Cada decisión en estos documentos indica si viene de ese análisis
original (**Documento**) o es una incorporación específica para este negocio
(**Nuevo**), siguiendo el mismo criterio de no asumir nada que no esté definido.

Existe además una referencia visual (mockups de cada pantalla) generada durante el
diseño funcional; pedila al equipo de producto si hace falta como apoyo para UI/UX.
