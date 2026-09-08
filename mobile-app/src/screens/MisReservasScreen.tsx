import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../lib/auth-context";
import { api, ReservaResponse } from "../lib/api";

export default function MisReservasScreen() {
  const { token } = useAuth();
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);

  const cargar = useCallback(() => {
    if (!token) return;
    api.getMisReservas(token).then(setReservas).catch(() => setReservas([]));
  }, [token]);

  useFocusEffect(cargar);

  const cancelar = (id: string) => {
    if (!token) return;
    Alert.alert("Cancelar reserva", "¿Confirmás la cancelación de este turno?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          await api.cancelarReserva(token, id);
          cargar();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis reservas</Text>
      <FlatList
        data={reservas}
        keyExtractor={(r) => r.reservaId}
        contentContainerStyle={{ gap: 10 }}
        ListEmptyComponent={<Text style={styles.empty}>Todavía no tenés reservas.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.espacioNombre}</Text>
            <Text style={styles.cardBody}>
              {item.fecha} · {item.horaInicio}–{item.horaFin}
            </Text>
            <Text style={styles.estado}>{item.estado}</Text>
            {item.estado !== "Cancelada" && item.estado !== "NoShow" && (
              <Pressable onPress={() => cancelar(item.reservaId)}>
                <Text style={styles.cancelar}>Cancelar</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 18, fontWeight: "600" },
  empty: { color: "#888", fontSize: 13 },
  card: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 12, padding: 14, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: "600" },
  cardBody: { fontSize: 13, color: "#444" },
  estado: { fontSize: 12, color: "#1d4ed8", fontWeight: "600" },
  cancelar: { fontSize: 13, color: "#c0392b", marginTop: 6 },
});
