import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import HamburgerButton from '@/components/common/HamburgerButton';
import PublicHeader from '@/components/common/PublicHeader';
import PlayerSidebar from '@/components/layout/PlayerSidebar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { TranslatedText as Text } from '@/components/common/TranslatedText';
import { useAuth } from '@/context/AuthContext';

type Props = { role: 'player' | 'admin'; children: ReactNode };

export default function DashboardShell({ role, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const title = role === 'admin' ? 'Bingo Admin' : 'Bingo';

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="z-20 flex-row items-center justify-between border-b border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
        <View className="flex-row items-center gap-2">
          <HamburgerButton onPress={() => setMenuOpen(true)} />
          <View className="max-w-28">
            <Text numberOfLines={1} className="text-base font-bold text-slate-900 dark:text-white">{title}</Text>
            <Text numberOfLines={1} className="text-xs text-slate-500 dark:text-slate-400">{user?.name || (role === 'admin' ? 'Management workspace' : 'Player workspace')}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1">
          <PublicHeader compact />
          <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => router.push(role === 'admin' ? '/(admin)/notifications' : '/(player)/notifications')} className="rounded-xl p-2">
            <Bell size={20} color="#64748b" />
          </Pressable>

        </View>
      </View>
      <View className="flex-1">{children}</View>
      {role === 'admin'
        ? <AdminSidebar visible={menuOpen} onClose={() => setMenuOpen(false)} />
        : <PlayerSidebar visible={menuOpen} onClose={() => setMenuOpen(false)} />}
    </View>
  );
}
