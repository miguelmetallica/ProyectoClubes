import { StyleSheet, Text, View } from "react-native";

export default function TorneosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Torneos</Text>
      <Text style={styles.body}>
        Fixture, tabla de posiciones y estadísticas — Fase 3 del roadmap. Falta exponer los endpoints de
        Torneo/Zona/Equipo/Partido para conectar esta pantalla.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 8 },
  title: { fontSize: 18, fontWeight: "600" },
  body: { fontSize: 14, color: "#555" },
});
