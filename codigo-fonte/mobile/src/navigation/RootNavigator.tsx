import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { NewCatScreen } from "../screens/NewCatScreen";
import { NewPasswordScreen } from "../screens/NewPasswordScreen";
import { TermsAcceptanceScreen } from "../screens/TermsAcceptanceScreen";
import { BottomTabNavigator } from "./BottomTabNavigator";
import type { ChangePasswordRequest, LoginCredentials, User } from "../types/auth";

type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  TermsAcceptance: undefined;
  NewPassword: undefined;
  Main: undefined;
  NewCat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  user: User | null;
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onLogout: () => void;
  onAcceptTerms: () => Promise<void>;
  onChangePassword: (request: ChangePasswordRequest) => Promise<void>;
}

export function RootNavigator({
  user,
  onLogin,
  onLogout,
  onAcceptTerms,
  onChangePassword,
}: RootNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login">
              {({ navigation }) => (
                <LoginScreen
                  onLogin={onLogin}
                  onForgotPassword={() => navigation.navigate("ForgotPassword")}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="ForgotPassword">
              {({ navigation }) => (
                <ForgotPasswordScreen
                  onBackToLogin={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
          </>
        ) : !user.termsAccepted ? (
          <Stack.Screen name="TermsAcceptance">
            {() => <TermsAcceptanceScreen onContinue={onAcceptTerms} />}
          </Stack.Screen>
        ) : user.mustChangePassword ? (
          <Stack.Screen name="NewPassword">
            {() => <NewPasswordScreen onSubmit={onChangePassword} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main">
              {({ navigation }) => (
                <BottomTabNavigator
                  user={user}
                  onLogout={onLogout}
                  onNewCat={() => navigation.navigate("NewCat")}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="NewCat" options={{ presentation: "modal" }}>
              {({ navigation }) => (
                <NewCatScreen
                  onBack={() => navigation.goBack()}
                  onSaved={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
