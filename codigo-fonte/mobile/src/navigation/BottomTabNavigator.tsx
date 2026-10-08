import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CatsScreen } from '../screens/CatsScreen';
import { ComingSoonScreen } from '../screens/ComingSoonScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { colors } from '../theme/colors';
import { resolveFontFamily } from '../theme/fonts';
import type { User } from '../types/auth';
import { StockScreen } from '../screens/StockScreen';
import { canManageStock, canViewStock } from '../types/auth';

export type BottomTabParamList = {
  Home: undefined;
  Cats: undefined;
  Doses: undefined;
  Search: undefined;
  Stock: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TAB_ICONS: Record<keyof BottomTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Cats: 'paw',
  Doses: 'medkit',
  Search: 'search',
  Stock: 'archive',
};

const TAB_ICONS_OUTLINE: Record<keyof BottomTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Cats: 'paw-outline',
  Doses: 'medkit-outline',
  Search: 'search-outline',
  Stock: 'archive-outline',
};

interface BottomTabNavigatorProps {
  user: User;
  onLogout: () => void;
  onNewCat: () => void;
  onOpenCat: (catId: number) => void;
  onOpenSync: () => void;
  onOpenStockEntry: () => void;
}

export function BottomTabNavigator({ user, onLogout, onNewCat, onOpenCat, onOpenSync, onOpenStockEntry }: BottomTabNavigatorProps) {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: RouteProp<BottomTabParamList, keyof BottomTabParamList> }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 10.5, fontFamily: resolveFontFamily(undefined, '700') },
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          const name = focused
            ? TAB_ICONS[route.name as keyof BottomTabParamList]
            : TAB_ICONS_OUTLINE[route.name as keyof BottomTabParamList];
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" options={{ title: 'Início' }}>
         {({ navigation }) => ( <HomeScreen user={user} onNewCat={onNewCat} onOpenSync={onOpenSync} onOpenStock={() => navigation.navigate('Stock')}
         />
          )}
      </Tab.Screen>
      <Tab.Screen name="Cats" options={{ title: 'Gatos' }}>
        {() => <CatsScreen onOpenCat={onOpenCat} />}
      </Tab.Screen>
      <Tab.Screen name="Doses">{() => <ComingSoonScreen title="Doses" onLogout={onLogout} />}</Tab.Screen>
      <Tab.Screen name="Search" options={{ title: 'Busca' }}>
        {() => <SearchScreen onOpenCat={onOpenCat} />}
      </Tab.Screen>

    {canViewStock(user.accessType) && (
      <Tab.Screen
        name="Stock"
        options={{
          tabBarButton: () => null,
        }}
      >
        {({ navigation }) => (
          <StockScreen
            canManageStock={canManageStock(user.accessType)}
            onBack={() => navigation.navigate('Home')}
              onRegisterEntry={onOpenStockEntry}
          />
        )}
      </Tab.Screen>
    )}

    </Tab.Navigator>
  );
}
