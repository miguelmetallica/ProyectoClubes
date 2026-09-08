# 05 · Reglas de negocio

Decisiones tomadas con el dueño del negocio durante el diseño funcional.

## Modalidad de pileta

Conviven **dos modalidades**, no una sola:
- Turno de **pileta completa** (grupos, familias, eventos).
- Reserva por **carril individual** (nado libre).

La pantalla de Selección de espacio debe ofrecer ambas como opciones distintas
del mismo espacio físico, con su propio precio y disponibilidad.

## Clases con instructor

**Fuera de v1.** Se documenta para que el modelo de datos no la haga imposible
de agregar después (ver nota en `06-modelo-de-datos.md`), pero no se construye
pantalla ni lógica ahora.

## Medios de pago

Los 4 se ofrecen desde el lanzamiento:
1. Mercado Pago
2. Tarjeta de crédito/débito directa
3. Transferencia bancaria (con validación manual)
4. Efectivo en el club

## Seña y cancelación — configurables por espacio, no globales

- **% de seña**: es un campo del espacio (`Espacio.pct_sena`), no una constante
  del sistema. Ejemplo: cancha de fútbol 50%, pileta por carril un valor más
  bajo (el turno es más barato), pileta completa 50%.
- **Ventana de cancelación sin cargo**: mismo criterio
  (`Espacio.ventana_cancelacion_horas`). Ejemplo: cancha 24hs, pileta 12hs.

> Los valores numéricos exactos para el primer torneo/temporada quedan a
> criterio del administrador al cargar cada espacio en Configuración — el
> sistema debe permitir cualquier valor, no hardcodear un default fijo.

### Punto a evaluar (no bloqueante)

Permitir efectivo sin ninguna seña previa deja el turno más expuesto a
ausencias (no-show). Alternativa a considerar más adelante: exigir siempre una
seña mínima por Mercado Pago o transferencia, y dejar "efectivo" solo para
pagar el saldo restante al llegar. No se resuelve en v1; queda para cuando se
ajuste Configuración con datos reales de no-show.

### Punto a evaluar (no bloqueante)

Si nadie valida una transferencia a tiempo, el horario queda "tomado" sin pago
real. Se recomienda un vencimiento automático configurable (mismo criterio que
la ventana de cancelación) que libere el turno si no se sube comprobante dentro
de X horas. No se resuelve en v1.

## Formato de torneo — configurable, no fijo

No se define un único formato de competencia. El Motor de Torneos debe soportar,
como opciones al crear cada torneo:
- **Zonas + playoffs** (fase de grupos + semifinales/final).
- **Liga** (todos contra todos, tabla única).
- **Eliminación directa** (cuadro).

La decisión de cuál usar para el primer torneo real se toma más adelante, sin
bloquear el diseño de datos: el campo `Torneo.sistema_competencia` es un enum
abierto a los tres valores desde el modelo inicial.

## Torneos: parte estable del negocio

Los torneos propios (fútbol/pádel) **no son un módulo opcional** — son parte
estable del negocio desde el lanzamiento, con el mismo nivel de prioridad que
las reservas sueltas.
