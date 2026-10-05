import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useAuth } from "./src/hooks/useAuth";
import { colors } from "./src/theme/colors";

export default function App() {
  const { user, loadingSession, login, logout, acceptTerms, changePassword } = useAuth();

  if (loadingSession) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator
        user={user}
        onLogin={login}
        onLogout={logout}
        onAcceptTerms={acceptTerms}
        onChangePassword={changePassword}
      />
      <StatusBar style="auto" />
    </SafeAreaProvider>
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
