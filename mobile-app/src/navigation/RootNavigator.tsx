import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../lib/auth-context";
import { AuthStackParamList, MainTabParamList } from "./types";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import InicioScreen from "../screens/InicioScreen";
import ReservarScreen from "../screens/ReservarScreen";
import MisReservasScreen from "../screens/MisReservasScreen";
import TorneosScreen from "../screens/TorneosScreen";
import PagosScreen from "../screens/PagosScreen";
import ClubScreen from "../screens/ClubScreen";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainTabs.Navigator screenOptions={{ headerTitleAlign: "center" }}>
      <MainTabs.Screen name="Inicio" component={InicioScreen} />
      <MainTabs.Screen name="Reservar" component={ReservarScreen} />
      <MainTabs.Screen name="MisReservas" component={MisReservasScreen} options={{ title: "Mis reservas" }} />
      <MainTabs.Screen name="Torneos" component={TorneosScreen} />
      <MainTabs.Screen name="Pagos" component={PagosScreen} />
      <MainTabs.Screen name="Club" component={ClubScreen} />
    </MainTabs.Navigator>
  );
}

export default function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <NavigationContainer>{token ? <MainNavigator /> : <AuthNavigator />}</NavigationContainer>;
}
