import { useCallback, useState } from "react";
import { Alert, FlatList, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../lib/auth-context";
import { api, ApiError, ReservaResponse } from "../lib/api";

const METODOS = [
  { value: "MercadoPago", label: "Mercado Pago" },
  { value: "Tarjeta", label: "Tarjeta" },
  { value: "Transferencia", label: "Transferencia" },
  { value: "Efectivo", label: "Efectivo en el club" },
];

function PagarForm({ reserva, onPagado }: { reserva: ReservaResponse; onPagado: () => void }) {
  const { token } = useAuth();
  const [metodo, setMetodo] = useState("MercadoPago");
  const [comprobanteUrl, setComprobanteUrl] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pagar = async () => {
    if (!token) return;
    if (metodo === "Transferencia" && !comprobanteUrl.trim()) {
      setError("Subí el comprobante a algún servicio y pegá el link acá.");
      return;
    }

    setEnviando(true);
    setError(null);
    try {
      const pago = await api.crearPago(token, {
        reservaId: reserva.reservaId,
        metodo,
        monto: reserva.precioTotal,
        comprobanteUrl: metodo === "Transferencia" ? comprobanteUrl.trim() : undefined,
      });

      if (metodo === "MercadoPago" && pago.checkoutUrl) {
        await Linking.openURL(pago.checkoutUrl);
      } else if (metodo === "Efectivo") {
        Alert.alert("Listo", "Pagá en el club cuando llegues a tu turno.");
      } else if (metodo === "Transferencia") {
        Alert.alert("Comprobante enviado", "El club va a validar tu transferencia.");
      } else {
        Alert.alert("Pago confirmado", "Tu turno ya está confirmado.");
      }

      onPagado();
    } catch (err) {
      setError(err instanceof ApiError ? "No se pudo registrar el pago." : "No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={styles.pagoForm}>
      <View style={styles.metodos}>
        {METODOS.map((m) => (
          <Pressable
            key={m.value}
            style={[styles.metodoChip, metodo === m.value && styles.metodoChipActive]}
            onPress={() => setMetodo(m.value)}
          >
            <Text style={metodo === m.value ? styles.metodoTextActive : styles.metodoText}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      {metodo === "Transferencia" && (
        <TextInput
          style={styles.input}
          placeholder="Link al comprobante"
          value={comprobanteUrl}
          onChangeText={setComprobanteUrl}
          autoCapitalize="none"
        />
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.pagarButton} onPress={pagar} disabled={enviando}>
        <Text style={styles.pagarButtonText}>{enviando ? "Enviando…" : `Pagar $${reserva.precioTotal}`}</Text>
      </Pressable>
    </View>
  );
}

export default function MisReservasScreen() {
  const { token } = useAuth();
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [pagando, setPagando] = useState<string | null>(null);

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

            <View style={styles.acciones}>
              {item.estado === "PendientePago" && (
                <Pressable onPress={() => setPagando(pagando === item.reservaId ? null : item.reservaId)}>
                  <Text style={styles.pagar}>{pagando === item.reservaId ? "Ocultar" : "Pagar"}</Text>
                </Pressable>
              )}
              {item.estado !== "Cancelada" && item.estado !== "NoShow" && (
                <Pressable onPress={() => cancelar(item.reservaId)}>
                  <Text style={styles.cancelar}>Cancelar</Text>
                </Pressable>
              )}
            </View>

            {pagando === item.reservaId && (
              <PagarForm
                reserva={item}
                onPagado={() => {
                  setPagando(null);
                  cargar();
                }}
              />
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
  acciones: { flexDirection: "row", gap: 16, marginTop: 6 },
  pagar: { fontSize: 13, color: "#0a7d34", fontWeight: "600" },
  cancelar: { fontSize: 13, color: "#c0392b" },
  pagoForm: { marginTop: 10, gap: 8, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 10 },
  metodos: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metodoChip: { borderWidth: 1, borderColor: "#ccc", borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  metodoChipActive: { backgroundColor: "#111", borderColor: "#111" },
  metodoText: { fontSize: 12 },
  metodoTextActive: { fontSize: 12, color: "#fff" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, fontSize: 13 },
  error: { color: "#c0392b", fontSize: 12 },
  pagarButton: { backgroundColor: "#111", borderRadius: 8, padding: 10, alignItems: "center" },
  pagarButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});
