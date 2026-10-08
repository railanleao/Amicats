import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuth } from './src/hooks/useAuth';
import { SyncProvider } from './src/sync/SyncContext';
import { colors } from './src/theme/colors';
import { fontAssets } from './src/theme/fontAssets';

export default function App() {
  const { user, loadingSession, login, logout, acceptTerms, changePassword } = useAuth();
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  if (loadingSession || (!fontsLoaded && !fontError)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SyncProvider userId={user?.id ?? null}>
        <RootNavigator user={user} onLogin={login} onLogout={logout} onAcceptTerms={acceptTerms} onChangePassword={changePassword} />
        <StatusBar style="auto" />
      </SyncProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});
