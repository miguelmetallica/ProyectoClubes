# 06 · Modelo de datos

12 entidades en 3 grupos. Tipos sugeridos como guía para la primera migración —
ajustar al motor de base de datos elegido.

## Identidad y Reservas

### Cliente
| Campo | Tipo | Notas |
|---|---|---|
| cliente_id | uuid (PK) | |
| nombre | varchar | |
| email | varchar | único |
| telefono | varchar | |
| rol | enum(`cliente`,`capitan`,`admin`) | |
| fecha_alta | timestamp | |

### Espacio
| Campo | Tipo | Notas |
|---|---|---|
| espacio_id | uuid (PK) | |
| nombre | varchar | ej. "Cancha Fútbol 5 - A" |
| deporte | enum(`futbol`,`padel`,`natacion`,`otro`) | |
| modalidad | enum(`cancha_completa`,`pileta_completa`,`carril`) | |
| precio_base | decimal | |
| pct_sena | decimal(5,2) | configurable por espacio, ver reglas de negocio |
| ventana_cancelacion_horas | int | configurable por espacio |

### Reserva
| Campo | Tipo | Notas |
|---|---|---|
| reserva_id | uuid (PK) | |
| cliente_id | uuid (FK → Cliente) | |
| espacio_id | uuid (FK → Espacio) | |
| fecha | date | |
| hora_inicio | time | |
| hora_fin | time | |
| estado | enum(`pendiente_pago`,`pendiente_validacion`,`confirmada`,`cancelada`,`no_show`) | |
| precio_total | decimal | |
| cancelada_en | timestamp | nullable |
| motivo_cancelacion | text | nullable |
| monto_reintegrado | decimal | nullable |
| created_at / updated_at | timestamp | |

### Pago
| Campo | Tipo | Notas |
|---|---|---|
| pago_id | uuid (PK) | |
| reserva_id | uuid (FK → Reserva) | |
| metodo | enum(`mercado_pago`,`tarjeta`,`transferencia`,`efectivo`) | |
| monto | decimal | |
| estado | enum(`pendiente`,`validado`,`rechazado`) | |
| comprobante_url | varchar | nullable, solo transferencia |
| fecha_pago | timestamp | |
| validado_por | uuid (FK → Cliente, rol admin) | nullable |
| validado_en | timestamp | nullable |
| motivo_rechazo | text | nullable |

## Torneos

### Torneo
| Campo | Tipo | Notas |
|---|---|---|
| torneo_id | uuid (PK) | |
| nombre | varchar | |
| deporte | enum | mismo dominio que Espacio.deporte |
| categoria | varchar | |
| sistema_competencia | enum(`zonas_playoffs`,`liga`,`eliminacion_directa`) | configurable, ver reglas de negocio |
| puntos_victoria | int | default 3 |
| puntos_empate | int | default 1 |
| puntos_derrota | int | default 0 |
| fecha_inicio | date | |

### Zona
| Campo | Tipo | Notas |
|---|---|---|
| zona_id | uuid (PK) | |
| torneo_id | uuid (FK → Torneo) | |
| nombre | varchar | ej. "Zona A" |

### Equipo
| Campo | Tipo | Notas |
|---|---|---|
| equipo_id | uuid (PK) | |
| zona_id | uuid (FK → Zona) | |
| nombre | varchar | |
| capitan_id | uuid (FK → Cliente) | nullable |

### Jugador
| Campo | Tipo | Notas |
|---|---|---|
| jugador_id | uuid (PK) | |
| equipo_id | uuid (FK → Equipo) | |
| nombre | varchar | |
| numero | int | nullable |
| posicion | varchar | nullable |

### Partido
| Campo | Tipo | Notas |
|---|---|---|
| partido_id | uuid (PK) | |
| zona_id | uuid (FK → Zona) | |
| equipo_local_id | uuid (FK → Equipo) | |
| equipo_visitante_id | uuid (FK → Equipo) | |
| espacio_id | uuid (FK → Espacio) | el partido también ocupa el Calendario Maestro |
| fecha | date | |
| hora | time | |
| goles_local | int | nullable hasta jugarse |
| goles_visitante | int | nullable hasta jugarse |
| estado | enum(`programado`,`jugado`,`suspendido`) | |

### Evento_partido
| Campo | Tipo | Notas |
|---|---|---|
| evento_id | uuid (PK) | |
| partido_id | uuid (FK → Partido) | |
| jugador_id | uuid (FK → Jugador) | |
| tipo | enum(`gol`,`asistencia`,`amarilla`,`roja`) | |
| minuto | int | |

## Económico

### Deuda
| Campo | Tipo | Notas |
|---|---|---|
| deuda_id | uuid (PK) | |
| cliente_id | uuid (FK → Cliente) | |
| concepto | varchar | |
| monto | decimal | |
| vencimiento | date | |
| estado | enum(`pendiente`,`pagada`) | |

### Gasto
| Campo | Tipo | Notas |
|---|---|---|
| gasto_id | uuid (PK) | |
| concepto | varchar | |
| monto | decimal | |
| fecha | date | |

## Cómo se conectan

- Un **Cliente** hace muchas **Reservas**, puede ser capitán de un **Equipo**, y
  puede acumular **Deudas**.
- Una **Reserva** pertenece a un Cliente y a un **Espacio**, y tiene un **Pago**
  asociado.
- Un **Torneo** tiene **Zonas**; cada Zona agrupa **Equipos**; cada Equipo tiene
  **Jugadores**.
- Un **Partido** pertenece a una Zona, enfrenta a dos Equipos, ocupa un
  **Espacio** del mismo Calendario Maestro que usan las reservas sueltas, y
  registra **Eventos** (goles, tarjetas, asistencias) de sus Jugadores.
- **Gasto** es la única entidad sin relación directa: alimenta el balance
  general, no un cliente ni una reserva puntual.

## Notas para quien implemente

- `Reserva.estado` y `Pago.estado` son máquinas de estado independientes pero
  correlacionadas — no las colapsen en un solo campo; el flujo completo está en
  `03-flujos-clave.md`.
- La tabla de posiciones, goleadores y tarjetas **son vistas calculadas** sobre
  `Partido` + `Evento_partido`, no tablas propias a mantener a mano.
- Los reportes de ocupación/rentabilidad (`04-pantallas.md`) se calculan
  agregando `Reserva` + `Pago` por espacio y rango de fechas — no requieren
  entidades nuevas.
- Clases con instructor (fuera de v1): si se agrega después, probablemente sea
  una entidad `Clase` con `instructor_id → Cliente`, `espacio_id`, `cupo`, y una
  tabla puente `Clase_Inscripto`. No hace falta modelarla ahora, pero evitar
  nombres de campo que choquen con ese futuro (ej. no usar `tipo_turno` de forma
  ambigua en Reserva).
