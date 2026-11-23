import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { router } from "expo-router";
import Screen from "@/components/ui/Screen";
import StatCard from "@/components/ui/StatCard";
import AppButton from "@/components/ui/AppButton";
import StatusPill from "@/components/ui/StatusPill";
import { NotificationService } from "@/services/notification.service";
import type { AppNotification } from "@/types/notification";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
import { Bell, Check, CheckCheck, RefreshCw, Trophy, Wallet, Ticket, Info } from "lucide-react-native";

export default function PlayerNotificationsScreen() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "WIN" | "PAYMENT" | "UNREAD">("ALL");

  const notify = (title: string, msg: string) =>
    Platform.OS === "web"
      ? window.alert(`${title}\n${msg}`)
      : Alert.alert(title, msg);

  const loadNotifications = async () => {
    try {
      const data = await NotificationService.getMine();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("Failed to load notifications:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadNotifications();
  };

  const handleMarkRead = async (id: number) => {
    try {
      await NotificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      notify("Updated", "All notifications marked as read.");
    } catch (e: any) {
      notify("Error", "Could not mark all as read.");
    }
  };

  // Counts
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const winCount = notifications.filter((n) => n.type === "WIN").length;

  // Filtered list
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "WIN") return n.type === "WIN";
    if (activeFilter === "PAYMENT") return n.type === "PAYMENT";
    if (activeFilter === "UNREAD") return !n.isRead;
    return true;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case "WIN":
        return <Trophy size={20} color="#eab308" />;
      case "PAYMENT":
        return <Wallet size={20} color="#2563eb" />;
      case "RESERVATION":
        return <Ticket size={20} color="#16a34a" />;
      default:
        return <Info size={20} color="#64748b" />;
    }
  };

  return (
    <Screen
      title="Notifications"
      subtitle="Real-time updates on your draw winnings, payment verifications, and game announcements."
    >
      {/* Top Stat Overview */}
      <View className="mb-4 flex-row gap-3">
        <StatCard label="Total" value={notifications.length} icon="🔔" />
        <StatCard label="Unread" value={unreadCount} icon="📫" />
        <StatCard label="Wins" value={winCount} icon="🏆" />
      </View>

      {/* Action Bar & Filters */}
      <View className="mb-4 flex-row flex-wrap items-center justify-between gap-2">
        <View className="flex-row flex-wrap gap-2">
          {(["ALL", "WIN", "PAYMENT", "UNREAD"] as const).map((filterKey) => (
            <Pressable
              key={filterKey}
              onPress={() => setActiveFilter(filterKey)}
              className={`rounded-xl px-3 py-2 ${
                activeFilter === filterKey
                  ? "bg-blue-600"
                  : "bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  activeFilter === filterKey
                    ? "text-white"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {filterKey === "ALL"
                  ? "All"
                  : filterKey === "WIN"
                  ? `Wins (${winCount})`
                  : filterKey === "PAYMENT"
                  ? "Payments"
                  : `Unread (${unreadCount})`}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row gap-2">
          {unreadCount > 0 && (
            <Pressable
              onPress={handleMarkAllRead}
              className="flex-row items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <CheckCheck size={14} color="#64748b" />
              <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mark all read
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleRefresh}
            className="rounded-xl border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <RefreshCw size={16} color="#64748b" />
          </Pressable>
        </View>
      </View>

      {/* Notifications List */}
      {loading ? (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-3 text-sm text-slate-500">Loading your notifications...</Text>
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View className="items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-12 px-6 dark:border-slate-800 dark:bg-slate-900">
          <Bell size={40} color="#94a3b8" />
          <Text className="mt-3 text-base font-bold text-slate-900 dark:text-white">
            {activeFilter === "WIN"
              ? "No win notifications yet"
              : activeFilter === "UNREAD"
              ? "All caught up! No unread notifications"
              : "No notifications yet"}
          </Text>
          <Text className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
            {activeFilter === "WIN"
              ? "When your lucky numbers win in official draws, celebration alerts will appear here."
              : "Updates regarding your reservations, payment confirmations, and draws will appear here in real time."}
          </Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          className="space-y-3"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {filteredNotifications.map((item) => {
            const isWin = item.type === "WIN";

            return (
              <View
                key={item.id}
                className={`mb-3 rounded-2xl p-4 transition-all ${
                  isWin
                    ? "border-2 border-amber-400 bg-amber-50/60 dark:border-amber-500/80 dark:bg-amber-950/30"
                    : item.isRead
                    ? "border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    : "border-2 border-blue-400 bg-blue-50/40 dark:border-blue-600 dark:bg-blue-950/20"
                }`}
              >
                {/* Header Row */}
                <View className="flex-row items-center justify-between gap-2">
                  <View className="flex-row items-center gap-2 flex-1">
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-xl ${
                        isWin
                          ? "bg-amber-100 dark:bg-amber-900/60"
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}
                    >
                      {getIconForType(item.type)}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-base font-bold ${
                          isWin
                            ? "text-amber-900 dark:text-amber-300"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {item.title}
                      </Text>
                      <Text className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {/* Read / Unread Status */}
                  <View className="flex-row items-center gap-2">
                    <StatusPill status={item.isRead ? "READ" : "UNREAD"} />
                    {!item.isRead && (
                      <Pressable
                        onPress={() => handleMarkRead(item.id)}
                        className="rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/60"
                        accessibilityLabel="Mark as read"
                      >
                        <Check size={14} color="#2563eb" />
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Message Body */}
                <Text
                  className={`mt-3 text-sm leading-5 ${
                    isWin
                      ? "font-medium text-amber-950 dark:text-amber-100"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {item.message}
                </Text>

                {/* Special Winner Action Bar */}
                {isWin && item.metadata?.prizeAmount && (
                  <View className="mt-3 flex-row items-center justify-between rounded-xl bg-amber-100/80 px-3 py-2 dark:bg-amber-900/40">
                    <Text className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Prize Reward: {item.metadata.prizeAmount} ETB
                    </Text>
                    <Pressable
                      onPress={() => router.push("/(player)/history")}
                      className="rounded-lg bg-amber-500 px-2.5 py-1"
                    >
                      <Text className="text-xs font-extrabold text-slate-900">
                        View Draw Results
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}
