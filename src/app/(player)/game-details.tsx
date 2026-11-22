import { TranslatedText as Text } from "@/components/common/TranslatedText";
import AppButton from "@/components/ui/AppButton";
import { useAuth } from "@/context/AuthContext";
import NumberGrid, { type NumberCell } from "@/features/numbers/NumberGrid";
import FeatureNotice from "@/features/shared/FeatureNotice";
import { NumberService } from "@/services/number.service";
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
  const minutes = Number(params.reservationMinutes) || 5;
  const { user } = useAuth();
  const [numbers, setNumbers] = useState<NumberCell[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    NumberService.getByGame(gameId)
      .then((res: any) => {
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];
        if (active) {
          setNumbers(
            list.map((n: any) => {
              const isExpired =
                n.status === "RESERVED" &&
                n.reservedUntil &&
                new Date(n.reservedUntil).getTime() < Date.now();

              return {
                id: n.id,
                number: n.number,
                status: isExpired ? "AVAILABLE" : n.status,
                reservedBy: n.reservedBy ?? null,
              };
            }),
          );
        }
      })
      .catch(() => { })
      .finally(() => {
        if (active) setLoading(false);
      });
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

    if (loading || numbers.length === 0) {
      Alert.alert(
        "Numbers unavailable",
        "Numbers are still loading from the server. Please wait.",
      );
      return;
    }

    if (!user?.id) {
      Alert.alert("Login required", "Please log in again to reserve numbers.");
      return;
    }
    if (!gameId || !minutes) {
      Alert.alert("Error", "Missing game information.");
      return;
    }

    // Find the actual database number records by their database ID (n.id)
    const selectedNumbers = numbers.filter(
      (n) => selected.includes(n.id) && n.status === "AVAILABLE",
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

      // Reserve each selected number directly on the number table.
      const reservedNumbers = [];

      for (const number of selectedNumbers) {
        const reserved = await NumberService.reserve({
          numberId: number.id,
          gameId,
          minutes,
        });

        reservedNumbers.push(reserved);
      }

      // Update the local screen after the backend creates the reservations.
      const reservedIds = new Set(selectedNumbers.map((n) => n.id));

      setNumbers((current) =>
        current.map((n) =>
          reservedIds.has(n.id) ? { ...n, status: "RESERVED" } : n,
        ),
      );

      // Pass the number IDs to the payment screen.
      const selectedNumberValues = selectedNumbers
        .map((n) => n.number)
        .join(",");
      router.push({
        pathname: "/(player)/payments",
        params: {
          reservationIds: reservedNumbers.map((r) => r.id).join(","),
          gameId: String(gameId),
          numbers: selectedNumberValues,
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
      {loading ? (
        <View className="mt-4">
          <FeatureNotice
            title="Loading numbers..."
            body="Fetching live number inventory and availability from the server."
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
          currentUserId={user?.id}
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
