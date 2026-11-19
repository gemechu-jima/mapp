import AdvertisementDisplay from "@/components/common/AdvertisementDisplay";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
import { useAuth } from "@/context/AuthContext";
import GameCard from "@/features/games/GameCard";
import { GameService } from "@/services/game.service";
import { ReservationService } from "@/services/reservation.service";
import { GameStatus, type Game } from "@/types/game";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import {banner} from "@/assets/banners/banner"
import ComingSoonDisplay from "@/components/ComingSoonDisplay";
export default function PlayerDashboard() {
  const { user } = useAuth();
  const [myReservationsCount, setMyReservationsCount] = useState<number | null>(null);
  const [myWinsCount, setMyWinsCount] = useState(0);
  const [activeGames, setActiveGames] = useState<Game[]>([]);
  const [filter, setFilter] = useState("ALL");

  const filters = [
    { label: "All", value: "ALL" },
    { label: "Open", value: "ACTIVE" },
    { label: "Starting soon", value: "PENDING" },
  ];

  useEffect(() => {
    // Load my reservations count
    if (user?.id) {
      ReservationService.getByUser(user.id)
        .then((list) => setMyReservationsCount(list.length))
        .catch(() => setMyReservationsCount(0));
    }

    // Load available games
    GameService.getAll()
      .then((list) => {
        const open = list.filter(
          (g) => g.status === GameStatus.ACTIVE || g.status === GameStatus.PENDING,
        );
        setActiveGames(open);
      })
      .catch(() => { });
  }, [user?.id]);

  const displayName = user?.name
    ? user.name.split(" ")[0]
    : "Player";

  const filteredGames =
    filter === "ALL" ? activeGames : activeGames.filter((g) => g.status === filter);

  return (
    <ScrollView
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 28,
      }}
    >
      {/* Welcome header */}
      <View className="mb-6">
        <Text className="text-sm text-slate-500 dark:text-slate-400">
          Welcome back,
        </Text>
        <Text className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
          {displayName} 👋
        </Text>
        <Text className="mt-2 text-slate-500 dark:text-slate-400">
          Find a game and reserve your lucky numbers.
        </Text>
      </View>
<AdvertisementDisplay ads={banner}/>
      {/* Stats */}
      <View className="mb-8 flex-row gap-3">
        <Pressable
          onPress={() => router.push("/(player)/reservations")}
          className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <Text className="text-2xl">🎟️</Text>
          <Text className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {myReservationsCount ?? "—"}
          </Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            My reservations
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(player)/history")}
          className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <Text className="text-2xl">🏆</Text>
          <Text className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {myWinsCount}
          </Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            My wins
          </Text>
        </Pressable>
      </View>

      {/* Games section header */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">
          Bingo games
        </Text>
        <Pressable
          onPress={() => router.push("/(player)/games")}
          className="rounded-lg px-2 py-1"
        >
          <Text className="font-semibold text-blue-600">View all</Text>
        </Pressable>
      </View>

      {/* Filter pills */}
      <View className="mb-5 flex-row flex-wrap gap-2">
        {filters.map((item) => (
          <Pressable
            key={item.value}
            onPress={() => setFilter(item.value)}
            className={`rounded-full border px-4 py-2 ${filter === item.value
                ? "border-blue-600 bg-blue-600"
                : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              }`}
          >
            <Text
              className={
                filter === item.value
                  ? "font-semibold text-white"
                  : "text-slate-900 dark:text-white"
              }
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Games list */}
      {filteredGames.length > 0 ? (
        filteredGames.slice(0, 3).map((g) => (
          <GameCard
            key={g.id}
            game={g}
            onPress={(game) =>
              router.push({
                pathname: "/(player)/game-details",
                params: {
                  gameId: String(game.id),
                  title: game.title,
                  totalNumbers: String(game.totalNumbers),
                  reservationMinutes: String(game.reservationMinutes),
                  status: game.status,
                },
              })
            }
          />
        ))
      ) : (
        <View className="rounded-2xl border border-dashed border-slate-300 p-6 dark:border-slate-700">
          <Text className="text-center text-slate-500 dark:text-slate-400">
            {filter === "ALL"
              ? "No games available at the moment."
              : `No ${filter === "ACTIVE" ? "open" : "upcoming"} games right now.`}
          </Text>
        </View>
      )}

      {/* Coming soon banner */}
      <ComingSoonDisplay />
    </ScrollView>
  );
}
