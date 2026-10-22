import "../global.css";
import "../i18n";

import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "../context/AuthContext";
import { PreferencesProvider } from "../context/PreferencesContext";

export default function RootLayout() {
  console.log("URL", process.env.EXPO_BASE_URL);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PreferencesProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(player)" />
            <Stack.Screen name="(admin)" />
          </Stack>
        </PreferencesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
