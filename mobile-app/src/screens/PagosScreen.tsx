import { StyleSheet, Text, View } from "react-native";

export default function PagosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagos</Text>
      <Text style={styles.body}>
        Comprobantes, saldo y medios de pago. El pago de una reserva puntual ya se registra desde la pantalla
        Reservar → Confirmación (los 4 medios: Mercado Pago, tarjeta, transferencia y efectivo, ver
        docs/03-flujos-clave.md); esta vista consolidada de historial de pagos queda para Fase 2.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 8 },
  title: { fontSize: 18, fontWeight: "600" },
  body: { fontSize: 14, color: "#555" },
});
