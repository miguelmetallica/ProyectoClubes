import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth-context";

export default function ClubScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Club</Text>
      <Text style={styles.body}>Dirección, horarios, contacto y reglamento del complejo — contenido a cargar por el club.</Text>

      <Text style={styles.logout} onPress={logout}>
        Cerrar sesión
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 18, fontWeight: "600" },
  body: { fontSize: 14, color: "#555" },
  logout: { fontSize: 14, color: "#c0392b", marginTop: 24 },
});
