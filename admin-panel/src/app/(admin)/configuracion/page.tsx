"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ConfiguracionRequest } from "@/lib/api";

export default function ConfiguracionPage() {
  const { token } = useAuth();
  const [form, setForm] = useState<ConfiguracionRequest | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api.getConfiguracion(token).then(setForm).catch(() => setError("No se pudo conectar con la API."));
  }, [token]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !form) return;
    setError(null);
    setGuardado(false);
    try {
      const actualizado = await api.actualizarConfiguracion(token, form);
      setForm(actualizado);
      setGuardado(true);
    } catch {
      setError("No se pudo guardar la configuración.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Configuración</h1>
      <p className="text-sm text-gray-500">
        Horarios de apertura del complejo, usados para calcular el % de ocupación real en Reportes. El % de seña,
        la ventana de cancelación y el vencimiento de validación se editan por espacio en la sección Espacios, ya
        que son configurables por tipo de espacio y no valores globales del sistema (ver docs/05-reglas-de-negocio.md).
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {form ? (
        <form onSubmit={onSubmit} className="max-w-sm space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <label className="block text-xs text-gray-500">Hora de apertura</label>
            <input
              type="time"
              required
              value={form.horaApertura}
              onChange={(e) => setForm({ ...form, horaApertura: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Hora de cierre</label>
            <input
              type="time"
              required
              value={form.horaCierre}
              onChange={(e) => setForm({ ...form, horaCierre: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <button type="submit" className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700">
            Guardar
          </button>
          {guardado && <p className="text-sm text-green-700">Guardado.</p>}
        </form>
      ) : (
        !error && <p className="text-sm text-gray-400">Cargando…</p>
      )}
    </div>
  );
}
