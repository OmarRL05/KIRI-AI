import '../global.css';
import '@/lib/interop';
import { Geist_500Medium, Geist_600SemiBold, useFonts } from '@expo-google-fonts/geist';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '@/lib/app-context';
import { useTheme } from '@/lib/theme';

LogBox.ignoreLogs(['ImageBackground is deprecated']);
SplashScreen.preventAutoHideAsync();

function Gate({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { ready, profile } = useApp();
  const t = useTheme();
  const done = ready && fontsLoaded;

  useEffect(() => {
    if (done) SplashScreen.hideAsync();
  }, [done]);

  if (!done) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
        <Stack.Protected guard={!profile.onboarded}>
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        </Stack.Protected>
        <Stack.Protected guard={profile.onboarded}>
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="object/[id]" options={{ presentation: 'modal' }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Geist_500Medium, Geist_600SemiBold });
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <Gate fontsLoaded={fontsLoaded} />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
