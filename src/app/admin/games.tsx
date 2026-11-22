import StatCard from "@/components/ui/StatCard";
import { useAuth } from "@/context/AuthContext";
import GameAdminForm from "@/features/games/GameAdminForm";
import FeatureNotice from "@/features/shared/FeatureNotice";
import ManagementList, { type RecordItem } from "@/features/shared/ManagementList";
import { GameService } from "@/services/game.service";
import { GameStatus, type Game } from "@/types/game";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const GAME_STATUSES = Object.values(GameStatus);

function gameToRecord(g: Game): RecordItem {
  return {
    id: g.id,
    title: g.title,
    subtitle: `${g.totalNumbers} numbers · ${g.reservationMinutes}-min reservation`,
    status: g.status,
    detail: `Game ID: ${g.id}`,
  };
}

export default function AdminGames() {
  const { user } = useAuth();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [form, setForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const notify = (title: string, msg: string) =>
    Platform.OS === "web"
      ? window.alert(`${title}\n${msg}`)
      : Alert.alert(title, msg);

  const load = async () => {
    setLoading(true);
    try {
      const list = await GameService.getAll();
      setGames(list);
      setRecords(list.map(gameToRecord));
    } catch {
      // Backend unavailable – keep empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async (g: {
    title: string;
    totalNumbers: number;
    reservationMinutes: number;
    winnerCount: number;
    numberPrice: number;
    prizeDistribution: {
      first: number;
      second: number;
      third: number;
      fourth: number;
      system: number;
    };
  }) => {
    if (!user?.id) {
      notify("Error", "You must be logged in as admin to create a game.");
      return;
    }

    setSaving(true);
    try {
      const created = await GameService.create({
        title: g.title,
        totalNumbers: g.totalNumbers,
        reservationMinutes: g.reservationMinutes,
        createdBy: user.id,
      });
      setGames((old) => [created, ...old]);
      setRecords((old) => [gameToRecord(created), ...old]);
      setForm(false);
      notify(
        "Game created",
        `"${created.title}" has been created and is now ${GameStatus.PENDING}.`,
      );
    } catch (e: any) {
      notify(
        "Create failed",
        e?.response?.data?.message ?? "Could not create the game. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAction = (record: RecordItem) => {
    const game = games.find((g) => g.id === record.id);
    if (!game) return;
    setSelectedGame(game);
  };

  const handleChangeStatus = async (newStatus: GameStatus) => {
    if (!selectedGame || selectedGame.status === newStatus) {
      setSelectedGame(null);
      return;
    }

    setUpdatingStatus(true);
    try {
      const res: any = await GameService.updateStatus(selectedGame.id, newStatus);
      const payload = res?.data ?? res;
      const updatedGame: Game = {
        ...selectedGame,
        ...(typeof payload === "object" && payload?.id ? payload : {}),
        status: newStatus,
      };


      setGames((old) =>
        old.map((g) => (g.id === selectedGame.id ? updatedGame : g)),
      );
      setRecords((old) =>
        old.map((r) => (r.id === selectedGame.id ? gameToRecord(updatedGame) : r)),
      );

      setSelectedGame(null);
      notify("Status updated", `"${updatedGame.title}" is now ${newStatus}.`);
    } catch (e: any) {
      notify(
        "Update failed",
        e?.response?.data?.message ?? "Could not update game status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <ScrollView>
  <View className="flex-row flex-wrap gap-3 m-4">
  <View className="min-w-[46%] flex-1">
    <StatCard
      label="Total Game"
      value={records.length}
      icon={<Ionicons name="game-controller-sharp" size={18} color="#2563EB" />}
    />
  </View>

  <View className="min-w-[46%] flex-1">
    <StatCard
      label="Active"
      value={records.filter((r) => r.status === GameStatus.ACTIVE).length}
      icon={<Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />}
    />
  </View>

  <View className="min-w-[46%] flex-1">
    <StatCard
      label="Completed"
      value={records.filter((r) => r.status === GameStatus.COMPLETED).length}
      icon={<Ionicons name="finger-print" size={18} color="#09f684ff" />}
    />
  </View>
    <View className="min-w-[46%] flex-1">
    <StatCard
      label="Pending"
      value={records.filter((r) => r.status === GameStatus.PENDING).length}
      icon={<Ionicons name="paper-plane" size={18} color="#D97706" />}
    />
  </View>

</View>
    
      <ManagementList
        title="Manage games"
        subtitle="Create games and configure numbers, reservation expiry, winners and prizes."
        records={records}
        actionLabel={form ? "Close form" : "Create game"}
        onAction={() => setForm((v) => !v)}
        onSelect={handleAction}
      >
        {loading ? (
          <FeatureNotice title="Loading games…" body="Fetching games from the backend." />
        ) : null}
        {form ? (
          <GameAdminForm
            onCancel={() => setForm(false)}
            onSave={save}
          />
        ) : null}
      </ManagementList>

      <Modal
        visible={!!selectedGame}
        transparent
        animationType="fade"
        onRequestClose={() => !updatingStatus && setSelectedGame(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-5">
          <View className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <Text className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedGame?.title}
            </Text>
            <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Current status: {selectedGame?.status}
            </Text>

            <Text className="mb-3 mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select new status
            </Text>

            <View className="gap-2">
              {GAME_STATUSES.map((status) => {
                const isCurrent = selectedGame?.status === status;
                return (
                  <Pressable
                    key={status}
                    disabled={updatingStatus || isCurrent}
                    onPress={() => void handleChangeStatus(status)}
                    className={`flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                      isCurrent
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                        : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        isCurrent
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {status}
                    </Text>
                    {isCurrent ? (
                      <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Current
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {updatingStatus ? (
              <View className="mt-4 flex-row items-center justify-center gap-2">
                <ActivityIndicator />
                <Text className="text-sm text-slate-500">Updating status…</Text>
              </View>
            ) : null}

            <Pressable
              disabled={updatingStatus}
              onPress={() => setSelectedGame(null)}
              className="mt-4 items-center rounded-xl border border-slate-200 py-3 dark:border-slate-700"
            >
              <Text className="font-semibold text-slate-600 dark:text-slate-300">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}