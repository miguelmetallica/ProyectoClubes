"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, EspacioRequest, EspacioResponse } from "@/lib/api";

const DEPORTES = ["Futbol", "Padel", "Natacion", "Otro"];
const MODALIDADES = ["CanchaCompleta", "PiletaCompleta", "Carril"];

const initialForm: EspacioRequest = {
  nombre: "",
  deporte: "Futbol",
  modalidad: "CanchaCompleta",
  precioBase: 0,
  pctSena: 50,
  ventanaCancelacionHoras: 24,
};

export default function EspaciosPage() {
  const { token } = useAuth();
  const [espacios, setEspacios] = useState<EspacioResponse[]>([]);
  const [form, setForm] = useState<EspacioRequest>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = () => {
    if (!token) return;
    api
      .getEspacios(token)
      .then(setEspacios)
      .catch(() => setError("No se pudo conectar con la API."))
      .finally(() => setLoading(false));
  };

  useEffect(cargar, [token]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    try {
      await api.createEspacio(token, form);
      setForm(initialForm);
      cargar();
    } catch {
      setError("No se pudo crear el espacio.");
    }
  };

  const onDelete = async (id: string) => {
    if (!token) return;
    await api.deleteEspacio(token, id);
    cargar();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Gestión de espacios</h1>
      <p className="text-sm text-gray-500">
        Alta/baja de canchas y piletas. % de seña y ventana de cancelación son configurables por espacio, no
        globales (ver docs/05-reglas-de-negocio.md).
      </p>

      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-6">
        <input
          placeholder="Nombre"
          required
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="col-span-2 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <select
          value={form.deporte}
          onChange={(e) => setForm({ ...form, deporte: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        >
          {DEPORTES.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={form.modalidad}
          onChange={(e) => setForm({ ...form, modalidad: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        >
          {MODALIDADES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Precio base"
          required
          value={form.precioBase}
          onChange={(e) => setForm({ ...form, precioBase: Number(e.target.value) })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          placeholder="% seña"
          required
          value={form.pctSena}
          onChange={(e) => setForm({ ...form, pctSena: Number(e.target.value) })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          placeholder="Ventana cancelación (hs)"
          required
          value={form.ventanaCancelacionHoras}
          onChange={(e) => setForm({ ...form, ventanaCancelacionHoras: Number(e.target.value) })}
          className="col-span-2 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <button type="submit" className="col-span-2 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700">
          Agregar espacio
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Deporte</th>
              <th className="px-4 py-2">Modalidad</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">% Seña</th>
              <th className="px-4 py-2">Ventana (hs)</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="px-4 py-3 text-gray-400" colSpan={7}>Cargando…</td></tr>
            )}
            {!loading && espacios.length === 0 && (
              <tr><td className="px-4 py-3 text-gray-400" colSpan={7}>Todavía no hay espacios cargados.</td></tr>
            )}
            {espacios.map((esp) => (
              <tr key={esp.espacioId} className="border-t border-gray-100">
                <td className="px-4 py-2">{esp.nombre}</td>
                <td className="px-4 py-2">{esp.deporte}</td>
                <td className="px-4 py-2">{esp.modalidad}</td>
                <td className="px-4 py-2">${esp.precioBase}</td>
                <td className="px-4 py-2">{esp.pctSena}%</td>
                <td className="px-4 py-2">{esp.ventanaCancelacionHoras}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => onDelete(esp.espacioId)} className="text-xs text-red-600 hover:underline">
                    Eliminar
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
