import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { ArrowRight, Bell, ChartNoAxesColumn, CreditCard, Dices, Gamepad2, Hash, Settings, Ticket, Users } from 'lucide-react-native';
import StatCard from '@/components/ui/StatCard';

import { TranslatedText as Text } from '@/components/common/TranslatedText';
const actions = [
  { title: 'Manage games', desc: 'Create games and configure prizes', icon: Gamepad2, path: '/(admin)/games' },
  { title: 'Number inventory', desc: 'Check available, reserved and confirmed numbers', icon: Hash, path: '/(admin)/numbers' },
  { title: 'Reservations', desc: 'Review pending and expired reservations', icon: Ticket, path: '/(admin)/reservations' },
  { title: 'Payment verification', desc: 'Review payment screenshots and corrections', icon: CreditCard, path: '/(admin)/payments' },
  { title: 'Draw management', desc: 'Trigger draws and review official results', icon: Dices, path: '/(admin)/draw' },
  { title: 'Players & permissions', desc: 'Manage players and scoped access', icon: Users, path: '/(admin)/players' },
  { title: 'Reports', desc: 'Game and financial summaries', icon: ChartNoAxesColumn, path: '/(admin)/reports' },
  { title: 'Notifications', desc: 'Announcement templates and alerts', icon: Bell, path: '/(admin)/notifications' },
  { title: 'Security & audit', desc: 'Review correction requests and privileged actions', icon: Ticket, path: '/(admin)/security' },
  { title: 'Settings', desc: 'Configure platform defaults', icon: Settings, path: '/(admin)/settings' },
];

export default function AdminDashboard() {
  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerStyle={{ padding: 20, paddingTop: 20, paddingBottom: 40 }}>
      <View className="mb-6">
        <Text className="text-sm text-slate-500 dark:text-slate-400">Management overview</Text>
        <Text className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">Admin dashboard 👋</Text>
        <Text className="mt-2 leading-5 text-slate-500 dark:text-slate-400">Manage the complete Bingo lifecycle from one place. Metrics below are placeholders until the backend is connected.</Text>
      </View>
      <View className="mb-6 flex-row flex-wrap gap-3">
        <StatCard label="Games" value="—" icon="🎱" />
        <StatCard label="Reservations" value="—" icon="🎟️" />
        <StatCard label="Payments to review" value="—" icon="💳" />
        <StatCard label="Published draws" value="—" icon="🏆" />
      </View>
      <Text className="mb-3 text-xl font-bold text-slate-900 dark:text-white">All features</Text>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Pressable key={action.path} onPress={() => router.push(action.path as never)} className="mb-3 flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950"><Icon size={22} color="#2563eb" /></View>
            <View className="flex-1"><Text className="font-bold text-slate-900 dark:text-white">{action.title}</Text><Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">{action.desc}</Text></View>
            <ArrowRight size={19} color="#94a3b8" />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}