import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBarInset } from '../components/StatusBarInset';
import { CatDetailScreen } from '../screens/CatDetailScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { NewCatScreen } from '../screens/NewCatScreen';
import { MedicalRecordsScreen } from '../screens/MedicalRecordsScreen';
import { MedicalRecordScreen } from '../screens/MedicalRecordScreen';
import { NewInternalPrescriptionScreen } from '../screens/NewInternalPrescriptionScreen';
import { NewPasswordScreen } from '../screens/NewPasswordScreen';
import { StockEntryScreen } from '../screens/StockEntryScreen';
import { SyncScreen } from '../screens/SyncScreen';
import { TermsAcceptanceScreen } from '../screens/TermsAcceptanceScreen';
import { TransferRoomScreen } from '../screens/TransferRoomScreen';
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
  TransferRoom: { catId: number };
  MedicalRecords: undefined;
  MedicalRecord: { catId: number };
  NewInternalPrescription: { catId: number };
  Sync: undefined;
  StockEntry: undefined;
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
  // Mirrors the backend's role check for room transfers (RF-005 / UC-06-style): Administrator
  // and Médico-Veterinário only.
  const canTransferRoom = user?.accessType === 'Administrator' || user?.accessType === 'Veterinarian';

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
                  onOpenMedicalRecords={() => navigation.navigate('MedicalRecords')}
                  onOpenStockEntry={() => navigation.navigate('StockEntry')}


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
                  onTransferRoom={(catId) => navigation.navigate('TransferRoom', { catId })}
                  canTransferRoom={canTransferRoom}
                  onOpenMedicalRecord={(catId) => navigation.navigate('MedicalRecord', { catId })}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="TransferRoom">
              {({ navigation, route }) => (
                <StatusBarInset>
                  <TransferRoomScreen
                    catId={route.params.catId}
                    onBack={() => navigation.goBack()}
                    onTransferred={() => navigation.goBack()}
                  />
                </StatusBarInset>
              )}
            </Stack.Screen>
            <Stack.Screen name="MedicalRecords">
              {({ navigation }) => (
                <MedicalRecordsScreen
                  onBack={() => navigation.goBack()}
                  onOpenRecord={(catId) => navigation.navigate('MedicalRecord', { catId })}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="MedicalRecord">
              {({ navigation, route }) => (
                <MedicalRecordScreen
                  catId={route.params.catId}
                  canPrescribe={user.accessType === 'Veterinarian'}
                  onBack={() => navigation.goBack()}
                  onNewPrescription={(catId) => navigation.navigate('NewInternalPrescription', { catId })}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="NewInternalPrescription" options={{ presentation: 'modal' }}>
              {({ navigation, route }) => (
                <StatusBarInset>
                  <NewInternalPrescriptionScreen
                    catId={route.params.catId}
                    onBack={() => navigation.goBack()}
                    onSaved={() => navigation.goBack()}
                  />
                </StatusBarInset>
              )}
            </Stack.Screen>
            <Stack.Screen name="Sync">
              {({ navigation }) => (
                <StatusBarInset>
                  <SyncScreen onBack={() => navigation.goBack()} />
                </StatusBarInset>
              )}
            </Stack.Screen>
            <Stack.Screen name="StockEntry" options={{ presentation: 'modal' }}>
              {({ navigation }) => (
                <StatusBarInset>
                  <StockEntryScreen
                    onBack={() => navigation.goBack()}
                    onSaved={() => navigation.goBack()}
                  />
                </StatusBarInset>
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
