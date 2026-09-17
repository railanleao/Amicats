import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ComingSoonScreen } from "../screens/ComingSoonScreen";
import { colors } from "../theme/colors";
import type { User } from "../types/auth";

export type BottomTabParamList = {
  Home: undefined;
  Cats: undefined;
  Doses: undefined;
  Search: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TAB_ICONS: Record<
  keyof BottomTabParamList,
  keyof typeof Ionicons.glyphMap
> = {
  Home: "home",
  Cats: "paw",
  Doses: "medkit",
  Search: "search",
};

const TAB_ICONS_OUTLINE: Record<
  keyof BottomTabParamList,
  keyof typeof Ionicons.glyphMap
> = {
  Home: "home-outline",
  Cats: "paw-outline",
  Doses: "medkit-outline",
  Search: "search-outline",
};

interface BottomTabNavigatorProps {
  user: User;
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
      <Tab.Screen name="Home" options={{ title: "Início" }}>
        {() => <ComingSoonScreen title="Início" onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Cats" options={{ title: "Gatos" }}>
        {() => <ComingSoonScreen title="Gatos" onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Doses">
        {() => <ComingSoonScreen title="Doses" onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Search" options={{ title: "Busca" }}>
        {() => <ComingSoonScreen title="Busca" onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
