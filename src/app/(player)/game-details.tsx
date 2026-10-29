import { TranslatedText as Text } from "@/components/common/TranslatedText";
import AppButton from "@/components/ui/AppButton";
import { useAuth } from "@/context/AuthContext";
import NumberGrid, { type NumberCell } from "@/features/numbers/NumberGrid";
import FeatureNotice from "@/features/shared/FeatureNotice";
import { NumberService } from "@/services/number.service";
import { ReservationService } from "@/services/reservation.service";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Clock3, Hash } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
export default function GameDetailsScreen() {
  const params = useLocalSearchParams<{
    gameId?: string;
    title?: string;
    totalNumbers?: string;
    reservationMinutes?: string;
    status?: string;
  }>();
  const [submitting, setSubmitting] = useState(false);
  const gameId = Number(params.gameId);
  const title = params.title;
  const total = Number(params.totalNumbers);
  const minutes = Number(params.reservationMinutes);
  const { user } = useAuth();
  const userId = user?.id;
  const [numbers, setNumbers] = useState<NumberCell[]>(() =>
    Array.from({ length: total }, (_, i) => ({
      id: i + 1,
      number: i + 1,
      status: (i % 11 === 0
        ? "CONFIRMED"
        : i % 7 === 0
          ? "RESERVED"
          : "AVAILABLE") as NumberCell["status"],
    })),
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [demo, setDemo] = useState(true);
  useEffect(() => {
    let active = true;
    NumberService.getByGame(gameId)
      .then((res: any) => {
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];
        if (active && list.length) {
          setNumbers(
            list.map((n: any) => ({
              id: n.id,
              number: n.number,
              status: n.status,
            })),
          );
          setDemo(false);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [gameId]);
  const available = useMemo(
    () => numbers.filter((n) => n.status === "AVAILABLE").length,
    [numbers],
  );
  const proceed = async () => {
    if (selected.length === 0) {
      Alert.alert("Select numbers", "Please select at least one number.");
      return;
    }
    console.log("test");
    if (demo) {
      Alert.alert(
        "Numbers unavailable",
        "Real reservations require numbers loaded from the backend.",
      );
      return;
    }

    // Replace userId with the ID of the currently logged-in user.
    if (!userId || !gameId || !minutes) {
      Alert.alert("Error", "Missing user or game information.");
      return;
    }

    // Find the actual database number records, not just displayed numbers.
    const selectedNumbers = numbers.filter(
      (n) => selected.includes(n.number) && n.status === "AVAILABLE",
    );

    if (selectedNumbers.length !== selected.length) {
      Alert.alert(
        "Numbers unavailable",
        "Some selected numbers are no longer available. Please refresh and select again.",
      );
      return;
    }

    try {
      setSubmitting(true);

      // Create a database reservation for each selected number.
      const reservations = [];

      for (const number of selectedNumbers) {
        const reservation = await ReservationService.createReservation({
          userId,
          numberId: number.id,
          gameId,
          minutes,
        });

        reservations.push(reservation);
      }

      // Update the local screen after the backend creates the reservations.
      const reservedIds = new Set(selectedNumbers.map((n) => n.id));

      setNumbers((current) =>
        current.map((n) =>
          reservedIds.has(n.id) ? { ...n, status: "RESERVED" } : n,
        ),
      );

      // Pass the real reservation IDs to the payment screen.
      router.push({
        pathname: "/(player)/payments",
        params: {
          reservationIds: reservations.map((r) => r.id).join(","),
          gameId: String(gameId),
          numbers: selected.join(","),
          gameTitle: title ?? "",
        },
      });
    } catch (error: any) {
      console.error("Reservation creation failed:", error);

      Alert.alert(
        "Reservation failed",
        error?.response?.data?.message ??
          "Could not reserve the selected numbers. Please try again.",
      );

      // Refresh from the backend to get the latest number statuses.
      try {
        const res = await NumberService.getByGame(gameId);
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        if (list.length > 0) {
          setNumbers(
            list.map((n: any) => ({
              id: n.id,
              number: n.number,
              status: n.status,
            })),
          );
        }
      } catch (refreshError) {
        console.error("Could not refresh numbers:", refreshError);
      }
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <ScrollView
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      contentContainerStyle={{ padding: 20, paddingTop: 48, paddingBottom: 40 }}
    >
      <Pressable
        onPress={() => router.back()}
        className="mb-5 flex-row items-center self-start rounded-xl bg-white p-3 dark:bg-slate-900"
      >
        <ArrowLeft size={20} color="#64748b" />
        <Text className="ml-2 font-semibold text-slate-700 dark:text-white">
          Back to Games
        </Text>
      </Pressable>
      <Text className="text-2xl font-bold text-slate-900 dark:text-white">
        {title}
      </Text>
      <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Game ID: {gameId} · {params.status || "ACTIVE"}
      </Text>
      <View className="mt-5 flex-row gap-3">
        <View className="flex-1 rounded-2xl bg-white p-4 dark:bg-slate-900">
          <Hash size={22} color="#2563eb" />
          <Text className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {numbers.length}
          </Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Total numbers
          </Text>
        </View>
        <View className="flex-1 rounded-2xl bg-white p-4 dark:bg-slate-900">
          <Clock3 size={22} color="#2563eb" />
          <Text className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {minutes} min
          </Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Reservation time
          </Text>
        </View>
      </View>
      {demo ? (
        <View className="mt-4">
          <FeatureNotice
            title="Sample number inventory"
            body="Showing a demo number board. Real availability and reservation locking must be checked by the backend."
          />
        </View>
      ) : null}
      <View className="mt-5 rounded-2xl bg-white p-5 dark:bg-slate-900">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-slate-900 dark:text-white">
            Choose your numbers
          </Text>
          <Text className="text-xs text-slate-500">{available} available</Text>
        </View>
        <Text className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          You can select multiple available numbers. Reserved and confirmed
          numbers cannot be selected.
        </Text>
        <View className="mb-4 flex-row flex-wrap gap-2">
          {[
            { s: "AVAILABLE", c: "bg-emerald-100", t: "Available" },
            { s: "RESERVED", c: "bg-amber-100", t: "Reserved" },
            { s: "CONFIRMED", c: "bg-blue-100", t: "Confirmed" },
          ].map((x) => (
            <View key={x.s} className={`rounded-full px-3 py-2 ${x.c}`}>
              <Text className="text-xs font-semibold text-slate-800">
                {x.t}
              </Text>
            </View>
          ))}
        </View>
        <NumberGrid
          numbers={numbers}
          selected={selected}
          onToggle={(id) =>
            setSelected((v) =>
              v.includes(id) ? v.filter((x) => x !== id) : [...v, id],
            )
          }
        />
        <View className="mt-5 rounded-xl bg-blue-50 p-4 dark:bg-slate-800">
          <Text className="text-sm text-slate-700 dark:text-slate-200">
            Selected numbers:{" "}
            {selected.length
              ? selected
                  .map((id) => numbers.find((n) => n.id === id)?.number)
                  .join(", ")
              : "None"}
          </Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            A reservation countdown starts after the backend successfully
            reserves your selected numbers.
          </Text>
        </View>
        <View className="mt-4">
          <AppButton
            title={submitting ? "Reserving..." : "Continue to Payment"}
            onPress={proceed}
            disabled={submitting || selected.length === 0}
          />
        </View>
      </View>
    </ScrollView>
  );
}
