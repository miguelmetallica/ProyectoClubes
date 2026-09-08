"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, PartidoResponse, ReservaResponse } from "@/lib/api";

type Fila = {
  key: string;
  fecha: string;
  espacio: string;
  horario: string;
  tipo: "Reserva" | "Partido";
  detalle: string;
};

export default function CalendarioMaestroPage() {
  const { token } = useAuth();
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [partidos, setPartidos] = useState<PartidoResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([api.getReservas(token), api.getPartidosProgramados(token)])
      .then(([r, p]) => {
        setReservas(r);
        setPartidos(p);
      })
      .catch(() => setError("No se pudo conectar con la API."));
  }, [token]);

  const filas: Fila[] = [
    ...reservas.map((r) => ({
      key: `reserva-${r.reservaId}`,
      fecha: r.fecha,
      espacio: r.espacioNombre,
      horario: `${r.horaInicio}–${r.horaFin}`,
      tipo: "Reserva" as const,
      detalle: r.estado,
    })),
    ...partidos.map((p) => ({
      key: `partido-${p.partidoId}`,
      fecha: p.fecha ?? "",
      espacio: p.espacioNombre ?? "",
      horario: p.hora ?? "",
      tipo: "Partido" as const,
      detalle: `${p.equipoLocalNombre} vs ${p.equipoVisitanteNombre}`,
    })),
  ].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.horario.localeCompare(b.horario));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Calendario maestro</h1>
      <p className="text-sm text-gray-500">
        Vista consolidada de todos los espacios por franja horaria. Los partidos de torneo ya programados ocupan
        este mismo calendario que las reservas sueltas (ver docs/02-arquitectura-y-navegacion.md).
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Espacio</th>
              <th className="px-4 py-2">Horario</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 && (
              <tr><td className="px-4 py-3 text-gray-400" colSpan={5}>No hay turnos ni partidos cargados todavía.</td></tr>
            )}
            {filas.map((f) => (
              <tr key={f.key} className="border-t border-gray-100">
                <td className="px-4 py-2">{f.fecha}</td>
                <td className="px-4 py-2">{f.espacio}</td>
                <td className="px-4 py-2">{f.horario}</td>
                <td className="px-4 py-2">
                  <span className={f.tipo === "Partido" ? "text-purple-700" : "text-gray-600"}>{f.tipo}</span>
                </td>
                <td className="px-4 py-2">{f.detalle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
