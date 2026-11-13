import { router } from "expo-router";
import { ArrowLeft, RefreshCw } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import GameList from "@/features/games/GameList";
import { GameService } from "@/services/game.service";
import { type Game } from "@/types/game";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
import { fliterGames } from "@/shared/filterGames";

export default function GamesScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "PENDING">("ALL");
  const [loading, setLoading] = useState(false);

  const filtered = games.filter((g) => filter === "ALL" || g.status === filter);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await GameService.getAll();
      const list = Array.isArray(result)
        ? result
        : Array.isArray((result as any)?.data)
          ? (result as any).data
          : [];
      setGames(list);
    } catch {
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <View className="flex-1 bg-slate-50 px-6 pt-12 dark:bg-slate-950">
      <View className="mb-6 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="rounded-xl bg-white p-3 dark:bg-slate-900"
        >
          <ArrowLeft size={20} color="#64748b" />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-xl font-bold text-slate-900 dark:text-white">
            Games
          </Text>
        </View>
        <Pressable
          onPress={refresh}
          disabled={loading}
          className="rounded-xl bg-white p-3 dark:bg-slate-900"
        >
          <RefreshCw size={20} color={loading ? "#94a3b8" : "#64748b"} />
        </Pressable>
      </View>
      <View className="mb-5 flex-row gap-2">
        {fliterGames.map((x) => (
          <Pressable
            key={x.value}
            onPress={() => setFilter(x.value as typeof filter)}
            className={`rounded-full px-4 py-2 ${filter === x.value ? "bg-blue-600" : "bg-white dark:bg-slate-900"}`}
          >
            <Text
              className={`font-semibold ${filter === x.value ? "text-white" : "text-slate-700 dark:text-slate-300"}`}
            >
              {x.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <GameList
        games={filtered}
        onGamePress={(g) =>
          router.push({
            pathname: "/(player)/game-details",
            params: {
              gameId: String(g.id),
              title: g.title,
              totalNumbers: String(g.totalNumbers),
              reservationMinutes: String(g.reservationMinutes),
              status: g.status,
            },
          })
        }
      />
    </View>
  );
}
