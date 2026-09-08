import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../lib/auth-context";
import { api, EspacioResponse } from "../lib/api";

/**
 * Selección de espacio + franja horaria. La grilla de disponibilidad por franjas
 * (docs/04-pantallas.md) queda para cuando el backend exponga los horarios libres
 * por espacio y fecha; por ahora se ingresa la franja manualmente.
 */
export default function ReservarScreen() {
  const { token } = useAuth();
  const [espacios, setEspacios] = useState<EspacioResponse[]>([]);
  const [seleccionado, setSeleccionado] = useState<EspacioResponse | null>(null);
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.getEspacios(token).then(setEspacios).catch(() => setEspacios([]));
  }, [token]);

  const reservar = async () => {
    if (!token || !seleccionado) return;
    setSubmitting(true);
    try {
      await api.crearReserva(token, {
        espacioId: seleccionado.espacioId,
        fecha,
        horaInicio,
        horaFin,
      });
      Alert.alert("Reserva creada", "Continuá con el pago desde Mis reservas.");
      setFecha("");
      setHoraInicio("");
      setHoraFin("");
    } catch {
      Alert.alert("No se pudo reservar", "La franja podría estar ocupada o los datos son inválidos.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Elegí espacio</Text>
      <FlatList
        data={espacios}
        keyExtractor={(e) => e.espacioId}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
        ListEmptyComponent={<Text style={styles.empty}>No hay espacios cargados todavía.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.chip, seleccionado?.espacioId === item.espacioId && styles.chipActive]}
            onPress={() => setSeleccionado(item)}
          >
            <Text style={seleccionado?.espacioId === item.espacioId ? styles.chipTextActive : styles.chipText}>
              {item.nombre}
            </Text>
          </Pressable>
        )}
      />

      {seleccionado && (
        <View style={styles.form}>
          <Text style={styles.label}>
            Precio: ${seleccionado.precioBase} · Seña {seleccionado.pctSena}%
          </Text>
          <TextInput style={styles.input} placeholder="Fecha (YYYY-MM-DD)" value={fecha} onChangeText={setFecha} />
          <TextInput style={styles.input} placeholder="Hora inicio (HH:mm)" value={horaInicio} onChangeText={setHoraInicio} />
          <TextInput style={styles.input} placeholder="Hora fin (HH:mm)" value={horaFin} onChangeText={setHoraFin} />

          <Pressable style={styles.button} onPress={reservar} disabled={submitting}>
            <Text style={styles.buttonText}>{submitting ? "Reservando…" : "Reservar"}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  title: { fontSize: 18, fontWeight: "600" },
  empty: { color: "#888", fontSize: 13 },
  chip: { borderWidth: 1, borderColor: "#ccc", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: "#111", borderColor: "#111" },
  chipText: { fontSize: 13 },
  chipTextActive: { fontSize: 13, color: "#fff" },
  form: { gap: 10, marginTop: 8 },
  label: { fontSize: 13, color: "#555" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 15 },
  button: { backgroundColor: "#111", borderRadius: 8, padding: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
