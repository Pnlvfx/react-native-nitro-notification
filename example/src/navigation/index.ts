import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStaticNavigation, createNavigationContainerRef } from '@react-navigation/native';
import type { StaticParamList } from '@react-navigation/native';
import { HomeScreen } from '../screens/HomeScreen';
import { NotificationDetailScreen } from '../screens/NotificationDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export const RootStack = createNativeStackNavigator({
  initialRouteName: 'Home',
  screenOptions: {
    headerStyle: { backgroundColor: '#fff' },
    headerTintColor: '#111',
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
  },
  screens: {
    Home: {
      screen: HomeScreen,
      options: { title: 'Nitro Notifications' },
    },
    NotificationDetail: {
      screen: NotificationDetailScreen,
      options: { title: 'Notification' },
    },
    Settings: {
      screen: SettingsScreen,
      options: { title: 'Settings' },
    },
  },
});

export type AppParamList = StaticParamList<typeof RootStack>;

type RootStackType = typeof RootStack;

declare module '@react-navigation/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RootNavigator extends RootStackType {}
}

export const navigationRef = createNavigationContainerRef<AppParamList>();

export const Navigation = createStaticNavigation(RootStack);
