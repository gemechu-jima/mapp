import { Redirect, Stack, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import DashboardShell from '@/components/common/DashboardShell';
import { useAuth } from '@/context/AuthContext';

export default function PlayerLayout() {
   const { user, isLoading } = useAuth();
    if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }
    if (!user) {
    return <Redirect href="/auth/login" />;
  }
  return (
    <DashboardShell role="player">
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="home" />
        <Stack.Screen name="games" />
        <Stack.Screen name="game-details" />
        <Stack.Screen name="reservations" />
        <Stack.Screen name="ticket" />
        <Stack.Screen name="payments" />
        <Stack.Screen name="results" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="settings" />
      </Stack>

    </DashboardShell>
  );
}
