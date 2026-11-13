import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, Pressable, View } from "react-native";
import Screen from "@/components/ui/Screen";
import AppButton from "@/components/ui/AppButton";
import ReservationCard from "@/features/reservations/ReservationCard";
import { ReservationService } from "@/services/reservation.service";
import { useAuth } from "@/context/AuthContext";
import { TranslatedText as Text } from "@/components/common/TranslatedText";

type Item = {
  id: number;
  gameId: number;
  game: string;
  number: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  expiresAt?: string;
  displayName: string;
  userId: number;
};

export default function ReservationsScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [view, setView] = useState<"MINE" | "ALL">("MINE");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const id = user ? user.id : "";

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const response: any =
          view === "MINE"
            ? await ReservationService.getByUser(id)
            : await ReservationService.getAll();
        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];
        if (alive) {
          setItems(
            list.map((r: any) => ({
              id: r.id,
              gameId: r.gameId,
              game: r.gameTitle || r.game?.title || `Game #${r.gameId}`,
              number: r.number?.number ?? r.numberId,
              status: r.status,
              expiresAt: r.expiresAt,
              displayName: r.user?.displayName || r.user?.name || "Player",
              userId: r.userId,
            })),
          );
        }
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [view, user?.id]);

  const filtered = items.filter(
    (x) =>
      (view === "ALL" || x.userId === Number(user?.id)) &&
      (filter === "ALL" || x.status === filter),
  );

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
        { text: "Cancel", style: "destructive", onPress: () => apply() },
      ]);
    }
  };

  return (
    <Screen
      title="Reservations"
      subtitle="View your reservations or browse public reservation statuses."
    >
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

      <View className="mb-4 flex-row flex-wrap gap-2">
        {["ALL", "PENDING", "CONFIRMED", "CANCELLED", "EXPIRED"].map((s) => (
          <Pressable
            key={s}
            onPress={() => setFilter(s)}
            className={`rounded-full px-3 py-2 ${filter === s ? "bg-blue-600" : "bg-white dark:bg-slate-900"}`}
          >
            <Text
              className={`text-xs font-semibold ${filter === s ? "text-white" : "text-slate-700 dark:text-slate-300"}`}
            >
              {s === "ALL" ? "All" : s}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 dark:border-slate-700 dark:bg-slate-900">
          <Text className="text-slate-500 dark:text-slate-400">
            Loading reservations…
          </Text>
        </View>
      ) : filtered.length ? (
        filtered.map((r) => (
          <ReservationCard
            key={r.id}
            id={r.id}
            game={r.game}
            number={r.number}
            status={r.status}
            expiresAt={r.expiresAt}
            onPay={
              r.status === "PENDING"
                ? () =>
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
            onCancel={
              r.status === "PENDING" && view === "MINE"
                ? () => cancel(r.id)
                : undefined
            }
          />
        ))
      ) : (
        <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 dark:border-slate-700 dark:bg-slate-900">
          <Text className="font-semibold text-slate-700 dark:text-slate-200">
            No reservations match this filter.
          </Text>
        </View>
      )}
    </Screen>
  );
}
