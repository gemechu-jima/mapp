import { Stack } from 'expo-router';
import DashboardShell from '@/components/common/DashboardShell';

export default function PlayerLayout() {
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
