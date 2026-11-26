import HamburgerButton from "@/components/common/HamburgerButton";
import PublicHeader from "@/components/common/PublicHeader";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
import AdminSidebar from "@/components/layout/AdminSidebar";
import PlayerSidebar from "@/components/layout/PlayerSidebar";
import BottonNavigation from "./BottomNavigation";
import { useAuth } from "@/context/AuthContext";
import { PaymentService } from "@/services/payment.service";
import { NotificationService } from "@/services/notification.service";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = { role: "player" | "admin"; children: ReactNode };

export default function DashboardShell({ role, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const title = role === "admin" ? "Game Admin" : "Game";

  useEffect(() => {
    if (role === "admin") {
      PaymentService.getAll()
        .then((list) => {
          const pending = list.filter(
            (p) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW"
          ).length;
          setUnreadCount(pending);
        })
        .catch(() => {});
    } else {
      NotificationService.getUnreadCount()
        .then((res) => setUnreadCount(res.unreadCount))
        .catch(() => {});
    }
  }, [role]);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-hidden border-2 rounded-xl border-green-500 border-spacing-7"
    >
      <View className="z-20 flex-row items-center justify-between border-b border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
        <View className="flex-row items-center gap-2">
          <HamburgerButton onPress={() => setMenuOpen(true)} />
          <View className="max-w-28">
            <Text
              numberOfLines={1}
              className="text-base font-bold text-slate-900 dark:text-white"
            >
              {title}
            </Text>
            <Text
              numberOfLines={1}
              className="text-xs text-slate-500 dark:text-slate-400"
            >
              {user?.name ||
                (role === "admin"
                  ? "Management workspace"
                  : "Player workspace")}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1">
          <PublicHeader compact />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() =>
              router.push(
                role === "admin"
                  ? "/admin/notifications"
                  : "/(player)/notifications",
              )
            }
            className="relative rounded-xl p-2"
          >
            <Bell size={20} color="#64748b" />
            {unreadCount > 0 ? (
              <View className="absolute right-1 top-1 h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1">
                <Text className="text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>
      <View className="flex-1">{children}</View>
      {role === "admin" ? (
        <AdminSidebar visible={menuOpen} onClose={() => setMenuOpen(false)} />
      ) : (
        <PlayerSidebar visible={menuOpen} onClose={() => setMenuOpen(false)} />
      )}
      <BottonNavigation/>
    </View>
  );
}
