import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBarInset } from '../components/StatusBarInset';
import { CatDetailScreen } from '../screens/CatDetailScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { NewCatScreen } from '../screens/NewCatScreen';
import { NewPasswordScreen } from '../screens/NewPasswordScreen';
import { SyncScreen } from '../screens/SyncScreen';
import { TermsAcceptanceScreen } from '../screens/TermsAcceptanceScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import type { ChangePasswordRequest, LoginCredentials, User } from '../types/auth';

type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  TermsAcceptance: undefined;
  NewPassword: undefined;
  Main: undefined;
  NewCat: { catId?: number } | undefined;
  CatDetail: { catId: number };
  Sync: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  user: User | null;
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onLogout: () => void;
  onAcceptTerms: () => Promise<void>;
  onChangePassword: (request: ChangePasswordRequest) => Promise<void>;
}

export function RootNavigator({ user, onLogin, onLogout, onAcceptTerms, onChangePassword }: RootNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login">
              {({ navigation }) => <LoginScreen onLogin={onLogin} onForgotPassword={() => navigation.navigate('ForgotPassword')} />}
            </Stack.Screen>
            <Stack.Screen name="ForgotPassword">
              {({ navigation }) => <ForgotPasswordScreen onBackToLogin={() => navigation.goBack()} />}
            </Stack.Screen>
          </>
        ) : !user.termsAccepted ? (
          <Stack.Screen name="TermsAcceptance">{() => <TermsAcceptanceScreen onContinue={onAcceptTerms} />}</Stack.Screen>
        ) : user.mustChangePassword ? (
          <Stack.Screen name="NewPassword">{() => <NewPasswordScreen onSubmit={onChangePassword} />}</Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main">
              {({ navigation }) => (
                <BottomTabNavigator
                  user={user}
                  onLogout={onLogout}
                  onNewCat={() => navigation.navigate('NewCat')}
                  onOpenCat={(catId) => navigation.navigate('CatDetail', { catId })}
                  onOpenSync={() => navigation.navigate('Sync')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="NewCat" options={{ presentation: 'modal' }}>
              {({ navigation, route }) => (
                <StatusBarInset>
                  <NewCatScreen catId={route.params?.catId} onBack={() => navigation.goBack()} onSaved={() => navigation.goBack()} />
                </StatusBarInset>
              )}
            </Stack.Screen>
            <Stack.Screen name="CatDetail">
              {({ navigation, route }) => (
                <CatDetailScreen
                  catId={route.params.catId}
                  onBack={() => navigation.goBack()}
                  onEdit={(catId) => navigation.navigate('NewCat', { catId })}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Sync">
              {({ navigation }) => (
                <StatusBarInset>
                  <SyncScreen onBack={() => navigation.goBack()} />
                </StatusBarInset>
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
