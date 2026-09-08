"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ReservaResponse } from "@/lib/api";

export default function CalendarioMaestroPage() {
  const { token } = useAuth();
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api.getReservas(token).then(setReservas).catch(() => setError("No se pudo conectar con la API."));
  }, [token]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Calendario maestro</h1>
      <p className="text-sm text-gray-500">
        Vista consolidada de todos los espacios por franja horaria. Los partidos de torneo también ocupan este
        mismo calendario que las reservas sueltas (ver docs/02-arquitectura-y-navegacion.md).
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Espacio</th>
              <th className="px-4 py-2">Horario</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 && (
              <tr><td className="px-4 py-3 text-gray-400" colSpan={4}>No hay turnos cargados todavía.</td></tr>
            )}
            {reservas.map((r) => (
              <tr key={r.reservaId} className="border-t border-gray-100">
                <td className="px-4 py-2">{r.fecha}</td>
                <td className="px-4 py-2">{r.espacioNombre}</td>
                <td className="px-4 py-2">{r.horaInicio}–{r.horaFin}</td>
                <td className="px-4 py-2">{r.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
