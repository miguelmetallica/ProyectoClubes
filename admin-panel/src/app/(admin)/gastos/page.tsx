"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, GastoRequest, GastoResponse } from "@/lib/api";

const initialForm: GastoRequest = { concepto: "", monto: 0, fecha: new Date().toISOString().slice(0, 10) };

export default function GastosPage() {
  const { token } = useAuth();
  const [gastos, setGastos] = useState<GastoResponse[]>([]);
  const [form, setForm] = useState<GastoRequest>(initialForm);
  const [error, setError] = useState<string | null>(null);

  const cargar = () => {
    if (!token) return;
    api.getGastos(token).then(setGastos).catch(() => setError("No se pudo conectar con la API."));
  };

  useEffect(cargar, [token]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    try {
      await api.crearGasto(token, form);
      setForm({ ...initialForm, fecha: form.fecha });
      cargar();
    } catch {
      setError("No se pudo crear el gasto.");
    }
  };

  const onDelete = async (id: string) => {
    if (!token) return;
    await api.eliminarGasto(token, id);
    cargar();
  };

  const total = gastos.reduce((acc, g) => acc + g.monto, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Gastos</h1>
      <p className="text-sm text-gray-500">
        Alimenta el balance general junto con los pagos validados (ver Reportes). No tiene relación con un cliente
        ni una reserva puntual.
      </p>

      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-4">
        <input
          placeholder="Concepto"
          required
          value={form.concepto}
          onChange={(e) => setForm({ ...form, concepto: e.target.value })}
          className="col-span-2 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          placeholder="Monto"
          required
          value={form.monto}
          onChange={(e) => setForm({ ...form, monto: Number(e.target.value) })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <input
          type="date"
          required
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <button type="submit" className="col-span-2 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 md:col-span-4">
          Agregar gasto
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Concepto</th>
              <th className="px-4 py-2">Monto</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {gastos.length === 0 && (
              <tr><td className="px-4 py-3 text-gray-400" colSpan={4}>Todavía no hay gastos cargados.</td></tr>
            )}
            {gastos.map((g) => (
              <tr key={g.gastoId} className="border-t border-gray-100">
                <td className="px-4 py-2">{g.fecha}</td>
                <td className="px-4 py-2">{g.concepto}</td>
                <td className="px-4 py-2">${g.monto}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => onDelete(g.gastoId)} className="text-xs text-red-600 hover:underline">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {gastos.length > 0 && (
            <tfoot>
              <tr className="border-t border-gray-200 font-medium">
                <td className="px-4 py-2" colSpan={2}>Total</td>
                <td className="px-4 py-2">${total.toFixed(2)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
