import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { NewCatScreen } from "../screens/NewCatScreen";
import { NewPrescriptionScreen } from "../screens/NewPrescriptionScreen";
import { colors } from "../theme/colors";
import type { User } from "../types/auth";

export type HomeStackParamList = {
  Home: undefined;
  NewCat: undefined;
  NewPrescription: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const formHeaderOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerTintColor: colors.ink,
  headerTitleStyle: { fontSize: 18, fontWeight: "600" as const },
};

interface HomeStackNavigatorProps {
  user: User;
}

export function HomeStackNavigator({ user }: HomeStackNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home">
        {() => <HomeScreen user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="NewCat"
        component={NewCatScreen}
        options={{ ...formHeaderOptions, title: "Novo gato" }}
      />
      <Stack.Screen
        name="NewPrescription"
        component={NewPrescriptionScreen}
        options={{ ...formHeaderOptions, title: "Nova prescrição" }}
      />
    </Stack.Navigator>
  );
}
