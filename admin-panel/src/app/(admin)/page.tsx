"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, PagoResponse, ReservaResponse } from "@/lib/api";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [reservas, setReservas] = useState<ReservaResponse[] | null>(null);
  const [pagosPendientes, setPagosPendientes] = useState<PagoResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([api.getReservas(token), api.getPagosPendientes(token)])
      .then(([r, p]) => {
        setReservas(r);
        setPagosPendientes(p);
      })
      .catch(() => setError("No se pudo conectar con la API. Verificá que el backend esté corriendo."));
  }, [token]);

  const hoy = new Date().toISOString().slice(0, 10);
  const turnosHoy = reservas?.filter((r) => r.fecha === hoy && r.estado !== "Cancelada") ?? [];
  const ingresosHoy = turnosHoy.reduce((acc, r) => acc + r.precioTotal, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Turnos de hoy" value={reservas ? String(turnosHoy.length) : "…"} />
        <StatCard label="Ingresos de hoy" value={reservas ? `$${ingresosHoy.toFixed(2)}` : "…"} />
        <StatCard label="Pagos por validar" value={pagosPendientes ? String(pagosPendientes.length) : "…"} />
        <StatCard label="Total reservas" value={reservas ? String(reservas.length) : "…"} />
      </div>

      <p className="text-xs text-gray-400">
        KPIs calculados en base a Reserva + Pago, según docs/04-pantallas.md. La ocupación % por espacio y los
        reportes de rentabilidad se implementan en Fase 4 del roadmap.
      </p>
    </div>
  );
}
