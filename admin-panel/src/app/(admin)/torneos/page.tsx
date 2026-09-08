"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  api,
  ClienteResponse,
  EquipoResponse,
  GoleadorRow,
  JugadorResponse,
  PartidoResponse,
  TablaPosicionesRow,
  TarjetasRow,
  TorneoRequest,
  TorneoResponse,
} from "@/lib/api";

const DEPORTES = ["Futbol", "Padel", "Natacion", "Otro"];
const SISTEMAS = ["Liga", "ZonasPlayoffs", "EliminacionDirecta"];
const TIPOS_EVENTO = ["Gol", "Asistencia", "Amarilla", "Roja"];

const initialTorneoForm: TorneoRequest = {
  nombre: "",
  deporte: "Futbol",
  categoria: "",
  sistemaCompetencia: "Liga",
  puntosVictoria: 3,
  puntosEmpate: 1,
  puntosDerrota: 0,
  fechaInicio: new Date().toISOString().slice(0, 10),
};

function EquiposYJugadores({ torneoId, clientes }: { torneoId: string; clientes: ClienteResponse[] }) {
  const { token } = useAuth();
  const [equipos, setEquipos] = useState<EquipoResponse[]>([]);
  const [nombre, setNombre] = useState("");
  const [capitanId, setCapitanId] = useState("");
  const [equipoExpandido, setEquipoExpandido] = useState<string | null>(null);
  const [jugadores, setJugadores] = useState<JugadorResponse[]>([]);
  const [jugadorForm, setJugadorForm] = useState({ nombre: "", numero: "", posicion: "" });
  const [error, setError] = useState<string | null>(null);

  const cargarEquipos = () => {
    if (!token) return;
    api.getEquipos(token, torneoId).then(setEquipos).catch(() => setError("No se pudieron cargar los equipos."));
  };

  useEffect(cargarEquipos, [token, torneoId]);

  useEffect(() => {
    if (!token || !equipoExpandido) return;
    api.getJugadores(token, equipoExpandido).then(setJugadores).catch(() => setJugadores([]));
  }, [token, equipoExpandido]);

  const agregarEquipo = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await api.crearEquipo(token, torneoId, { nombre, capitanId: capitanId || null });
      setNombre("");
      setCapitanId("");
      cargarEquipos();
    } catch {
      setError("No se pudo crear el equipo.");
    }
  };

  const agregarJugador = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !equipoExpandido) return;
    await api.crearJugador(token, equipoExpandido, {
      nombre: jugadorForm.nombre,
      numero: jugadorForm.numero ? Number(jugadorForm.numero) : null,
      posicion: jugadorForm.posicion || null,
    });
    setJugadorForm({ nombre: "", numero: "", posicion: "" });
    api.getJugadores(token, equipoExpandido).then(setJugadores);
    cargarEquipos();
  };

  const eliminarJugador = async (id: string) => {
    if (!token || !equipoExpandido) return;
    await api.eliminarJugador(token, id);
    api.getJugadores(token, equipoExpandido).then(setJugadores);
    cargarEquipos();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Equipos</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form onSubmit={agregarEquipo} className="flex flex-wrap gap-2">
        <input
          placeholder="Nombre del equipo"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <select value={capitanId} onChange={(e) => setCapitanId(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm">
          <option value="">Sin capitán</option>
          {clientes.map((c) => (
            <option key={c.clienteId} value={c.clienteId}>{c.nombre}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700">
          Agregar equipo
        </button>
      </form>

      <ul className="space-y-2">
        {equipos.length === 0 && <p className="text-sm text-gray-400">Todavía no hay equipos cargados.</p>}
        {equipos.map((eq) => (
          <li key={eq.equipoId} className="rounded-lg border border-gray-200 bg-white p-3">
            <button
              onClick={() => setEquipoExpandido(equipoExpandido === eq.equipoId ? null : eq.equipoId)}
              className="flex w-full items-center justify-between text-left text-sm"
            >
              <span>
                <strong>{eq.nombre}</strong> {eq.capitanNombre && <>· capitán: {eq.capitanNombre}</>} · {eq.cantidadJugadores} jugador(es)
              </span>
              <span className="text-xs text-gray-400">{equipoExpandido === eq.equipoId ? "ocultar" : "ver plantel"}</span>
            </button>

            {equipoExpandido === eq.equipoId && (
              <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                <ul className="space-y-1 text-sm">
                  {jugadores.length === 0 && <p className="text-gray-400">Sin jugadores cargados.</p>}
                  {jugadores.map((j) => (
                    <li key={j.jugadorId} className="flex items-center justify-between">
                      <span>{j.nombre} {j.numero && <>· #{j.numero}</>} {j.posicion && <>· {j.posicion}</>}</span>
                      <button onClick={() => eliminarJugador(j.jugadorId)} className="text-xs text-red-600 hover:underline">
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={agregarJugador} className="flex flex-wrap gap-2">
                  <input
                    placeholder="Nombre"
                    required
                    value={jugadorForm.nombre}
                    onChange={(e) => setJugadorForm({ ...jugadorForm, nombre: e.target.value })}
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                  />
                  <input
                    placeholder="Número"
                    type="number"
                    value={jugadorForm.numero}
                    onChange={(e) => setJugadorForm({ ...jugadorForm, numero: e.target.value })}
                    className="w-20 rounded-md border border-gray-300 px-2 py-1 text-xs"
                  />
                  <input
                    placeholder="Posición"
                    value={jugadorForm.posicion}
                    onChange={(e) => setJugadorForm({ ...jugadorForm, posicion: e.target.value })}
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                  />
                  <button type="submit" className="rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-700">
                    Agregar jugador
                  </button>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CargarResultadoForm({
  partido,
  onGuardado,
}: {
  partido: PartidoResponse;
  onGuardado: () => void;
}) {
  const { token } = useAuth();
  const [golesLocal, setGolesLocal] = useState(0);
  const [golesVisitante, setGolesVisitante] = useState(0);
  const [jugadores, setJugadores] = useState<JugadorResponse[]>([]);
  const [eventos, setEventos] = useState<{ jugadorId: string; tipo: string; minuto: string }[]>([]);

  useEffect(() => {
    if (!token) return;
    Promise.all([api.getJugadores(token, partido.equipoLocalId), api.getJugadores(token, partido.equipoVisitanteId)]).then(
      ([local, visitante]) => setJugadores([...local, ...visitante])
    );
  }, [token, partido.equipoLocalId, partido.equipoVisitanteId]);

  const agregarEvento = () => setEventos([...eventos, { jugadorId: jugadores[0]?.jugadorId ?? "", tipo: "Gol", minuto: "1" }]);
  const quitarEvento = (i: number) => setEventos(eventos.filter((_, idx) => idx !== i));

  const guardar = async () => {
    if (!token) return;
    await api.cargarResultado(token, partido.partidoId, {
      golesLocal,
      golesVisitante,
      eventos: eventos.filter((e) => e.jugadorId).map((e) => ({ jugadorId: e.jugadorId, tipo: e.tipo, minuto: Number(e.minuto) })),
    });
    onGuardado();
  };

  return (
    <div className="mt-2 space-y-2 rounded-md bg-gray-50 p-3">
      <div className="flex items-center gap-2 text-sm">
        <span>{partido.equipoLocalNombre}</span>
        <input type="number" value={golesLocal} onChange={(e) => setGolesLocal(Number(e.target.value))} className="w-14 rounded-md border border-gray-300 px-1 py-0.5 text-center" />
        <span>-</span>
        <input type="number" value={golesVisitante} onChange={(e) => setGolesVisitante(Number(e.target.value))} className="w-14 rounded-md border border-gray-300 px-1 py-0.5 text-center" />
        <span>{partido.equipoVisitanteNombre}</span>
      </div>

      <div className="space-y-1">
        {eventos.map((ev, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <select
              value={ev.jugadorId}
              onChange={(e) => setEventos(eventos.map((x, idx) => (idx === i ? { ...x, jugadorId: e.target.value } : x)))}
              className="rounded-md border border-gray-300 px-1 py-0.5"
            >
              {jugadores.map((j) => (
                <option key={j.jugadorId} value={j.jugadorId}>{j.nombre}</option>
              ))}
            </select>
            <select
              value={ev.tipo}
              onChange={(e) => setEventos(eventos.map((x, idx) => (idx === i ? { ...x, tipo: e.target.value } : x)))}
              className="rounded-md border border-gray-300 px-1 py-0.5"
            >
              {TIPOS_EVENTO.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Min."
              value={ev.minuto}
              onChange={(e) => setEventos(eventos.map((x, idx) => (idx === i ? { ...x, minuto: e.target.value } : x)))}
              className="w-14 rounded-md border border-gray-300 px-1 py-0.5"
            />
            <button onClick={() => quitarEvento(i)} className="text-red-600 hover:underline">Quitar</button>
          </div>
        ))}
        <button onClick={agregarEvento} className="text-xs text-blue-600 hover:underline">+ Agregar evento</button>
      </div>

      <button onClick={guardar} className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700">
        Guardar resultado
      </button>
    </div>
  );
}

function FixtureYTabla({ torneoId }: { torneoId: string }) {
  const { token } = useAuth();
  const [fixture, setFixture] = useState<PartidoResponse[]>([]);
  const [tabla, setTabla] = useState<TablaPosicionesRow[]>([]);
  const [goleadores, setGoleadores] = useState<GoleadorRow[]>([]);
  const [tarjetas, setTarjetas] = useState<TarjetasRow[]>([]);
  const [espacios, setEspacios] = useState<{ espacioId: string; nombre: string }[]>([]);
  const [programando, setProgramando] = useState<string | null>(null);
  const [programarForm, setProgramarForm] = useState({ espacioId: "", fecha: "", hora: "" });
  const [cargandoResultadoDe, setCargandoResultadoDe] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargarTodo = () => {
    if (!token) return;
    Promise.all([
      api.getFixture(token, torneoId),
      api.getTabla(token, torneoId),
      api.getGoleadores(token, torneoId),
      api.getTarjetas(token, torneoId),
    ]).then(([f, t, g, tj]) => {
      setFixture(f);
      setTabla(t);
      setGoleadores(g);
      setTarjetas(tj);
    });
  };

  useEffect(cargarTodo, [token, torneoId]);
  useEffect(() => {
    if (!token) return;
    api.getEspacios(token).then(setEspacios);
  }, [token]);

  const generarFixture = async () => {
    if (!token) return;
    try {
      await api.generarFixture(token, torneoId);
      cargarTodo();
    } catch {
      setError("No se pudo generar el fixture (¿ya existe, o hay menos de 2 equipos?).");
    }
  };

  const programar = async (partidoId: string) => {
    if (!token) return;
    try {
      await api.programarPartido(token, partidoId, programarForm);
      setProgramando(null);
      setProgramarForm({ espacioId: "", fecha: "", hora: "" });
      cargarTodo();
    } catch {
      setError("No se pudo programar el partido (el espacio podría estar ocupado en ese horario).");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Fixture</h3>
        <button onClick={generarFixture} className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700">
          Generar fixture automáticamente
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="space-y-2">
        {fixture.length === 0 && <p className="text-sm text-gray-400">Todavía no se generó el fixture.</p>}
        {fixture.map((p) => (
          <li key={p.partidoId} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                {p.equipoLocalNombre} vs {p.equipoVisitanteNombre}
                {p.fecha && <> · {p.fecha} {p.hora} · {p.espacioNombre}</>}
                {p.golesLocal !== null && p.golesLocal !== undefined && (
                  <> · <strong>{p.golesLocal} - {p.golesVisitante}</strong></>
                )}
                {" · "}
                <span className="text-xs text-gray-500">{p.estado}</span>
              </span>
              <span className="space-x-2">
                {p.estado !== "Jugado" && (
                  <button onClick={() => setProgramando(programando === p.partidoId ? null : p.partidoId)} className="text-xs text-blue-600 hover:underline">
                    Programar
                  </button>
                )}
                {p.estado !== "Jugado" && p.fecha && (
                  <button onClick={() => setCargandoResultadoDe(cargandoResultadoDe === p.partidoId ? null : p.partidoId)} className="text-xs text-green-700 hover:underline">
                    Cargar resultado
                  </button>
                )}
              </span>
            </div>

            {programando === p.partidoId && (
              <div className="mt-2 flex flex-wrap items-end gap-2 rounded-md bg-gray-50 p-3 text-xs">
                <select
                  value={programarForm.espacioId}
                  onChange={(e) => setProgramarForm({ ...programarForm, espacioId: e.target.value })}
                  className="rounded-md border border-gray-300 px-2 py-1"
                >
                  <option value="">Espacio…</option>
                  {espacios.map((e) => (
                    <option key={e.espacioId} value={e.espacioId}>{e.nombre}</option>
                  ))}
                </select>
                <input type="date" value={programarForm.fecha} onChange={(e) => setProgramarForm({ ...programarForm, fecha: e.target.value })} className="rounded-md border border-gray-300 px-2 py-1" />
                <input type="time" value={programarForm.hora} onChange={(e) => setProgramarForm({ ...programarForm, hora: e.target.value })} className="rounded-md border border-gray-300 px-2 py-1" />
                <button onClick={() => programar(p.partidoId)} className="rounded-md bg-gray-900 px-2 py-1 font-medium text-white">
                  Confirmar
                </button>
              </div>
            )}

            {cargandoResultadoDe === p.partidoId && (
              <CargarResultadoForm
                partido={p}
                onGuardado={() => {
                  setCargandoResultadoDe(null);
                  cargarTodo();
                }}
              />
            )}
          </li>
        ))}
      </ul>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Tabla de posiciones</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Equipo</th>
                <th className="px-3 py-2">PJ</th><th className="px-3 py-2">G</th><th className="px-3 py-2">E</th><th className="px-3 py-2">P</th>
                <th className="px-3 py-2">GF</th><th className="px-3 py-2">GC</th><th className="px-3 py-2">DG</th><th className="px-3 py-2">Pts</th>
              </tr>
            </thead>
            <tbody>
              {tabla.length === 0 && <tr><td className="px-3 py-2 text-gray-400" colSpan={9}>Sin partidos jugados todavía.</td></tr>}
              {tabla.map((r) => (
                <tr key={r.equipoId} className="border-t border-gray-100">
                  <td className="px-3 py-2">{r.equipoNombre}</td>
                  <td className="px-3 py-2">{r.pj}</td><td className="px-3 py-2">{r.g}</td><td className="px-3 py-2">{r.e}</td><td className="px-3 py-2">{r.p}</td>
                  <td className="px-3 py-2">{r.gf}</td><td className="px-3 py-2">{r.gc}</td><td className="px-3 py-2">{r.dg}</td><td className="px-3 py-2 font-semibold">{r.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold">Goleadores</h3>
          <ul className="space-y-1 text-sm">
            {goleadores.length === 0 && <p className="text-gray-400">Sin goles cargados.</p>}
            {goleadores.map((g) => (
              <li key={g.jugadorId}>{g.jugadorNombre} ({g.equipoNombre}) · {g.goles}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">Tarjetas</h3>
          <ul className="space-y-1 text-sm">
            {tarjetas.length === 0 && <p className="text-gray-400">Sin tarjetas cargadas.</p>}
            {tarjetas.map((t) => (
              <li key={t.jugadorId}>{t.jugadorNombre} ({t.equipoNombre}) · 🟨 {t.amarillas} · 🟥 {t.rojas}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function TorneosPage() {
  const { token } = useAuth();
  const [torneos, setTorneos] = useState<TorneoResponse[]>([]);
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [form, setForm] = useState<TorneoRequest>(initialTorneoForm);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarTorneos = () => {
    if (!token) return;
    api.getTorneos(token).then(setTorneos).catch(() => setError("No se pudo conectar con la API."));
  };

  useEffect(cargarTorneos, [token]);
  useEffect(() => {
    if (!token) return;
    api.getClientes(token).then(setClientes).catch(() => setClientes([]));
  }, [token]);

  const crearTorneo = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const nuevo = await api.crearTorneo(token, form);
      setForm(initialTorneoForm);
      setMostrarForm(false);
      cargarTorneos();
      setSeleccionado(nuevo.torneoId);
    } catch {
      setError("No se pudo crear el torneo.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Torneos</h1>
          <button onClick={() => setMostrarForm(!mostrarForm)} className="text-xs text-blue-600 hover:underline">
            {mostrarForm ? "Cancelar" : "+ Nuevo"}
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={crearTorneo} className="space-y-2 rounded-lg border border-gray-200 bg-white p-3 text-sm">
            <input
              placeholder="Nombre"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5"
            />
            <input
              placeholder="Categoría"
              required
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5"
            />
            <select value={form.deporte} onChange={(e) => setForm({ ...form, deporte: e.target.value })} className="w-full rounded-md border border-gray-300 px-2 py-1.5">
              {DEPORTES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={form.sistemaCompetencia} onChange={(e) => setForm({ ...form, sistemaCompetencia: e.target.value })} className="w-full rounded-md border border-gray-300 px-2 py-1.5">
              {SISTEMAS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="date" required value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} className="w-full rounded-md border border-gray-300 px-2 py-1.5" />
            <button type="submit" className="w-full rounded-md bg-gray-900 px-3 py-1.5 font-medium text-white hover:bg-gray-700">
              Crear torneo
            </button>
          </form>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <ul className="space-y-1">
          {torneos.map((t) => (
            <li key={t.torneoId}>
              <button
                onClick={() => setSeleccionado(t.torneoId)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${seleccionado === t.torneoId ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
              >
                {t.nombre} <span className="text-xs opacity-70">({t.sistemaCompetencia})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        {!seleccionado ? (
          <p className="text-sm text-gray-500">Elegí un torneo de la lista, o creá uno nuevo.</p>
        ) : (
          <div className="space-y-8">
            <EquiposYJugadores torneoId={seleccionado} clientes={clientes} />
            <FixtureYTabla torneoId={seleccionado} />
          </div>
        )}
      </div>
    </div>
  );
}
