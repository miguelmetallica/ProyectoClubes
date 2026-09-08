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
};
