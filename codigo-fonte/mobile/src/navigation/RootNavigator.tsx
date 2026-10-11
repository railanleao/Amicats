import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBarInset } from '../components/StatusBarInset';
import { CancelHealthProcedureScreen } from '../screens/CancelHealthProcedureScreen';
import { CatDetailScreen } from '../screens/CatDetailScreen';
import { CompleteHealthProcedureScreen } from '../screens/CompleteHealthProcedureScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HealthProcedureFormScreen } from '../screens/HealthProcedureFormScreen';
import { HealthProcedureScreen } from '../screens/HealthProcedureScreen';
import { HealthProceduresScreen } from '../screens/HealthProceduresScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MedicalRecordScreen } from '../screens/MedicalRecordScreen';
import { MedicalRecordsScreen } from '../screens/MedicalRecordsScreen';
import { NewCatScreen } from '../screens/NewCatScreen';
import { NewInternalPrescriptionScreen } from '../screens/NewInternalPrescriptionScreen';
import { NewPasswordScreen } from '../screens/NewPasswordScreen';
import { StockEntryScreen } from '../screens/StockEntryScreen';
import { SyncScreen } from '../screens/SyncScreen';
import { TermsAcceptanceScreen } from '../screens/TermsAcceptanceScreen';
import { TransferRoomScreen } from '../screens/TransferRoomScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import type { ChangePasswordRequest, LoginCredentials, User } from '../types/auth';
import { canManageHealthProcedures } from '../utils/healthProcedure';

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
  HealthProcedures: { catId: number; catName: string } | undefined;
  HealthProcedure: { procedureId: number };
  HealthProcedureForm: { procedureId?: number; catId?: number } | undefined;
  CompleteHealthProcedure: { procedureId: number };
  CancelHealthProcedure: { procedureId: number };
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
  const canManageHealth = canManageHealthProcedures(user?.accessType);

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
                  onOpenHealthProcedures={() => navigation.navigate('HealthProcedures')}
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
                  onOpenHealthProcedures={(catId, catName) => navigation.navigate('HealthProcedures', { catId, catName })}
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
            <Stack.Screen name="HealthProcedures">
              {({ navigation, route }) => (
                <HealthProceduresScreen
                  catId={route.params?.catId}
                  catName={route.params?.catName}
                  canManage={canManageHealth}
                  onBack={() => navigation.goBack()}
                  onOpenProcedure={(procedureId) => navigation.navigate('HealthProcedure', { procedureId })}
                  onNewProcedure={(catId) => navigation.navigate('HealthProcedureForm', { catId })}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="HealthProcedure">
              {({ navigation, route }) => (
                <HealthProcedureScreen
                  procedureId={route.params.procedureId}
                  canManage={canManageHealth}
                  onBack={() => navigation.goBack()}
                  onOpenProcedure={(procedureId) => navigation.push('HealthProcedure', { procedureId })}
                  onEdit={(procedureId) => navigation.navigate('HealthProcedureForm', { procedureId })}
                  onComplete={(procedureId) => navigation.navigate('CompleteHealthProcedure', { procedureId })}
                  onCancel={(procedureId) => navigation.navigate('CancelHealthProcedure', { procedureId })}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="HealthProcedureForm" options={{ presentation: 'modal' }}>
              {({ navigation, route }) => (
                <StatusBarInset>
                  <HealthProcedureFormScreen
                    procedureId={route.params?.procedureId}
                    catId={route.params?.catId}
                    onBack={() => navigation.goBack()}
                    onSaved={(procedure) =>
                      route.params?.procedureId !== undefined
                        ? navigation.goBack()
                        : navigation.replace('HealthProcedure', { procedureId: procedure.id })
                    }
                  />
                </StatusBarInset>
              )}
            </Stack.Screen>
            <Stack.Screen name="CompleteHealthProcedure" options={{ presentation: 'modal' }}>
              {({ navigation, route }) => (
                <StatusBarInset>
                  <CompleteHealthProcedureScreen
                    procedureId={route.params.procedureId}
                    onBack={() => navigation.goBack()}
                    onDone={() => navigation.goBack()}
                  />
                </StatusBarInset>
              )}
            </Stack.Screen>
            <Stack.Screen name="CancelHealthProcedure" options={{ presentation: 'modal' }}>
              {({ navigation, route }) => (
                <StatusBarInset>
                  <CancelHealthProcedureScreen
                    procedureId={route.params.procedureId}
                    onBack={() => navigation.goBack()}
                    onDone={() => navigation.goBack()}
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
                  <StockEntryScreen onBack={() => navigation.goBack()} onSaved={() => navigation.goBack()} />
                </StatusBarInset>
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
