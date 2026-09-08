"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ClienteResponse } from "@/lib/api";

export default function ClientesPage() {
  const { token } = useAuth();
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api.getClientes(token).then(setClientes).catch(() => setError("No se pudo conectar con la API."));
  }, [token]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Clientes</h1>
      <p className="text-sm text-gray-500">Fichas de contacto e historial. Deudas se suman en Fase 2 del roadmap.</p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Teléfono</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Alta</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 && (
              <tr><td className="px-4 py-3 text-gray-400" colSpan={5}>No hay clientes registrados todavía.</td></tr>
            )}
            {clientes.map((c) => (
              <tr key={c.clienteId} className="border-t border-gray-100">
                <td className="px-4 py-2">{c.nombre}</td>
                <td className="px-4 py-2">{c.email}</td>
                <td className="px-4 py-2">{c.telefono ?? "—"}</td>
                <td className="px-4 py-2">{c.rol}</td>
                <td className="px-4 py-2">{new Date(c.fechaAlta).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
