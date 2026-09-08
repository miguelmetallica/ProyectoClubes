"use client";

import { Fragment, FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ClienteResponse, DeudaResponse } from "@/lib/api";

const initialForm = { concepto: "", monto: 0, vencimiento: "" };

function DeudasCliente({ clienteId }: { clienteId: string }) {
  const { token } = useAuth();
  const [deudas, setDeudas] = useState<DeudaResponse[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);

  const cargar = () => {
    if (!token) return;
    api.getDeudas(token, clienteId).then(setDeudas).catch(() => setError("No se pudieron cargar las deudas."));
  };

  useEffect(cargar, [token, clienteId]);

  const agregar = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await api.crearDeuda(token, { clienteId, ...form });
      setForm(initialForm);
      cargar();
    } catch {
      setError("No se pudo crear la deuda.");
    }
  };

  const marcarPagada = async (id: string) => {
    if (!token) return;
    await api.marcarDeudaPagada(token, id);
    cargar();
  };

  const eliminar = async (id: string) => {
    if (!token) return;
    await api.eliminarDeuda(token, id);
    cargar();
  };

  return (
    <div className="space-y-3 border-t border-gray-100 bg-gray-50 p-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {deudas.length === 0 ? (
        <p className="text-sm text-gray-400">Este cliente no tiene deudas registradas.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {deudas.map((d) => (
            <li key={d.deudaId} className="flex items-center justify-between gap-2">
              <span>
                {d.concepto} · ${d.monto} · vence {d.vencimiento} ·{" "}
                <span className={d.estado === "Pagada" ? "text-green-700" : "text-amber-700"}>{d.estado}</span>
              </span>
              <span className="space-x-2 whitespace-nowrap">
                {d.estado !== "Pagada" && (
                  <button onClick={() => marcarPagada(d.deudaId)} className="text-xs text-green-700 hover:underline">
                    Marcar pagada
                  </button>
                )}
                <button onClick={() => eliminar(d.deudaId)} className="text-xs text-red-600 hover:underline">
                  Eliminar
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={agregar} className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Concepto"
          required
          value={form.concepto}
          onChange={(e) => setForm({ ...form, concepto: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs"
        />
        <input
          type="number"
          placeholder="Monto"
          required
          value={form.monto}
          onChange={(e) => setForm({ ...form, monto: Number(e.target.value) })}
          className="w-24 rounded-md border border-gray-300 px-2 py-1 text-xs"
        />
        <input
          type="date"
          required
          value={form.vencimiento}
          onChange={(e) => setForm({ ...form, vencimiento: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs"
        />
        <button type="submit" className="rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-700">
          Agregar deuda
        </button>
      </form>
    </div>
  );
}

export default function ClientesPage() {
  const { token } = useAuth();
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api.getClientes(token).then(setClientes).catch(() => setError("No se pudo conectar con la API."));
  }, [token]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Clientes</h1>
      <p className="text-sm text-gray-500">
        Fichas de contacto, historial de reservas y deudas. Tocá un cliente para ver y gestionar sus deudas.
      </p>

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
              <Fragment key={c.clienteId}>
                <tr
                  onClick={() => setExpandido(expandido === c.clienteId ? null : c.clienteId)}
                  className="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{c.nombre}</td>
                  <td className="px-4 py-2">{c.email}</td>
                  <td className="px-4 py-2">{c.telefono ?? "—"}</td>
                  <td className="px-4 py-2">{c.rol}</td>
                  <td className="px-4 py-2">{new Date(c.fechaAlta).toLocaleDateString()}</td>
                </tr>
                {expandido === c.clienteId && (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <DeudasCliente clienteId={c.clienteId} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
