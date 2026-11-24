import { Redirect, Stack } from 'expo-router';
import DashboardShell from '@/components/common/DashboardShell';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
export default function AdminLayout() {
   const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }
  if (!user || user.role !== 'ADMIN') {
    return <Redirect href="/auth/login" />;
  }
  return (
    <DashboardShell role="admin">
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="games" />
        <Stack.Screen name="numbers" />
        <Stack.Screen name="reservations" />
        <Stack.Screen name="payments" />
        <Stack.Screen name="draw" />
        <Stack.Screen name="results" />
        <Stack.Screen name="players" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="security" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="profile" />
      </Stack>
    </DashboardShell>
  );
}
