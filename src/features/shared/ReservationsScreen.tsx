import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Screen from "@/components/ui/Screen";
import AppButton from "@/components/ui/AppButton";
import StatCard from "@/components/ui/StatCard";
import FeatureNotice from "@/features/shared/FeatureNotice";
import Search, { useSearch } from "@/features/shared/Search";
import ReservationCard, {
  type ReservationRowItem,
} from "@/features/reservations/ReservationCard";
import { ReservationService } from "@/services/reservation.service";
import { useAuth } from "@/context/AuthContext";
import { TranslatedText as Text } from "@/components/common/TranslatedText";

type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

type NormalizedReservation = {
  id: number;
  gameId: number;
  game: string;
  number: number;
  status: ReservationStatus | string;
  expiresAt?: string;
  createdAt?: string;
  displayName: string;
  userId: number;
};

export type SharedReservationsProps = {
  mode?: "player" | "admin";
};

const STATUS_FILTERS = ["ALL", "PENDING", "CONFIRMED", "EXPIRED", "CANCELLED"];

function normalizeReservation(r: any): NormalizedReservation {
  const fullName = r.user
    ? `${r.user.firstName ?? ""} ${r.user.lastName ?? ""}`.trim()
    : "";

  return {
    id: r.id,
    gameId: r.gameId,
    game: r.gameTitle || r.game?.title || `Game #${r.gameId}`,
    number: r.number?.number ?? r.numberId,
    status: r.status,
    expiresAt: r.expiresAt,
    createdAt: r.createdAt,
    displayName:
      r.user?.displayName || r.user?.name || fullName || `User #${r.userId}`,
    userId: r.userId,
  };
}

