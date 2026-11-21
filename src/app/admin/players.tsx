import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { MoreVertical } from "lucide-react-native";
import Screen from "@/components/ui/Screen";
import StatCard from "@/components/ui/StatCard";
import StatusPill from "@/components/ui/StatusPill";
import FeatureNotice from "@/features/shared/FeatureNotice";
import { UserService } from "@/services/user.service";
import { type User } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";

export default function AdminPlayers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Three-dot menu & edit modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const notify = (msg: string) =>
    Platform.OS === "web" ? window.alert(msg) : Alert.alert("Players", msg);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await UserService.list();
      const list: User[] = Array.isArray(data)
        ? data
        : ((data as any)?.users ?? (data as any)?.data ?? []);

      setUsers(list);
    } catch (err: any) {
      console.error("Failed to fetch players:", err);
      setError(
        err?.response?.data?.message || "Could not load players from server.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const players = users.filter((u) => u.role !== "ADMIN");
  const activeCount = players.filter((u) => u.isActivated).length;
  const pendingCount = players.filter((u) => !u.isActivated).length;

  const openActionMenu = (player: User) => {
    setSelectedUser(player);
    setMenuOpen(true);
  };

  const openEditModal = () => {
    if (!selectedUser) return;
    setMenuOpen(false);
    setEditFirstName(selectedUser.firstName || "");
    setEditLastName(selectedUser.lastName || "");
    setEditPhone(selectedUser.phoneNumber || "");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    if (!editFirstName.trim() || !editLastName.trim()) {
      notify("First name and last name are required.");
      return;
    }
    const validPhone = /^(?:0\d{9}|251\d{9})$/;
    if (!validPhone.test(editPhone.trim())) {
      notify(
        "Enter a valid phone number (10 digits starting with 0, or 12 digits starting with 251).",
      );
      return;
    }

    try {
      setSaving(true);
      await UserService.updateByAdmin(selectedUser.id, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        phoneNumber: editPhone.trim(),
      });
      setEditModalOpen(false);
      await fetchUsers();
      notify("Player details updated.");
    } catch (err: any) {
      notify(err?.response?.data?.message || "Failed to update player.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActivation = async () => {
    if (!selectedUser) return;
    setMenuOpen(false);
    try {
      await UserService.toggleActivation(
        selectedUser.id,
        !selectedUser.isActivated,
      );
      await fetchUsers();
    } catch (err: any) {
      notify(
        err?.response?.data?.message || "Failed to update activation status.",
      );
    }
  };

  const confirmDeleteUser = () => {
    if (!selectedUser) return;
    const target = selectedUser;
    setMenuOpen(false);

    const runDelete = async () => {
      try {
        await UserService.deleteUser(target.id);
        setUsers((prev) => prev.filter((u) => u.id !== target.id));
      } catch (err: any) {
        notify(err?.response?.data?.message || "Failed to delete player.");
      }
    };

    if (Platform.OS === "web") {
      if (
        window.confirm(`Delete player ${target.firstName} ${target.lastName}?`)
      ) {
        runDelete();
      }
    } else {
      Alert.alert(
        "Delete Player",
        `Are you sure you want to delete ${target.firstName} ${target.lastName}?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: runDelete },
        ],
      );
    }
  };

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
    <Screen
      title="Players & Activation Codes"
      subtitle="Manage player accounts and share activation codes via the three-dot menu."
    >
      {/* Summary Stats */}
<View className="mb-4 flex-row gap-3">
        <View className="flex-1">
          <StatCard
            label="Total Players"
            value={players.length}
            icon={<Ionicons name="people-outline" size={18} color="#2563EB" />}
          />
        </View>
        <View className="flex-1">
          <StatCard
            label="Activated"
            value={activeCount}
            icon={<Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />}
          />
        </View>
        <View className="flex-1">
          <StatCard
            label="Pending Code"
            value={pendingCount}
            icon={<Ionicons name="key-outline" size={18} color="#D97706" />}
          />
        </View>
      </View>

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

      {/* Players Table */}
      <View className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View className="min-w-[640px]">
            {/* Table Header */}
            <View className="flex-row border-b border-slate-200 bg-slate-100 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/80">
              <Text className="w-40 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Player Name
              </Text>
              <Text className="w-32 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Phone
              </Text>
              <Text className="w-28 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Code
              </Text>
              <Text className="w-28 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Status
              </Text>
              <Text className="w-24 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Joined
              </Text>
              <Text className="w-16 text-right text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                Action
              </Text>
            </View>

            {/* Table Rows */}
            {players.length === 0 ? (
              <View className="p-6">
                <Text className="text-sm text-slate-500 dark:text-slate-400">
                  No registered players found.
                </Text>
              </View>
            ) : (
              players.map((player) => {
                const fullName =
                  `${player.firstName || ""} ${player.lastName || ""}`.trim() ||
                  "Player";
                const joinedDate = player.createdAt
                  ? new Date(player.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "-";

                return (
                  <View
                    key={player.id}
                    className="flex-row items-center border-b border-slate-100 px-4 py-3.5 dark:border-slate-800"
                  >
                    <Text
                      numberOfLines={1}
                      className="w-40 pr-2 font-semibold text-slate-900 dark:text-white"
                    >
                      {fullName}
                    </Text>

                    <Text className="w-32 text-sm text-slate-600 dark:text-slate-300">
                      {player.phoneNumber}
                    </Text>

                    <View className="w-28">
                      <Text className="self-start rounded-md bg-amber-50 px-2 py-1 font-mono text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        {player.activationCode || "N/A"}
                      </Text>
                    </View>

                    <View className="w-28">
                      <StatusPill
                        status={player.isActivated ? "ACTIVE" : "PENDING"}
                      />
                    </View>

                    <Text className="w-24 text-xs text-slate-500 dark:text-slate-400">
                      {joinedDate}
                    </Text>

                    <View className="w-16 items-end">
                      <Pressable
                        onPress={() => openActionMenu(player)}
                        hitSlop={10}
                        className="rounded-lg p-2 active:bg-slate-100 dark:active:bg-slate-800"
                      >
                        <MoreVertical size={18} color="#64748B" />
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      <FeatureNotice
        title="First-time activation workflow"
        body="Click the three-dot icon (⋮) on any player row to edit details, activate/deactivate, or remove an account."
      />

      {/* Three-Dot Action Menu Modal */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          onPress={() => setMenuOpen(false)}
          className="flex-1 items-center justify-center bg-black/50 px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-4 dark:bg-slate-900"
          >
            <Text className="mb-1 text-base font-bold text-slate-900 dark:text-white">
              {selectedUser?.firstName} {selectedUser?.lastName}
            </Text>
            <Text className="mb-3 text-xs text-slate-500">
              {selectedUser?.phoneNumber} · Code:{" "}
              {selectedUser?.activationCode || "N/A"}
            </Text>

            <Pressable
              onPress={openEditModal}
              className="rounded-xl px-3 py-3 active:bg-slate-100 dark:active:bg-slate-800"
            >
              <Text className="font-medium text-slate-800 dark:text-slate-200">
                ✏️ Edit Player Details
              </Text>
            </Pressable>

            <Pressable
              onPress={handleToggleActivation}
              className="rounded-xl px-3 py-3 active:bg-slate-100 dark:active:bg-slate-800"
            >
              <Text className="font-medium text-blue-600 dark:text-blue-400">
                {selectedUser?.isActivated
                  ? "⏸ Deactivate Account"
                  : "✅ Activate Account"}
              </Text>
            </Pressable>

            <Pressable
              onPress={confirmDeleteUser}
              className="rounded-xl px-3 py-3 active:bg-red-50 dark:active:bg-red-950/30"
            >
              <Text className="font-medium text-red-600 dark:text-red-400">
                🗑 Delete Player
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMenuOpen(false)}
              className="mt-2 rounded-xl border border-slate-200 py-2.5 dark:border-slate-700"
            >
              <Text className="text-center font-semibold text-slate-600 dark:text-slate-300">
                Close
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Player Modal */}
      <Modal
        visible={editModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalOpen(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-slate-900">
            <Text className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
              Edit Player
            </Text>

            <Text className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              First Name
            </Text>
            <TextInput
              value={editFirstName}
              onChangeText={setEditFirstName}
              className="mb-3 rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 dark:border-slate-700 dark:text-white"
            />

            <Text className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              Last Name
            </Text>
            <TextInput
              value={editLastName}
              onChangeText={setEditLastName}
              className="mb-3 rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 dark:border-slate-700 dark:text-white"
            />

            <Text className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              Phone Number
            </Text>
            <TextInput
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
              className="mb-4 rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 dark:border-slate-700 dark:text-white"
            />

            <View className="flex-row justify-end gap-2">
              <Pressable
                onPress={() => setEditModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 dark:border-slate-700"
              >
                <Text className="font-semibold text-slate-700 dark:text-slate-300">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSaveEdit}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-4 py-2.5"
              >
                <Text className="font-bold text-white">
                  {saving ? "Saving..." : "Save Changes"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
