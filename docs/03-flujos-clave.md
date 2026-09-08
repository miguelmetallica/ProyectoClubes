# 03 · Flujos clave

## 1. Flujo de reserva

1. El cliente elige deporte/espacio (para pileta: turno completo o carril).
2. Ve el calendario de disponibilidad del espacio elegido (franjas libres/ocupadas
   con precio).
3. Selecciona una franja libre → pasa a Confirmación y pago.
4. Confirma con uno de los 4 medios de pago → la reserva queda en un estado según
   el medio (ver punto 2).
5. La reserva confirmada aparece en "Mis reservas" del cliente y en el Calendario
   Maestro del admin.

## 2. Flujo de pago — 4 medios, 4 circuitos distintos

| Medio | Resultado inmediato |
|---|---|
| Mercado Pago | Confirmada al instante (webhook de Mercado Pago) |
| Tarjeta directa | Confirmada al instante (pasarela de tarjeta a definir) |
| Transferencia bancaria | **Pendiente de validación** — requiere comprobante |
| Efectivo en el club | Reservada, pago pendiente al llegar |

### Estados de una reserva (pipeline)

```
Pendiente de pago → Pendiente de validación (solo transferencia) → Confirmada
                                                                  ↘ Cancelada / No-show
```

### Circuito de transferencia (el único con paso manual)

1. Cliente sube el comprobante desde la app.
2. La reserva queda en estado `pendiente_validacion`.
3. El administrador la ve en **Validar pagos** (panel), con cliente, turno, monto
   y el comprobante.
4. **Aprobar** → reserva pasa a `confirmada`, se notifica al cliente.
5. **Rechazar** → se pide motivo, la reserva vuelve a `pendiente_pago`, se notifica
   al cliente para que resuba o cambie de medio.

> ⚠️ Punto abierto (ver `05-reglas-de-negocio.md`): definir un vencimiento
> automático para reservas sin validar, para no dejar un horario "tomado"
> indefinidamente sin pago real confirmado.

## 3. Flujo de cancelación

1. El cliente entra a "Mis reservas" y toca "Cancelar" sobre un turno.
2. El sistema calcula, con la hora actual, la hora del turno y la
   `ventana_cancelacion_horas` configurada **para ese espacio**, si todavía está
   dentro del margen sin cargo.
3. Si está dentro de la ventana → se informa el monto a reintegrar y se libera el
   horario en el Calendario Maestro.
4. Si está fuera de la ventana → se informa que se pierde la seña, se pide una
   segunda confirmación, y recién ahí se cancela.

## 4. Flujo de torneo — carga de resultados

1. El administrador crea el torneo (nombre, deporte, categoría, cantidad de
   equipos, sistema de competencia, puntos por victoria/empate/derrota) y genera
   el fixture automáticamente.
2. Carga equipos y planteles (jugadores con número y posición).
3. Para cada partido jugado: carga el marcador y registra los eventos (goles,
   asistencias, tarjetas amarillas/rojas) por jugador y minuto.
4. Al guardar, el partido pasa a `jugado` y el sistema **recalcula solo**:
   - la tabla de posiciones de la zona,
   - el ranking de goleadores,
   - el conteo de tarjetas.
5. El administrador nunca edita la tabla de posiciones a mano — esa es la
   diferencia central frente a la referencia de mercado (Las Cañas la muestra ya
   armada; acá se genera).
