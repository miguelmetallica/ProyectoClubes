import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth-context";
import { api, PartidoResponse, TablaPosicionesRow, TorneoResponse } from "../lib/api";

type Tab = "Tabla" | "Fixture";

export default function TorneosScreen() {
  const { token } = useAuth();
  const [torneos, setTorneos] = useState<TorneoResponse[]>([]);
  const [seleccionado, setSeleccionado] = useState<TorneoResponse | null>(null);
  const [tab, setTab] = useState<Tab>("Tabla");
  const [tabla, setTabla] = useState<TablaPosicionesRow[]>([]);
  const [fixture, setFixture] = useState<PartidoResponse[]>([]);

  useEffect(() => {
    if (!token) return;
    api.getTorneos(token).then((data) => {
      setTorneos(data);
      setSeleccionado((actual) => actual ?? data[0] ?? null);
    });
  }, [token]);

  useEffect(() => {
    if (!token || !seleccionado) return;
    api.getTabla(token, seleccionado.torneoId).then(setTabla);
    api.getFixture(token, seleccionado.torneoId).then(setFixture);
  }, [token, seleccionado]);

  if (torneos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Torneos</Text>
        <Text style={styles.empty}>No hay torneos cargados todavía.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={torneos}
        keyExtractor={(t) => t.torneoId}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.chip, seleccionado?.torneoId === item.torneoId && styles.chipActive]}
            onPress={() => setSeleccionado(item)}
          >
            <Text style={seleccionado?.torneoId === item.torneoId ? styles.chipTextActive : styles.chipText}>
              {item.nombre}
            </Text>
          </Pressable>
        )}
      />

      <View style={styles.tabs}>
        {(["Tabla", "Fixture"] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={tab === t ? styles.tabTextActive : styles.tabText}>{t}</Text>
          </Pressable>
        ))}
      </View>

      {tab === "Tabla" ? (
        <FlatList
          data={tabla}
          keyExtractor={(r) => r.equipoId}
          ListEmptyComponent={<Text style={styles.empty}>Todavía no hay partidos jugados.</Text>}
          ListHeaderComponent={
            tabla.length > 0 ? (
              <View style={styles.row}>
                <Text style={[styles.headerCell, styles.equipoCell]}>Equipo</Text>
                <Text style={styles.headerCell}>PJ</Text>
                <Text style={styles.headerCell}>DG</Text>
                <Text style={styles.headerCell}>Pts</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={[styles.cell, styles.equipoCell]} numberOfLines={1}>{item.equipoNombre}</Text>
              <Text style={styles.cell}>{item.pj}</Text>
              <Text style={styles.cell}>{item.dg}</Text>
              <Text style={[styles.cell, styles.pts]}>{item.pts}</Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={fixture}
          keyExtractor={(p) => p.partidoId}
          contentContainerStyle={{ gap: 8 }}
          ListEmptyComponent={<Text style={styles.empty}>Todavía no se generó el fixture.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.equipoLocalNombre} vs {item.equipoVisitanteNombre}</Text>
              {item.fecha ? (
                <Text style={styles.cardBody}>{item.fecha} {item.hora} · {item.espacioNombre}</Text>
              ) : (
                <Text style={styles.cardBody}>Sin programar</Text>
              )}
              {item.golesLocal !== null && item.golesLocal !== undefined && (
                <Text style={styles.resultado}>{item.golesLocal} - {item.golesVisitante}</Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 18, fontWeight: "600" },
  empty: { color: "#888", fontSize: 13, paddingVertical: 12 },
  chip: { borderWidth: 1, borderColor: "#ccc", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: "#111", borderColor: "#111" },
  chipText: { fontSize: 13 },
  chipTextActive: { fontSize: 13, color: "#fff" },
  tabs: { flexDirection: "row", gap: 8 },
  tab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  tabActive: { backgroundColor: "#eee" },
  tabText: { fontSize: 13, color: "#888" },
  tabTextActive: { fontSize: 13, color: "#111", fontWeight: "600" },
  row: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  headerCell: { flex: 1, fontSize: 11, fontWeight: "700", color: "#888", textAlign: "center" },
  cell: { flex: 1, fontSize: 13, textAlign: "center" },
  equipoCell: { flex: 2, textAlign: "left" },
  pts: { fontWeight: "700" },
  card: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 12, padding: 14, gap: 4 },
  cardTitle: { fontSize: 14, fontWeight: "600" },
  cardBody: { fontSize: 12, color: "#666" },
  resultado: { fontSize: 16, fontWeight: "700" },
});
