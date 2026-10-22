import { Stack } from 'expo-router';
import DashboardShell from '@/components/common/DashboardShell';

export default function AdminLayout() {
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
      </Stack>
    </DashboardShell>
  );
}
