import { StyleSheet, Text, View } from "react-native";

export default function PagosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagos</Text>
      <Text style={styles.body}>
        Comprobantes y saldo. El pago de una reserva puntual se hace desde &quot;Mis reservas&quot; tocando
        &quot;Pagar&quot; en cualquier turno pendiente de pago (los 4 medios: Mercado Pago, tarjeta, transferencia y
        efectivo, ver docs/03-flujos-clave.md); esta vista consolidada de historial de pagos queda pendiente.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 8 },
  title: { fontSize: 18, fontWeight: "600" },
  body: { fontSize: 14, color: "#555" },
});
