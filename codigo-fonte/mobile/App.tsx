import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "./src/hooks/useAuth";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { HomePlaceholderScreen } from "./src/screens/HomePlaceholderScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { colors } from "./src/theme/colors";

type PublicScreen = "login" | "forgot-password";

export default function App() {
  const { user, loadingSession, login, logout } = useAuth();
  const [publicScreen, setPublicScreen] = useState<PublicScreen>("login");

  return (
    <View style={styles.container}>
      {loadingSession ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : user ? (
        <HomePlaceholderScreen user={user} onLogout={logout} />
      ) : publicScreen === "forgot-password" ? (
        <ForgotPasswordScreen onBackToLogin={() => setPublicScreen("login")} />
      ) : (
        <LoginScreen
          onLogin={login}
          onForgotPassword={() => setPublicScreen("forgot-password")}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
