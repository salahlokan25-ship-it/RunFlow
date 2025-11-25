import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initDatabase } from '../src/db';
import { THEME } from '../src/theme';
import { View } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initDatabase();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/');
    }
  }, [user, loading, segments]);

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
