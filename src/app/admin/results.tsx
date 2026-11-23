import { useEffect, useState } from "react";
import { View } from "react-native";
import Screen from "@/components/ui/Screen";
import AppButton from "@/components/ui/AppButton";
import StatCard from "@/components/ui/StatCard";
import FeatureNotice from "@/features/shared/FeatureNotice";
import StatusPill from "@/components/ui/StatusPill";
import DrawResultCard from "@/features/draws/DrawResultCard";
import {
  DrawService,
  type OfficialDrawResult,
} from "@/services/draw.service";
import { GameService } from "@/services/game.service";
import { NumberService } from "@/services/number.service";
import type { Game } from "@/types/game";
import { GameStatus } from "@/types/game";
import { TranslatedText as Text } from "@/components/common/TranslatedText";

interface ConfirmedEntry {
  id: string | number;
  number: number | string;
}

interface PrizeTier {
  place: number;
  label: string;
  pct: number;
  icon: string;
  color: string;
}

// Extracts dynamic tiers from the game's prizeDistribution
function getGamePrizeTiers(game: Game | null): PrizeTier[] {
  if (!game) return [];
  const rawDist = (game as any).prizeDistribution;
  const dist = (typeof rawDist === "string"
    ? JSON.parse(rawDist)
    : rawDist) || { first: 60, second: 20, third: 10, fourth: 0, system: 10 };

  const tiers: PrizeTier[] = [];
  if (Number(dist.first) > 0) {
    tiers.push({ place: 1, label: "1st Place", pct: Number(dist.first), icon: "🥇", color: "#eab308" });
  }
  if (Number(dist.second) > 0) {
    tiers.push({ place: 2, label: "2nd Place", pct: Number(dist.second), icon: "🥈", color: "#94a3b8" });
  }
  if (Number(dist.third) > 0) {
    tiers.push({ place: 3, label: "3rd Place", pct: Number(dist.third), icon: "🥉", color: "#d97706" });
  }
  if (Number(dist.fourth) > 0) {
    tiers.push({ place: 4, label: "4th Place", pct: Number(dist.fourth), icon: "🎖️", color: "#a855f7" });
  }

  if (tiers.length === 0) {
    return [
      { place: 1, label: "1st Place", pct: 60, icon: "🥇", color: "#eab308" },
      { place: 2, label: "2nd Place", pct: 20, icon: "🥈", color: "#94a3b8" },
      { place: 3, label: "3rd Place", pct: 10, icon: "🥉", color: "#d97706" },
    ];
  }
  return tiers;
}

export default function History() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [results, setResults] = useState<OfficialDrawResult[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 1. Load completed/active games to view draw history
  useEffect(() => {
    GameService.getAll()
      .then((list) => {
        // Prioritize COMPLETED games first, followed by DRAWING / ACTIVE
        const sorted = list
          .filter(
            (g) =>
              g.status === GameStatus.COMPLETED ||
              g.status === GameStatus.DRAWING ||
              g.status === GameStatus.ACTIVE
          )
          .sort((a, b) => {
            if (a.status === GameStatus.COMPLETED && b.status !== GameStatus.COMPLETED) return -1;
            if (a.status !== GameStatus.COMPLETED && b.status === GameStatus.COMPLETED) return 1;
            return 0;
          });

        setGames(sorted);
        if (sorted.length > 0) setSelectedGame(sorted[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingGames(false));
  }, []);

  // 2. Load confirmed numbers count & official draw results when selected game changes
  useEffect(() => {
    if (!selectedGame) return;
    setConfirmedCount(0);
    setResults([]);
    setLoadingDetails(true);
    setTotalCount(selectedGame.totalNumbers);

    Promise.all([
      NumberService.getConfirmedByGame(selectedGame.id)
        .then((res: ConfirmedEntry[]) => setConfirmedCount(res.length))
        .catch(() => {}),
      DrawService.getOfficialResults(selectedGame.id)
        .then((res) => setResults(res))
        .catch(() => {}),
    ]).finally(() => setLoadingDetails(false));
  }, [selectedGame]);

  const pct = totalCount > 0 ? Math.round((confirmedCount / totalCount) * 100) : 0;
  const configuredTiers = getGamePrizeTiers(selectedGame);
  const hasOfficialResult = results.length > 0;

  return (
    <Screen
      title="Draw history"
      subtitle="Select a game to view its official draw results and winning numbers."
    >
      {loadingGames ? (
        <Text className="mb-4 text-slate-500 dark:text-slate-400">
          Loading games…
        </Text>
      ) : games.length === 0 ? (
        <FeatureNotice
          title="No game history"
          body="There are no completed or active games available to inspect yet."
        />
      ) : (
        <>
          {/* Game Selector */}
          <View className="mb-4 flex-row flex-wrap gap-2">
            {games.map((g) => (
              <AppButton
                key={g.id}
                title={g.title}
                variant={selectedGame?.id === g.id ? "primary" : "secondary"}
                onPress={() => setSelectedGame(g)}
              />
            ))}
          </View>

          {selectedGame ? (
            <>
              {/* Stats Overview */}
              <View className="mb-4 flex-row flex-wrap gap-3">
                <StatCard label="Total numbers" value={totalCount} icon="🎱" />
                <StatCard
                  label="Confirmed"
                  value={`${confirmedCount} (${pct}%)`}
                  icon="✅"
                />
                <StatCard
                  label="Winners"
                  value={results[0]?.winners?.length ?? 0}
                  icon="🏆"
                />
              </View>

              {/* Game Summary & Prize Tiers Banner */}
              <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedGame.title} · #{selectedGame.id}
                  </Text>
                  <StatusPill
                    status={hasOfficialResult ? "COMPLETED" : selectedGame.status}
                  />
                </View>

                <Text className="mb-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  Prize Distribution ({configuredTiers.length} Tiers)
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {configuredTiers.map((tier) => (
                    <View
                      key={tier.place}
                      className="flex-row items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 dark:bg-slate-800"
                    >
                      <Text className="text-sm">{tier.icon}</Text>
                      <Text className="text-xs font-bold text-slate-900 dark:text-white">
                        {tier.label}:
                      </Text>
                      <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {tier.pct}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Official Results Presentation */}
              {loadingDetails ? (
                <Text className="mt-2 text-slate-500 dark:text-slate-400">
                  Loading draw results…
                </Text>
              ) : hasOfficialResult ? (
                <View className="mt-2">
                  <Text className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                    Official Draw Winners ({results[0]?.winners?.length ?? 0}/
                    {configuredTiers.length})
                  </Text>
                  {results.map((r, index) => (
                    <DrawResultCard key={r.id ?? index} result={r} />
                  ))}
                </View>
              ) : (
                <FeatureNotice
                  title="Draw not completed yet"
                  body={`No official winners have been drawn for "${selectedGame.title}" yet.`}
                />
              )}
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}