import { Stack } from 'expo-router';
import { THEME } from '../../src/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: THEME.colors.background,
        },
      }}
    />
  );
}
