const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5237/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export type ClienteResponse = {
  clienteId: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  rol: string;
  fechaAlta: string;
};

export type AuthResponse = {
  token: string;
  clienteId: string;
  nombre: string;
  email: string;
  rol: string;
};

export type EspacioResponse = {
  espacioId: string;
  nombre: string;
  deporte: string;
  modalidad: string;
  precioBase: number;
  pctSena: number;
  ventanaCancelacionHoras: number;
  vencimientoValidacionHoras: number;
};

export type EspacioRequest = Omit<EspacioResponse, "espacioId">;

export type ReservaResponse = {
  reservaId: string;
  clienteId: string;
  espacioId: string;
  espacioNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  precioTotal: number;
  canceladaEn?: string | null;
  motivoCancelacion?: string | null;
  montoReintegrado?: number | null;
};

export type PagoResponse = {
  pagoId: string;
  reservaId: string;
  metodo: string;
  monto: number;
  estado: string;
  comprobanteUrl?: string | null;
  fechaPago: string;
  validadoPor?: string | null;
  validadoEn?: string | null;
  motivoRechazo?: string | null;
};

export type DeudaResponse = {
  deudaId: string;
  clienteId: string;
  concepto: string;
  monto: number;
  vencimiento: string;
  estado: string;
};

export type DeudaRequest = {
  clienteId: string;
  concepto: string;
  monto: number;
  vencimiento: string;
};

export type GastoResponse = {
  gastoId: string;
  concepto: string;
  monto: number;
  fecha: string;
};

export type GastoRequest = Omit<GastoResponse, "gastoId">;

export type BalanceResponse = {
  desde: string;
  hasta: string;
  ingresos: number;
  gastos: number;
  balance: number;
  deudaPendienteTotal: number;
};

export type OcupacionEspacioResponse = {
  espacioId: string;
  espacioNombre: string;
  turnosConfirmados: number;
  facturacion: number;
  horasOcupadas: number;
  ocupacionPct: number;
};

export type HorarioPicoRow = { hora: string; cantidadTurnos: number };

export type ConfiguracionResponse = { horaApertura: string; horaCierre: string };
export type ConfiguracionRequest = ConfiguracionResponse;

export type TorneoResponse = {
  torneoId: string;
  nombre: string;
  deporte: string;
  categoria: string;
  sistemaCompetencia: string;
  puntosVictoria: number;
  puntosEmpate: number;
  puntosDerrota: number;
  fechaInicio: string;
  zonaId: string;
};

export type TorneoRequest = Omit<TorneoResponse, "torneoId" | "zonaId">;

export type EquipoResponse = {
  equipoId: string;
  zonaId: string;
  nombre: string;
  capitanId?: string | null;
  capitanNombre?: string | null;
  cantidadJugadores: number;
};

export type EquipoRequest = { nombre: string; capitanId?: string | null };

export type JugadorResponse = {
  jugadorId: string;
  equipoId: string;
  nombre: string;
  numero?: number | null;
  posicion?: string | null;
};

export type JugadorRequest = { nombre: string; numero?: number | null; posicion?: string | null };

export type PartidoResponse = {
  partidoId: string;
  zonaId: string;
  equipoLocalId: string;
  equipoLocalNombre: string;
  equipoVisitanteId: string;
  equipoVisitanteNombre: string;
  espacioId?: string | null;
  espacioNombre?: string | null;
  fecha?: string | null;
  hora?: string | null;
  golesLocal?: number | null;
  golesVisitante?: number | null;
  estado: string;
};

export type ProgramarPartidoRequest = { espacioId: string; fecha: string; hora: string };

export type EventoRequest = { jugadorId: string; tipo: string; minuto: number };

export type ResultadoPartidoRequest = { golesLocal: number; golesVisitante: number; eventos: EventoRequest[] };

export type TablaPosicionesRow = {
  equipoId: string;
  equipoNombre: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
};

export type GoleadorRow = { jugadorId: string; jugadorNombre: string; equipoNombre: string; goles: number };

export type TarjetasRow = { jugadorId: string; jugadorNombre: string; equipoNombre: string; amarillas: number; rojas: number };

