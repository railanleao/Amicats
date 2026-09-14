import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ComingSoonScreen } from "../screens/ComingSoonScreen";
import { colors } from "../theme/colors";
import type { Usuario } from "../types/auth";

export type BottomTabParamList = {
  Inicio: undefined;
  Gatos: undefined;
  Doses: undefined;
  Busca: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TAB_ICONS: Record<
  keyof BottomTabParamList,
  keyof typeof Ionicons.glyphMap
> = {
  Inicio: "home",
  Gatos: "paw",
  Doses: "medkit",
  Busca: "search",
};

const TAB_ICONS_OUTLINE: Record<
  keyof BottomTabParamList,
  keyof typeof Ionicons.glyphMap
> = {
  Inicio: "home-outline",
  Gatos: "paw-outline",
  Doses: "medkit-outline",
  Busca: "search-outline",
};

interface BottomTabNavigatorProps {
  user: Usuario;
  onLogout: () => void;
}

export function BottomTabNavigator({
  user: _user,
  onLogout,
}: BottomTabNavigatorProps) {
  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }: {
        route: RouteProp<BottomTabParamList, keyof BottomTabParamList>;
      }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: "700" },
        tabBarIcon: ({
          focused,
          color,
          size,
        }: {
          focused: boolean;
          color: string;
          size: number;
        }) => {
          const name = focused
            ? TAB_ICONS[route.name as keyof BottomTabParamList]
            : TAB_ICONS_OUTLINE[route.name as keyof BottomTabParamList];
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" options={{ title: "Início" }}>
        {() => <ComingSoonScreen title="Início" onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Gatos">
        {() => <ComingSoonScreen title="Gatos" onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Doses">
        {() => <ComingSoonScreen title="Doses" onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Busca">
        {() => <ComingSoonScreen title="Busca" onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
