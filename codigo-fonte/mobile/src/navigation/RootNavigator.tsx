import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../screens/LoginScreen";
import { BottomTabNavigator } from "./BottomTabNavigator";
import type { LoginCredentials, User } from "../types/auth";

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  user: User | null;
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onLogout: () => void;
  onForgotPassword: () => void;
}

export function RootNavigator({
  user,
  onLogin,
  onLogout,
  onForgotPassword,
}: RootNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main">
            {() => <BottomTabNavigator user={user} onLogout={onLogout} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {() => (
              <LoginScreen
                onLogin={onLogin}
                onForgotPassword={onForgotPassword}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
