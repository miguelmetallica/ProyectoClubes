# 02 · Arquitectura y navegación

## Dos frentes, un mismo motor

| | Panel de Administración | App del Cliente |
|---|---|---|
| Plataforma | Web / tablet | Celular |
| Usuario | Administrador | Cliente / capitán |
| Rol | Gestiona absolutamente todo | Consulta, reserva y paga |

El "Motor de Torneos" de la referencia original se generaliza a un **Motor de
Reservas**, no limitado a un deporte: Fútbol, Pádel, Pileta de natación y otros
deportes futuros conviven bajo la misma lógica de espacio + turno + pago.

## Navegación — App Cliente

| Sección | Función |
|---|---|
| Inicio | Próximo turno propio y accesos rápidos |
| Reservar | Elegir deporte/pileta, calendario y horarios libres |
| Mis reservas | Próximas, historial, cancelaciones |
| Torneos | Fixture, tabla de posiciones, estadísticas |
| Pagos | Comprobantes, saldo, medios de pago |
| Club | Dirección, horarios, contacto, reglamento |

## Navegación — Panel Administrador

| Sección | Función |
|---|---|
| Dashboard | Ocupación del día, ingresos, próximos turnos, pendientes |
| Espacios | Alta/baja de canchas y piletas, precio y reglas por tipo de espacio |
| Calendario maestro | Turnos de todos los espacios en una sola vista |
| Clientes | Fichas, historial de reservas, deudas |
| Pagos | Cobros, señas, validación de transferencias, balance |
| Torneos | Crear torneo, equipos, jugadores, carga de resultados |
| Reportes | Ocupación y rentabilidad por espacio y horario |
| Configuración | Horarios de apertura; % de seña y ventana de cancelación por espacio |

## Flujo de reserva (resumen)

```
ESPACIO → DISPONIBILIDAD → RESERVA → SEÑA/PAGO → CONFIRMACIÓN → TURNO
```

El sistema resuelve esta cadena automáticamente; el administrador no arma turnos
a mano. El detalle completo de cada paso está en `03-flujos-clave.md`.

## Flujo de torneo (resumen)

```
EQUIPOS → FIXTURE → RESULTADOS → TABLA → CLASIFICACIÓN → PLAYOFFS
```

Igual criterio: la tabla de posiciones **se recalcula sola** cada vez que se
carga un resultado. El administrador nunca la edita directamente.
