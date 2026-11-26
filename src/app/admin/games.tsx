import { useEffect, useState } from "react";
import { Alert, Modal, Platform, Pressable, View } from "react-native";
import Screen from "@/components/ui/Screen";
import FeatureNotice from "@/features/shared/FeatureNotice";
import GameAdminForm from "@/features/games/GameAdminForm";
import AppButton from "@/components/ui/AppButton";
import StatusPill from "@/components/ui/StatusPill";
import Search, { useSearch } from "@/features/shared/Search";
import {
  TranslatedText as Text,
  TranslatedTextInput as TextInput,
} from "@/components/common/TranslatedText";
import { GameService } from "@/services/game.service";
import { GameStatus, type Game } from "@/types/game";

// Only valid backend status values (no DRAFT — it doesn't exist in GameStatus enum)
const STATUS_OPTIONS: { value: GameStatus; label: string; desc: string }[] = [
  {
    value: GameStatus.PENDING,
    label: "Pending",
    desc: "Game configured, not yet open",
  },
  {
    value: GameStatus.ACTIVE,
    label: "Active",
    desc: "Open for players to reserve & pay",
  },
  {
    value: GameStatus.DRAWING,
    label: "Drawing",
    desc: "Locked and ready for official draw",
  },
  {
    value: GameStatus.COMPLETED,
    label: "Completed",
    desc: "Draw finished and winners published",
  },
  {
    value: GameStatus.CANCELLED,
    label: "Cancelled",
    desc: "Game closed without drawing",
  },
];

export default function AdminGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(false);

  // Quick Status Modal state (opens on card tap)
  const [statusGame, setStatusGame] = useState<Game | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Three-dot menu & Edit Modal state
  const [menuGameId, setMenuGameId] = useState<number | string | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editMinutes, setEditMinutes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
