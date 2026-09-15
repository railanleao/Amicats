import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { BottomTabNavigator } from "./BottomTabNavigator";
import type { LoginCredentials, User } from "../types/auth";

type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  user: User | null;
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onLogout: () => void;
}

export function RootNavigator({ user, onLogin, onLogout }: RootNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main">
            {() => <BottomTabNavigator user={user} onLogout={onLogout} />}
          </Stack.Screen>
        ) : (
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
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
