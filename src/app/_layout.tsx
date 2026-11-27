import "../global.css";
import "../i18n";
import 'react-native-url-polyfill/auto';
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { api } from "../services/api";
import { AuthProvider } from "../context/AuthContext";
import { PreferencesProvider } from "../context/PreferencesContext";

export default function RootLayout() {
  // Silently wake up the backend (e.g. Render cold start) as soon as the app opens
  useEffect(() => {
    const baseUrl = api.defaults.baseURL || "";
    const rootUrl = baseUrl.replace(/\/api(\/v1)?\/?$/, "").replace(/\/$/, "");
    if (rootUrl) {
      fetch(`${rootUrl}/health`).catch(() => {});
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PreferencesProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(player)" />
            <Stack.Screen name="admin" />
          </Stack>
        </PreferencesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
