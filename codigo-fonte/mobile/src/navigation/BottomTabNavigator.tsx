import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { CatsScreen } from "../screens/CatsScreen";
import { ComingSoonScreen } from "../screens/ComingSoonScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { SearchScreen } from "../screens/SearchScreen";
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
  onNewCat: () => void;
  onOpenCat: (catId: number) => void;
}

export function BottomTabNavigator({
  user,
  onLogout,
  onNewCat,
  onOpenCat,
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
        {() => <HomeScreen user={user} onNewCat={onNewCat} />}
      </Tab.Screen>
      <Tab.Screen name="Cats" options={{ title: "Gatos" }}>
        {() => <CatsScreen onOpenCat={onOpenCat} />}
      </Tab.Screen>
      <Tab.Screen name="Doses">
        {() => <ComingSoonScreen title="Doses" onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Search" options={{ title: "Busca" }}>
        {() => <SearchScreen onOpenCat={onOpenCat} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
