import { TranslatedText as Text } from "@/components/common/TranslatedText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { router, usePathname } from "expo-router";
import {
  Activity,
  Bell,
  CreditCard,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Settings,
  Ticket,
  Trophy,
  UserRound,
  X,
} from "lucide-react-native";
import { Modal, Pressable, ScrollView, View } from "react-native";
import SidebarMenu, { type SidebarItem } from "../common/SidebarMenu";

type Props = { visible: boolean; onClose: () => void };

export default function PlayerSidebar({ visible, onClose }: Props) {
  const path = usePathname();
  const { logout } = useAuth();

  if (!visible) return null;

  const go = (route: string) => {
    onClose();
    router.push(route as never);
  };

  const items: SidebarItem[] = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      active: path.endsWith("/dashboard") || path.endsWith("/home"),
      onPress: () => go("/(player)/dashboard"),
    },
    {
      label: "Browse Games",
      icon: Gamepad2,
      active: path.endsWith("/games"),
      onPress: () => go("/(player)/games"),
    },
    {
      label: "My Reservations",
      icon: Ticket,
      active: path.endsWith("/reservations") || path.endsWith("/ticket"),
      onPress: () => go("/(player)/reservations"),
    },
    {
      label: "Payments",
      icon: CreditCard,
      active: path.endsWith("/payments"),
      onPress: () => go("/(player)/payments"),
    },

    {
      label: "Settings",
      icon: Settings,
      active: path.endsWith("/settings"),
      onPress: () => go("/(player)/settings"),
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Full-screen row: Drawer on left, clickable dark backdrop filling remaining right side */}
      <View className="flex-1 flex-row bg-black/50">
        {/* Drawer Panel */}
        <SafeAreaView
          edges={["top", "bottom"]}
          className="h-full w-80 max-w-[82%] border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
        >
          <View className="flex-1 px-5 pt-4 pb-3">
            {/* Pinned Top Header */}
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">
                  Game Player
                </Text>
                <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Player workspace
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800"
              >
                <X size={20} color="#64748b" />
              </Pressable>
            </View>

            {/* Scrollable Menu Area (flex-1 bounds height so all 12 items scroll smoothly) */}
            <ScrollView
              className="flex-1"
              contentContainerClassName="pb-4"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              <SidebarMenu items={items} />

              <View className="mt-5 rounded-xl bg-blue-50 p-3 dark:bg-blue-950">
                <Activity size={18} color="#2563eb" />
                <Text className="mt-2 text-sm font-semibold text-blue-900 dark:text-blue-200">
                  All modules
                </Text>
                <Text className="mt-1 text-xs leading-5 text-blue-800 dark:text-blue-300">
                  Add here to new feature
                </Text>
              </View>
            </ScrollView>

            {/* Pinned Bottom Logout Button */}
            <View className="border-t border-slate-100 pt-3 dark:border-slate-800">
              <Pressable
                onPress={() => {
                  onClose();
                  logout();
                  router.replace("/auth/login");
                }}
                className="flex-row items-center gap-3 rounded-xl border border-slate-200 p-3 active:bg-red-50 dark:border-slate-700 dark:active:bg-red-950/30"
              >
                <LogOut size={18} color="#ef4444" />
                <Text className="font-semibold text-red-500">Log out</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>

        {/* Right-side Backdrop: fills the remaining screen width and closes on tap */}
        <Pressable onPress={onClose} className="flex-1" />
      </View>
    </Modal>
  );
}
