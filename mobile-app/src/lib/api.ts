import Constants from "expo-constants";

const API_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? "http://localhost:5237/api";

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

export type ReservaRequest = {
  espacioId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
};

export type PagoResponse = {
  pagoId: string;
  reservaId: string;
  metodo: string;
  monto: number;
  estado: string;
  comprobanteUrl?: string | null;
  fechaPago: string;
};

export const api = {
  register: (nombre: string, email: string, password: string, telefono?: string) =>
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ nombre, email, password, telefono }),
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  getEspacios: (token: string) => apiFetch<EspacioResponse[]>("/espacios", {}, token),

  getMisReservas: (token: string) => apiFetch<ReservaResponse[]>("/reservas", {}, token),

  crearReserva: (token: string, body: ReservaRequest) =>
    apiFetch<ReservaResponse>("/reservas", { method: "POST", body: JSON.stringify(body) }, token),

  cancelarReserva: (token: string, id: string, motivo?: string) =>
    apiFetch<ReservaResponse>(`/reservas/${id}/cancelar`, { method: "POST", body: JSON.stringify({ motivo }) }, token),

  crearPago: (token: string, body: { reservaId: string; metodo: string; monto: number; comprobanteUrl?: string }) =>
    apiFetch<PagoResponse>("/pagos", { method: "POST", body: JSON.stringify(body) }, token),
};