export const api = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  getClientes: (token: string) => apiFetch<ClienteResponse[]>("/clientes", {}, token),

  getEspacios: (token: string) => apiFetch<EspacioResponse[]>("/espacios", {}, token),
  createEspacio: (token: string, body: EspacioRequest) =>
    apiFetch<EspacioResponse>("/espacios", { method: "POST", body: JSON.stringify(body) }, token),
  updateEspacio: (token: string, id: string, body: EspacioRequest) =>
    apiFetch<void>(`/espacios/${id}`, { method: "PUT", body: JSON.stringify(body) }, token),
  deleteEspacio: (token: string, id: string) =>
    apiFetch<void>(`/espacios/${id}`, { method: "DELETE" }, token),

  getReservas: (token: string) => apiFetch<ReservaResponse[]>("/reservas", {}, token),

  getPagosPendientes: (token: string) => apiFetch<PagoResponse[]>("/pagos/pendientes-validacion", {}, token),
  aprobarPago: (token: string, id: string) =>
    apiFetch<PagoResponse>(`/pagos/${id}/aprobar`, { method: "POST" }, token),
  rechazarPago: (token: string, id: string, motivo: string) =>
    apiFetch<PagoResponse>(`/pagos/${id}/rechazar`, { method: "POST", body: JSON.stringify({ motivo }) }, token),

  getDeudas: (token: string, clienteId?: string) =>
    apiFetch<DeudaResponse[]>(`/deudas${clienteId ? `?clienteId=${clienteId}` : ""}`, {}, token),
  crearDeuda: (token: string, body: DeudaRequest) =>
    apiFetch<DeudaResponse>("/deudas", { method: "POST", body: JSON.stringify(body) }, token),
  marcarDeudaPagada: (token: string, id: string) =>
    apiFetch<DeudaResponse>(`/deudas/${id}/marcar-pagada`, { method: "POST" }, token),
  eliminarDeuda: (token: string, id: string) => apiFetch<void>(`/deudas/${id}`, { method: "DELETE" }, token),

  getGastos: (token: string) => apiFetch<GastoResponse[]>("/gastos", {}, token),
  crearGasto: (token: string, body: GastoRequest) =>
    apiFetch<GastoResponse>("/gastos", { method: "POST", body: JSON.stringify(body) }, token),
  eliminarGasto: (token: string, id: string) => apiFetch<void>(`/gastos/${id}`, { method: "DELETE" }, token),

  getBalance: (token: string, desde?: string, hasta?: string) => {
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    const qs = params.toString();
    return apiFetch<BalanceResponse>(`/reportes/balance${qs ? `?${qs}` : ""}`, {}, token);
  },
  getOcupacion: (token: string, desde?: string, hasta?: string) => {
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    const qs = params.toString();
    return apiFetch<OcupacionEspacioResponse[]>(`/reportes/ocupacion${qs ? `?${qs}` : ""}`, {}, token);
  },
  getHorariosPico: (token: string, desde?: string, hasta?: string) => {
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    const qs = params.toString();
    return apiFetch<HorarioPicoRow[]>(`/reportes/horarios-pico${qs ? `?${qs}` : ""}`, {}, token);
  },

  getConfiguracion: (token: string) => apiFetch<ConfiguracionResponse>("/configuracion", {}, token),
  actualizarConfiguracion: (token: string, body: ConfiguracionRequest) =>
    apiFetch<ConfiguracionResponse>("/configuracion", { method: "PUT", body: JSON.stringify(body) }, token),

  getTorneos: (token: string) => apiFetch<TorneoResponse[]>("/torneos", {}, token),
  crearTorneo: (token: string, body: TorneoRequest) =>
    apiFetch<TorneoResponse>("/torneos", { method: "POST", body: JSON.stringify(body) }, token),

  getEquipos: (token: string, torneoId: string) => apiFetch<EquipoResponse[]>(`/torneos/${torneoId}/equipos`, {}, token),
  crearEquipo: (token: string, torneoId: string, body: EquipoRequest) =>
    apiFetch<EquipoResponse>(`/torneos/${torneoId}/equipos`, { method: "POST", body: JSON.stringify(body) }, token),

  getJugadores: (token: string, equipoId: string) => apiFetch<JugadorResponse[]>(`/equipos/${equipoId}/jugadores`, {}, token),
  crearJugador: (token: string, equipoId: string, body: JugadorRequest) =>
    apiFetch<JugadorResponse>(`/equipos/${equipoId}/jugadores`, { method: "POST", body: JSON.stringify(body) }, token),
  eliminarJugador: (token: string, id: string) => apiFetch<void>(`/jugadores/${id}`, { method: "DELETE" }, token),

  generarFixture: (token: string, torneoId: string) =>
    apiFetch<PartidoResponse[]>(`/torneos/${torneoId}/generar-fixture`, { method: "POST" }, token),
  getFixture: (token: string, torneoId: string) => apiFetch<PartidoResponse[]>(`/torneos/${torneoId}/fixture`, {}, token),
  programarPartido: (token: string, id: string, body: ProgramarPartidoRequest) =>
    apiFetch<PartidoResponse>(`/partidos/${id}/programar`, { method: "PUT", body: JSON.stringify(body) }, token),
  cargarResultado: (token: string, id: string, body: ResultadoPartidoRequest) =>
    apiFetch<PartidoResponse>(`/partidos/${id}/resultado`, { method: "POST", body: JSON.stringify(body) }, token),
  getPartidosProgramados: (token: string, desde?: string, hasta?: string) => {
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    const qs = params.toString();
    return apiFetch<PartidoResponse[]>(`/partidos${qs ? `?${qs}` : ""}`, {}, token);
  },

  getTabla: (token: string, torneoId: string) => apiFetch<TablaPosicionesRow[]>(`/torneos/${torneoId}/tabla`, {}, token),
  getGoleadores: (token: string, torneoId: string) => apiFetch<GoleadorRow[]>(`/torneos/${torneoId}/goleadores`, {}, token),
  getTarjetas: (token: string, torneoId: string) => apiFetch<TarjetasRow[]>(`/torneos/${torneoId}/tarjetas`, {}, token),
};
