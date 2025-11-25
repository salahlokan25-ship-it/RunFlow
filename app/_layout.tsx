import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { initDatabase } from '../src/db';
import { THEME } from '../src/theme';
import { View } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import SplashScreen from './splash';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    initDatabase();
    // Mark app as ready after a brief delay
    setTimeout(() => setAppReady(true), 100);
  }, []);

  useEffect(() => {
    if (loading || !appReady) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Show splash before navigating to main app after login
      setShowSplash(true);
      setTimeout(() => {
        router.replace('/(tabs)/');
      }, 100);
    }
  }, [user, loading, segments, appReady]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={THEME.colors.background} />
      <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: THEME.colors.background,
            },
            headerTintColor: THEME.colors.text,
            contentStyle: {
              backgroundColor: THEME.colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </Stack>
      </View>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
