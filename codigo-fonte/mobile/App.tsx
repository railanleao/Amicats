import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuth } from './src/hooks/useAuth';
import { SyncProvider } from './src/sync/SyncContext';
import { colors } from './src/theme/colors';

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
    <SyncProvider userId={user?.id ?? null}>
      <RootNavigator user={user} onLogin={login} onLogout={logout} onAcceptTerms={acceptTerms} onChangePassword={changePassword} />
      <StatusBar style="auto" />
    </SyncProvider>
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
