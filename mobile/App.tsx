import { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme, type Theme as NavTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { loadToken, saveToken, clearToken } from './src/auth';
import { SessionContext } from './src/session';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { VisitorsScreen } from './src/screens/VisitorsScreen';
import { theme } from './src/theme';

const Tab = createBottomTabNavigator();

const navigationTheme: NavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.color.background,
    card: theme.color.surface,
    text: theme.color.textPrimary,
    border: theme.color.border,
    primary: theme.color.series1,
  },
};

/**
 * Separate from App so the inset hook runs inside SafeAreaProvider — the app
 * draws edge to edge, so the tab bar has to lift clear of the gesture bar
 * itself.
 */
function SignedInTabs() {
  const insets = useSafeAreaInsets();
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.color.series1,
          tabBarInactiveTintColor: theme.color.textMuted,
          tabBarStyle: {
            backgroundColor: theme.color.surface,
            borderTopColor: theme.color.border,
            height: 58 + insets.bottom,
            paddingBottom: insets.bottom + 4,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="Overview"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Visitors"
          component={VisitorsScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    loadToken().then((stored) => {
      setToken(stored);
      setRestoring(false);
    });
  }, []);

  const signIn = useCallback(async (next: string) => {
    await saveToken(next);
    setToken(next);
  }, []);

  const signOut = useCallback(() => {
    void clearToken();
    setToken(null);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {restoring ? (
        <View style={styles.splash}>
          <ActivityIndicator color={theme.color.series1} />
        </View>
      ) : !token ? (
        <LoginScreen onAuthenticated={signIn} />
      ) : (
        <SessionContext.Provider value={{ token, signOut }}>
          <SignedInTabs />
        </SessionContext.Provider>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: theme.color.background, alignItems: 'center', justifyContent: 'center' },
});
