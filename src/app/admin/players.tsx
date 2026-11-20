import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import ManagementList, { type RecordItem,} from "@/features/shared/ManagementList";
import FeatureNotice from "@/features/shared/FeatureNotice";
import { UserService } from "@/services/user.service"; // adjust if your axios instance is exported differently
import { type User } from "@/types/user";


export default function AdminPlayers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const data = await UserService.list();
    const list: User[] = Array.isArray(data)
      ? data
      : (data as any)?.users ?? (data as any)?.data ?? [];

    setUsers(list);
  } catch (err: any) {
    console.error("Failed to fetch players:", err);
    setError(
      err?.response?.data?.message || "Could not load players from server."
    );
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter out admins if you only want to list players, or keep all users
  const players = users.filter((u) => u.role !== "ADMIN");
  const activeCount = players.filter((u) => u.isActivated).length;
  const pendingCount = players.filter((u) => !u.isActivated).length;

  const records: RecordItem[] = players.map((user) => {
    const fullName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Player";

    const joinedDate = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "Recently";

    const activationText = user.isActivated
      ? `Activated · Code: ${user.activationCode || "N/A"}`
      : `Activation Code: ${user.activationCode || "Pending"} (Share with user)`;

    return {
      id: Number(user.id),
      title: `${fullName} (${user.phoneNumber})`,
      subtitle: `${user.role} · Joined ${joinedDate}`,
      status: user.isActivated ? "ACTIVE" : "PENDING",
      detail: activationText,
    };
  });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-3 text-sm text-slate-500">
          Loading registered players...
        </Text>
      </View>
    );
  }

  return (
    <ManagementList
      title="Players & Activation Codes"
      subtitle="View registered players and share their unique activation code for first-time login."
      records={records}
      stats={[
        { label: "Total Players", value: players.length, icon: "👥" },
        { label: "Activated", value: activeCount, icon: "🟢" },
        { label: "Pending Code", value: pendingCount, icon: "🔑" },
      ]}
    >
      {error && (
        <View className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/30">
          <Text className="text-sm font-medium text-red-700 dark:text-red-400">
            {error}
          </Text>
          <Pressable
            onPress={fetchUsers}
            className="mt-2 self-start rounded-lg bg-red-600 px-3 py-1.5"
          >
            <Text className="text-xs font-bold text-white">Retry</Text>
          </Pressable>
        </View>
      )}

      <FeatureNotice
        title="First-time activation workflow"
        body="Share the 6-digit Activation Code shown under each PENDING player. Once they log in with that code, their status automatically switches to ACTIVE."
      />
    </ManagementList>
  );
}