"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, PagoResponse } from "@/lib/api";

export default function ValidarPagosPage() {
  const { token } = useAuth();
  const [pagos, setPagos] = useState<PagoResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cargar = () => {
    if (!token) return;
    api.getPagosPendientes(token).then(setPagos).catch(() => setError("No se pudo conectar con la API."));
  };

  useEffect(cargar, [token]);

  const aprobar = async (id: string) => {
    if (!token) return;
    await api.aprobarPago(token, id);
    cargar();
  };

  const rechazar = async (id: string) => {
    if (!token) return;
    const motivo = window.prompt("Motivo del rechazo:");
    if (!motivo) return;
    await api.rechazarPago(token, id, motivo);
    cargar();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Validar pagos</h1>
      <p className="text-sm text-gray-500">
        Cola de comprobantes de transferencia pendientes de aprobar o rechazar (ver docs/03-flujos-clave.md).
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Monto</th>
              <th className="px-4 py-2">Comprobante</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 && (
              <tr><td className="px-4 py-3 text-gray-400" colSpan={4}>No hay transferencias pendientes de validar.</td></tr>
            )}
            {pagos.map((p) => (
              <tr key={p.pagoId} className="border-t border-gray-100">
                <td className="px-4 py-2">{new Date(p.fechaPago).toLocaleString()}</td>
                <td className="px-4 py-2">${p.monto}</td>
                <td className="px-4 py-2">
                  {p.comprobanteUrl ? (
                    <a href={p.comprobanteUrl} target="_blank" className="text-blue-600 hover:underline">Ver</a>
                  ) : "—"}
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button onClick={() => aprobar(p.pagoId)} className="text-xs font-medium text-green-700 hover:underline">
                    Aprobar
                  </button>
                  <button onClick={() => rechazar(p.pagoId)} className="text-xs font-medium text-red-600 hover:underline">
                    Rechazar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
