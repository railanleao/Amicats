import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useAuth } from "./src/hooks/useAuth";
import { colors } from "./src/theme/colors";

export default function App() {
  const { user, loadingSession, login, logout } = useAuth();

  if (loadingSession) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <>
      <RootNavigator
        user={user}
        onLogin={login}
        onLogout={logout}
        onForgotPassword={() =>
          Alert.alert(
            "Esqueci minha senha",
            "Entre em contato com a administração da ONG.",
          )
        }
      />
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
});
