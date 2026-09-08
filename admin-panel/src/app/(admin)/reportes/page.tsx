"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, BalanceResponse, OcupacionEspacioResponse } from "@/lib/api";

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${
          tone === "positive" ? "text-green-700" : tone === "negative" ? "text-red-600" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function ReportesPage() {
  const { token } = useAuth();
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [ocupacion, setOcupacion] = useState<OcupacionEspacioResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cargar = () => {
    if (!token) return;
    Promise.all([api.getBalance(token, desde || undefined, hasta || undefined), api.getOcupacion(token, desde || undefined, hasta || undefined)])
      .then(([b, o]) => {
        setBalance(b);
        setOcupacion(o);
        setError(null);
      })
      .catch(() => setError("No se pudo conectar con la API."));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- se dispara manualmente al filtrar (onSubmit), no en cada tecleo de las fechas.
  useEffect(cargar, [token]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    cargar();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Reportes</h1>
      <p className="text-sm text-gray-500">
        Ocupación y facturación por espacio, y balance general — se calcula agregando Reserva + Pago + Gasto, sin
        entidades nuevas (ver docs/06-modelo-de-datos.md).
      </p>

      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500">Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
        </div>
        <button type="submit" className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700">
          Filtrar
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {balance && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label={`Ingresos (${balance.desde} a ${balance.hasta})`} value={`$${balance.ingresos.toFixed(2)}`} />
          <StatCard label="Gastos" value={`$${balance.gastos.toFixed(2)}`} />
          <StatCard label="Balance" value={`$${balance.balance.toFixed(2)}`} tone={balance.balance >= 0 ? "positive" : "negative"} />
          <StatCard label="Deuda pendiente total" value={`$${balance.deudaPendienteTotal.toFixed(2)}`} />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Espacio</th>
              <th className="px-4 py-2">Turnos confirmados</th>
              <th className="px-4 py-2">Facturación</th>
            </tr>
          </thead>
          <tbody>
            {ocupacion.length === 0 && (
              <tr><td className="px-4 py-3 text-gray-400" colSpan={3}>No hay turnos confirmados en el rango elegido.</td></tr>
            )}
            {ocupacion.map((o) => (
              <tr key={o.espacioId} className="border-t border-gray-100">
                <td className="px-4 py-2">{o.espacioNombre}</td>
                <td className="px-4 py-2">{o.turnosConfirmados}</td>
                <td className="px-4 py-2">${o.facturacion.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        El % de ocupación real requiere modelar los horarios de apertura del complejo (Configuración), que todavía
        no está en el modelo de datos.
      </p>
    </div>
  );
}
