# 04 · Inventario de pantallas

Convención: **Doc.** = viene de la referencia de mercado (Las Cañas / Club
Sports). **Nuevo** = incorporación específica de este negocio. **Futuro** = fuera
de alcance de v1, documentado para no bloquear el modelo de datos.

## App Cliente

### Inicio — Doc.
Resumen del próximo turno propio y accesos directos a Reservar, Mis reservas y
Torneos.

### Selección de espacio — Nuevo
El cliente elige deporte, cancha o pileta. Para pileta, además elige modalidad:
turno completo o carril individual.

### Calendario de disponibilidad — Nuevo
La pantalla con más impacto del sistema. Muestra:
- Espacio/deporte elegido en el paso anterior.
- Selector de fecha (pills horizontales, día actual activo por defecto).
- Franjas horarias del día con 3 estados: libre, ocupado, seleccionado.
- Precio por franja.
- Monto de seña calculado según el % configurado para ese tipo de espacio.

Tocar una franja libre la selecciona y habilita "Reservar"; las franjas ocupadas
no son tocables. Lleva a Confirmación y pago.

Datos: `espacio_id, fecha, hora_inicio, hora_fin, estado, precio, modalidad`.

### Confirmación y pago — Nuevo
Resumen del turno (espacio, fecha, hora, precio) + selector de los 4 medios de
pago, cada uno con aviso de qué pasa después de elegirlo (confirmación
automática vs. pendiente de validación vs. pago al llegar). El botón cambia de
texto y monto según el medio.

Datos: `pago_id, reserva_id, metodo, monto, estado, comprobante_url, fecha_pago`.

### Mis reservas — Nuevo
Tabs: Próximas / Historial / Canceladas. Cada tarjeta muestra el estado
(Confirmada / Pendiente de validación / Pago pendiente) y, si corresponde,
acceso al comprobante subido. Botón "Cancelar" con el resultado de la política
ya calculado antes de confirmar (reintegro o pérdida de seña).

Datos adicionales: `cancelada_en, motivo_cancelacion, monto_reintegrado`.

### Torneos / Tabla de posiciones — Doc.
Selector de torneo/zona. Tabs: Tabla / Fixture / Estadísticas. Tabla resumida
(Pos, Equipo, PJ, DG, Pts) que se expande a la vista completa (PJ/G/E/P/GF/GC/DG/Pts).
Al tocar un equipo, **Perfil del equipo**: posición, puntos, PJ/G/E/P, goles a
favor/en contra, diferencia de gol, últimos 5 partidos, próximo partido, plantel,
goleadores, tarjetas, historial de enfrentamientos.

### Club — Doc.
Contacto, ubicación, horarios, reglamento del complejo y del torneo.

### Notificaciones — Doc.
Confirmaciones de reserva, recordatorios, resultados de validación de pago y
novedades del club/torneo.

## Panel Administrador

### Dashboard — Nuevo
KPIs del día: turnos de hoy, ingresos de hoy, ocupación de hoy (%), pagos por
validar (con contador). Lista de alertas/pendientes (comprobantes esperando
validación, partidos de torneo sin resultado cargado).

### Gestión de espacios — Nuevo
Alta/baja de canchas y piletas. Por cada espacio: deporte, modalidad, precio
base, **% de seña** y **ventana de cancelación en horas** — ambos configurables
por tipo de espacio, no globales.

### Calendario maestro — Nuevo
Vista consolidada de todos los espacios (filas) por franja horaria (columnas),
para detectar huecos y evitar solapamientos. Los partidos de torneo también
ocupan un espacio acá — comparten el mismo calendario que las reservas sueltas.

### Clientes — Doc. (jugadores → clientes)
Fichas de cliente: datos de contacto, historial de reservas, deudas.

### Validar pagos — Nuevo
Cola de comprobantes de transferencia pendientes: cliente, turno, monto,
comprobante, hace cuánto se cargó. Acciones: **Aprobar** (confirma el turno y
notifica) / **Rechazar** (pide motivo, vuelve a pendiente de pago).

Datos adicionales: `validado_por, validado_en, motivo_rechazo`.

### Torneos (admin) — Doc.
**Crear torneo**: nombre, deporte, categoría, cantidad de equipos, sistema de
competencia (desplegable: zonas + playoffs / liga / eliminación directa),
puntos por victoria/empate/derrota. Botón "Generar fixture automáticamente".

**Equipos**: alta de equipo con capitán asignado (un cliente existente), contador
de jugadores.

**Plantel/Jugadores**: alta, edición y baja de jugadores por equipo (número,
posición).

**Carga de resultados**: selector de partido, marcador editable, formulario para
registrar eventos (gol / asistencia / amarilla / roja) por jugador y minuto.
Al guardar, dispara el recálculo automático de tabla y estadísticas.

### Reportes — Doc. (extendido)
Ocupación (%) y facturación por espacio en un rango de fechas, más un ranking de
horarios pico. Se calcula agregando `Reserva` y `Pago` — no requiere entidades
nuevas.

### Configuración — Nuevo
Horarios de apertura del complejo; edición de % de seña y ventana de
cancelación por tipo de espacio (ver `05-reglas-de-negocio.md`).

## Fuera de v1

### Clases con instructor — Futuro
Reserva de clases recurrentes (natación, pádel) con instructor asignado y cupo.
No se construye en v1; el modelo de datos no debe asumirla pero tampoco
bloquearla a futuro.
