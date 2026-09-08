import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth-context";
import { api, ReservaResponse } from "../lib/api";

export default function InicioScreen() {
  const { token, session } = useAuth();
  const [proximaReserva, setProximaReserva] = useState<ReservaResponse | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .getMisReservas(token)
      .then((reservas) => {
        const hoy = new Date().toISOString().slice(0, 10);
        const proximas = reservas
          .filter((r) => r.estado !== "Cancelada" && r.fecha >= hoy)
          .sort((a, b) => a.fecha.localeCompare(b.fecha));
        setProximaReserva(proximas[0] ?? null);
      })
      .catch(() => setProximaReserva(null));
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hola, {session?.nombre}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tu próximo turno</Text>
        {proximaReserva ? (
          <FlatList
            data={[proximaReserva]}
            keyExtractor={(r) => r.reservaId}
            renderItem={({ item }) => (
              <Text style={styles.cardBody}>
                {item.espacioNombre} · {item.fecha} · {item.horaInicio}–{item.horaFin} · {item.estado}
              </Text>
            )}
          />
        ) : (
          <Text style={styles.cardBody}>No tenés turnos próximos. ¡Reservá uno en la pestaña Reservar!</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  greeting: { fontSize: 22, fontWeight: "700" },
  card: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 12, padding: 16, gap: 8 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#555" },
  cardBody: { fontSize: 15 },
});