export default function ReservationsScreen({
  mode = "player",
}: SharedReservationsProps) {
  const isAdmin = mode === "admin";
  const { user } = useAuth();
  const userId = user ? user.id : "";

  const [items, setItems] = useState<NormalizedReservation[]>([]);
  const [view, setView] = useState<"MINE" | "ALL">(isAdmin ? "ALL" : "MINE");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const loadReservations = useCallback(async () => {
    setLoading(true);
    try {
      const response: any =
        !isAdmin && view === "MINE"
          ? await ReservationService.getByUser(userId)
          : await ReservationService.getAll();

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setItems(list.map(normalizeReservation));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, view, userId]);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  const {
    query,
    setQuery,
    filteredItems: searchedItems,
  } = useSearch(items, (r) => [
    r.id,
    r.number,
    r.game,
    r.displayName,
    r.status,
  ]);

  const filtered = useMemo(() => {
    const base = isAdmin ? searchedItems : items;
    return base.filter(
      (x) =>
        (isAdmin || view === "ALL" || x.userId === Number(user?.id)) &&
        (filter === "ALL" || x.status === filter),
    );
  }, [isAdmin, searchedItems, items, view, user?.id, filter]);

  const notify = (title: string, msg: string) =>
    Platform.OS === "web"
      ? window.alert(`${title}\n${msg}`)
      : Alert.alert(title, msg);

  const cancel = async (itemId: number) => {
    const apply = async () => {
      try {
        await ReservationService.cancel(itemId);
        setItems((old) =>
          old.map((r) =>
            r.id === itemId && r.status === "PENDING"
              ? { ...r, status: "CANCELLED" }
              : r,
          ),
        );
        notify("Reservation cancelled", "The number has been released.");
      } catch (e: any) {
        notify(
          "Cancel failed",
          e?.response?.data?.message ?? "Could not cancel the reservation.",
        );
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Cancel this pending reservation?")) await apply();
    } else {
      Alert.alert("Cancel reservation", "Cancel this pending reservation?", [
        { text: "Keep", style: "cancel" },
        { text: "Cancel", style: "destructive", onPress: () => void apply() },
      ]);
    }
  };

  const tableRows: ReservationRowItem[] = filtered.map((r) => ({
    id: r.id,
    game: r.game,
    number: r.number,
    status: r.status,
    expiresAt: r.expiresAt,
    displayName: r.displayName,
    canPay: !isAdmin && r.status === "PENDING" && view === "MINE",
    canCancel: !isAdmin && r.status === "PENDING" && view === "MINE",
  }));

  return (
    <Screen
      title={isAdmin ? "Reservation management" : "Reservations"}
      subtitle={
        isAdmin
          ? "Review pending reservations, expiry, cancellations and confirmed numbers."
          : "View your reservations or browse public reservation statuses."
      }
    >
      {isAdmin ? (
        <>
          {/* Admin Top Stats */}
          <View className="mb-4 flex-row flex-wrap gap-3">
            <StatCard
              label="Pending"
              value={items.filter((r) => r.status === "PENDING").length}
              icon={<Ionicons name="color-wand-outline" size={18} color="#2563EB" />}
            />
            <StatCard
              label="Confirmed"
              value={items.filter((r) => r.status === "CONFIRMED").length}
              icon={<Ionicons name="checkmark-circle-sharp" size={18} color="#2563EB" />}
            />
            <StatCard
              label="Expired"
              value={items.filter((r) => r.status === "EXPIRED").length}
              icon={<Ionicons name="close-circle-outline" size={18} color="#2563EB" />}
            />
          </View>

          {/* Admin Search */}
          <Search
            value={query}
            onChangeText={setQuery}
            placeholder="Search reservations by game, player, number, or status…"
            resultCount={filtered.length}
            className="mb-4"
          />

          <View className="mb-4">
            <AppButton title="Refresh" onPress={() => void loadReservations()} />
          </View>
        </>
      ) : (
        /* Player View Toggle */
        <View className="mb-4 flex-row gap-2">
          <View className="flex-1">
            <AppButton
              title="My reservations"
              variant={view === "MINE" ? "primary" : "secondary"}
              onPress={() => setView("MINE")}
            />
          </View>
          <View className="flex-1">
            <AppButton
              title="All reservations"
              variant={view === "ALL" ? "primary" : "secondary"}
              onPress={() => setView("ALL")}
            />
          </View>
        </View>
      )}

      {/* Status Filter Pills */}
      <View className="mb-4 flex-row flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <Pressable
            key={s}
            onPress={() => setFilter(s)}
            className={`rounded-full px-3 py-2 ${
              filter === s ? "bg-blue-600" : "bg-white dark:bg-slate-900"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                filter === s
                  ? "text-white"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {s === "ALL" ? "All" : s}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Shared Reservation Table & Detail Modal */}
      {loading ? (
        <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 dark:border-slate-700 dark:bg-slate-900">
          <Text className="text-slate-500 dark:text-slate-400">
            Loading reservations…
          </Text>
        </View>
      ) : tableRows.length ? (
        <ReservationCard
          items={tableRows}
          showPlayer={isAdmin || view === "ALL"}
          onPay={
            !isAdmin
              ? (r) =>
                  router.push({
                    pathname: "/(player)/payments",
                    params: {
                      reservationId: String(r.id),
                      gameTitle: r.game,
                      number: String(r.number),
                    },
                  })
              : undefined
          }
          onCancel={!isAdmin ? (r) => void cancel(Number(r.id)) : undefined}
        />
      ) : (
        <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 dark:border-slate-700 dark:bg-slate-900">
          <Text className="font-semibold text-slate-700 dark:text-slate-200">
            No reservations match this filter.
          </Text>
        </View>
      )}

      {isAdmin ? (
        <View className="mt-4">
          <FeatureNotice
            title="Expired payment recovery"
            body="Restore an expired reservation only after reviewing proof and checking that the number is still available. Confirmed reservations are locked; mistakes must be reported through the audit workflow."
          />
        </View>
      ) : null}
    </Screen>
  );
}
