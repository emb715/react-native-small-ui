import '../src/config';

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setColorScheme } from 'react-native-small-ui/colormode';

// Read ?theme= at module load time — before first render — so the store
// is already in the correct state when components mount. This eliminates
// the flash frame that occurs when setColorScheme is called in useEffect.
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('theme');
  if (initial === 'dark' || initial === 'light') {
    setColorScheme(initial);
  }
}

function useEmbedColorModeSync() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Listen for postMessage from parent docs page on theme change
    function handleMessage(event: MessageEvent) {
      if (
        event.data &&
        event.data.type === 'SMALL_UI_COLOR_MODE' &&
        (event.data.mode === 'dark' || event.data.mode === 'light')
      ) {
        setColorScheme(event.data.mode);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
}

export default function RootLayout() {
  useEmbedColorModeSync();

  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="showcase" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SafeAreaProvider>
  );
}