const { query, setQuery, filteredItems } = useSearch(games, (g) => [
  g.title,
  g.id,
  g.status,
  g.numberPrice,
]);
  const notify = (title: string, msg: string) =>
    Platform.OS === "web"
      ? window.alert(`${title}\n${msg}`)
      : Alert.alert(title, msg);

  const loadGames = () => {
    setLoading(true);
    GameService.getAll()
      .then((list) => setGames(Array.isArray(list) ? list : []))
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGames();
  }, []);

  // Create game handler passed to GameAdminForm
  const save = async (payload: any) => {
    try {
      const created = await GameService.create(payload);
      setGames((prev) => [created, ...prev]);
      setForm(false);
      notify("Game created", `"${created.title}" is now ready.`);
    } catch (e: any) {
      notify(
        "Create failed",
        e?.response?.data?.message ?? "Could not create game.",
      );
    }
  };

  // Select new status from the Status Modal — uses dedicated status-transition endpoints
  const handleSelectStatus = async (newStatus: GameStatus) => {
    if (!statusGame || updatingStatus) return;
    if (statusGame.status === newStatus) {
      setStatusGame(null);
      return;
    }

    try {
      setUpdatingStatus(true);
      // GameService.updateStatus routes to the correct PATCH /:id/active|close|cancel|pending|drawing
      const updated = await GameService.updateStatus(statusGame.id, newStatus);

      setGames((prev) =>
        prev.map((g) =>
          g.id === statusGame.id
            ? { ...g, status: updated?.status ?? newStatus }
            : g,
        ),
      );
      setStatusGame(null);
    } catch (e: any) {
      notify(
        "Status update failed",
        e?.response?.data?.message ?? "Could not update game status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Open edit modal pre-filled with selected game
  const openEditModal = (game: Game) => {
    setMenuGameId(null);
    setEditingGame(game);
    setEditTitle(game.title ?? "");
    setEditPrice(String(game.numberPrice ?? ""));
    setEditMinutes(String(game.reservationMinutes ?? 5));
  };

  // Save edited game fields (title, price, expiry) via PATCH /:id
  const handleUpdateGame = async () => {
    if (!editingGame) return;
    if (!editTitle.trim()) {
      notify("Validation", "Game title is required.");
      return;
    }

    const parsedPrice = Number(editPrice);
    const parsedMinutes = Number(editMinutes);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      notify("Validation", "Ticket price must be greater than 0.");
      return;
    }

    if (!Number.isFinite(parsedMinutes) || parsedMinutes < 1) {
      notify("Validation", "Reservation expiry must be at least 1 minute.");
      return;
    }

    try {
      setSavingEdit(true);
      // updateFull sends PATCH /:id for field updates (title, price, minutes)
      // Status changes are handled separately via dedicated routes
      const updated = await GameService.updateFull(editingGame.id, {
        title: editTitle.trim(),
        numberPrice: parsedPrice,
        reservationMinutes: Math.round(parsedMinutes),
      });

      setGames((prev) =>
        prev.map((g) => (g.id === editingGame.id ? { ...g, ...updated } : g)),
      );
      setEditingGame(null);
      notify("Updated", "Game updated successfully.");
    } catch (e: any) {
      notify(
        "Update failed",
        e?.response?.data?.message ?? "Could not update game.",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete game with confirmation
  const handleDeleteGame = async (game: Game) => {
    setMenuGameId(null);

    const performDelete = async () => {
      try {
        await GameService.deleteGame(game.id);
        setGames((prev) => prev.filter((g) => g.id !== game.id));
        notify("Deleted", `"${game.title}" has been deleted.`);
      } catch (e: any) {
        notify(
          "Delete failed",
          e?.response?.data?.message ?? "Could not delete game.",
        );
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Delete "${game.title}"? This cannot be undone.`)) {
        await performDelete();
      }
    } else {
      Alert.alert(
        "Delete game",
        `Delete "${game.title}"? This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: performDelete },
        ],
      );
    }
  };

  return (
    <Screen
      title="Manage games"
      subtitle="Tap a game to change its status, or tap ⋮ to edit or delete."
    >
        <Search
        value={query}
        onChangeText={setQuery}
        placeholder="Search games by title, ID, or status…"
        resultCount={filteredItems.length}
      />
      {/* Header Action Button */}
      <View className="mb-4 w-32 ">

        <AppButton
          title={form ? "Close form" : "Create game"}
          onPress={() => setForm((v) => !v)}
        />
      </View>

      {form ? (
        <View className="mb-4">
          <GameAdminForm onCancel={() => setForm(false)} onSave={save} />
        </View>
      ) : null}

      {/* Game List */}
      {loading ? (
        <FeatureNotice
          title="Loading games…"
          body="Fetching games from the backend."
        />
      ) : games.length === 0 ? (
        <FeatureNotice
          title="No games yet"
          body="Tap Create game above to launch your first game."
        />
      ) : filteredItems.length === 0 ? (
        <FeatureNotice
          title="No matching games"
          body={`No games matched "${query}".`}
        />
      ) : (
        <View className="gap-3">
          {filteredItems.map((g) => {
            const isMenuOpen = menuGameId === g.id;
            return (
              <View
                key={g.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <View className="flex-row items-start justify-between gap-3">
                  {/* Tapping the card opens the Status Selection Modal */}
                  <Pressable
                    onPress={() => {
                      setMenuGameId(null);
                      setStatusGame(g);
                    }}
                    className="flex-1 active:opacity-75"
                  >
                    <View className="flex-row flex-wrap items-center gap-2">
                      <Text className="text-base font-bold text-slate-900 dark:text-white">
                        {g.title}
                      </Text>
                      <StatusPill status={g.status} />
                    </View>
                    <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      #{g.id} · {g.totalNumbers} numbers · {g.numberPrice}{" "}
                      ETB/ticket · {g.reservationMinutes ?? 5}m expiry
                    </Text>
                  </Pressable>

                  {/* Three-Dot Action Button (Edit / Delete) */}
                  <Pressable
                    onPress={() => setMenuGameId(isMenuOpen ? null : g.id)}
                    hitSlop={10}
                    className="h-8 w-8 items-center justify-center rounded-lg bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
                  >
                    <Text className="text-base font-black text-slate-700 dark:text-slate-200">
                      ⋮
                    </Text>
                  </Pressable>
                </View>

                {/* Expanded Three-Dot Menu Actions */}
                {isMenuOpen ? (
                  <View className="mt-3 flex-row gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <Pressable
                      onPress={() => openEditModal(g)}
                      className="flex-1 items-center rounded-xl bg-blue-50 py-2 active:bg-blue-100 dark:bg-blue-950/60"
                    >
                      <Text className="text-xs font-bold text-blue-700 dark:text-blue-300">
                        ✏️ Edit game
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleDeleteGame(g)}
                      className="flex-1 items-center rounded-xl bg-rose-50 py-2 active:bg-rose-100 dark:bg-rose-950/60"
                    >
                      <Text className="text-xs font-bold text-rose-700 dark:text-rose-300">
                        🗑️ Delete game
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      {/* Status Selection Modal (Opens on Card Click) */}
      <Modal
        visible={Boolean(statusGame)}
        transparent
        animationType="fade"
        onRequestClose={() => !updatingStatus && setStatusGame(null)}
      >
        <Pressable
          onPress={() => !updatingStatus && setStatusGame(null)}
          className="flex-1 items-center justify-center bg-black/60 px-4"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <Text className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
              Change game status
            </Text>
            <Text className="mb-4 text-xs text-slate-500 dark:text-slate-400">
              {statusGame?.title} · Current: {statusGame?.status}
            </Text>

            <View className="mb-4 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const isCurrent = statusGame?.status === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    disabled={updatingStatus}
                    onPress={() => handleSelectStatus(opt.value)}
                    className={`flex-row items-center justify-between rounded-xl border px-3.5 py-3 ${
                      isCurrent
                        ? "border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40"
                        : "border-slate-200 bg-slate-50 active:bg-slate-100 dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    <View className="flex-1 pr-2">
                      <Text className="text-sm font-bold text-slate-900 dark:text-white">
                        {opt.label}
                      </Text>
                      <Text className="text-xs text-slate-500 dark:text-slate-400">
                        {opt.desc}
                      </Text>
                    </View>
                    <StatusPill status={opt.value} />
                  </Pressable>
                );
              })}
            </View>

            <AppButton
              title={updatingStatus ? "Updating…" : "Close"}
              variant="secondary"
              onPress={() => setStatusGame(null)}
              disabled={updatingStatus}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Game Modal (Opens from Three-Dot Menu) */}
      <Modal
        visible={Boolean(editingGame)}
        transparent
        animationType="fade"
        onRequestClose={() => !savingEdit && setEditingGame(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-4">
          <View className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <Text className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
              Edit game
            </Text>
            <Text className="mb-4 text-xs text-slate-500 dark:text-slate-400">
              Update title, ticket price, or reservation expiry.
            </Text>

            <Text className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              Game title
            </Text>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              className="mb-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />

            <View className="mb-4 flex-row gap-3">
              <View className="flex-1">
                <Text className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Ticket price (ETB)
                </Text>
                <TextInput
                  value={editPrice}
                  onChangeText={setEditPrice}
                  keyboardType="numeric"
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </View>

              <View className="flex-1">
                <Text className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Expiry (minutes)
                </Text>
                <TextInput
                  value={editMinutes}
                  onChangeText={setEditMinutes}
                  keyboardType="number-pad"
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </View>
            </View>

            <Text className="mb-2 text-xs text-slate-500 dark:text-slate-400">
              To change game status, close this modal and tap the game card.
            </Text>

            <View className="flex-row gap-2">
              <View className="flex-1">
                <AppButton
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setEditingGame(null)}
                  disabled={savingEdit}
                />
              </View>
              <View className="flex-1">
                <AppButton
                  title={savingEdit ? "Saving…" : "Save changes"}
                  onPress={handleUpdateGame}
                  disabled={savingEdit}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
