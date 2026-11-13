import { useEffect, useState } from "react";
import { Alert, Platform, View } from "react-native";
import Screen from "@/components/ui/Screen";
import AppButton from "@/components/ui/AppButton";
import StatCard from "@/components/ui/StatCard";
import FeatureNotice from "@/features/shared/FeatureNotice";
import StatusPill from "@/components/ui/StatusPill";
import DrawResultCard from "@/features/draws/DrawResultCard";
import { DrawService, type OfficialDrawResult } from "@/services/draw.service";
import { GameService } from "@/services/game.service";
import { NumberService } from "@/services/number.service";
import type { Game } from "@/types/game";
import { GameStatus } from "@/types/game";
import { TranslatedText as Text } from "@/components/common/TranslatedText";

export default function AdminDraw() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [results, setResults] = useState<OfficialDrawResult[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  const notify = (title: string, msg: string) =>
    Platform.OS === "web"
      ? window.alert(`${title}\n${msg}`)
      : Alert.alert(title, msg);

  // Load active/drawing games
  useEffect(() => {
    GameService.getAll()
      .then((list) => {
        const eligible = list.filter(
          (g) => g.status === GameStatus.ACTIVE || g.status === GameStatus.DRAWING,
        );
        setGames(eligible);
        if (eligible.length > 0) setSelectedGame(eligible[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingGames(false));
  }, []);

  // Load confirmed reservation count and draw results when game changes
  useEffect(() => {
    if (!selectedGame) return;
    setConfirmedCount(0);
    setResults([]);

    NumberService.getConfirmedByGame(selectedGame.id)
      .then((res) => {
        setConfirmedCount(res.length);
        setTotalCount(selectedGame.totalNumbers);
      })
      .catch(() => {});

    DrawService.getOfficialResults(selectedGame.id)
      .then((res) => setResults(res))
      .catch(() => {});
  }, [selectedGame]);

  const pct = totalCount > 0 ? Math.round((confirmedCount / totalCount) * 100) : 0;
  const hasDrawn = results.length > 0;

  const handleDraw = async () => {
    if (!selectedGame) return;

    if (confirmedCount === 0) {
      notify("Cannot draw", "There are no eligible confirmed reservations.");
      return;
    }

    const confirmed = await new Promise<boolean>((resolve) => {
      if (Platform.OS === "web") {
        resolve(window.confirm(`Start the official draw for "${selectedGame.title}"?`));
      } else {
        Alert.alert(
          "Confirm draw",
          `Start the official draw for "${selectedGame.title}"?\n\nThis action cannot be undone.`,
          [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            { text: "Draw Now", style: "destructive", onPress: () => resolve(true) },
          ],
        );
      }
    });

    if (!confirmed) return;

    setDrawing(true);
    try {
      const result = await DrawService.drawNow(selectedGame.id);
      setResults([result]);
      notify("Draw complete", "Winners have been selected and saved.");
    } catch (e: any) {
      notify(
        "Draw failed",
        e?.response?.data?.message ?? "Could not complete the draw. Please try again.",
      );
    } finally {
      setDrawing(false);
    }
  };

  return (
    <Screen
      title="Draw management"
      subtitle="Trigger a backend-authoritative random draw and review official saved results."
    >
      {/* Game selector */}
      {loadingGames ? (
        <Text className="mb-4 text-slate-500 dark:text-slate-400">Loading eligible games…</Text>
      ) : games.length === 0 ? (
        <FeatureNotice
          title="No eligible games"
          body="Only games with status ACTIVE or DRAWING are eligible for a draw. Create and activate a game first."
        />
      ) : (
        <>
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
              <View className="mb-4 flex-row gap-3">
                <StatCard label="Total numbers" value={totalCount} icon="🎱" />
                <StatCard
                  label="Confirmed"
                  value={`${confirmedCount} (${pct}%)`}
                  icon="✅"
                />
              </View>

              <FeatureNotice
                title="Draw eligibility"
                body="Only payment-verified confirmed reservations are eligible. The backend selects and saves one official result per draw."
              />

              <View className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <Text className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedGame.title} · #{selectedGame.id}
                </Text>
                <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {hasDrawn
                    ? "Draw has been completed. Results are shown below."
                    : pct >= 50
                      ? "Confirmed entries exceed 50% — draw is available."
                      : "Confirmed entries are below 50% — proceed only with caution."}
                </Text>
                <View className="my-4">
                  <StatusPill
                    status={
                      hasDrawn
                        ? "COMPLETED"
                        : pct >= 50
                          ? "DRAW_AVAILABLE"
                          : "MANUAL_DRAW_ALLOWED"
                    }
                  />
                </View>

                {!hasDrawn ? (
                  <AppButton
                    title={drawing ? "Drawing…" : "Draw Now"}
                    onPress={handleDraw}
                    disabled={drawing || hasDrawn}
                    loading={drawing}
                  />
                ) : null}
              </View>

              {/* Prize distribution */}
              <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <Text className="font-bold text-slate-900 dark:text-white">
                  Prize distribution example
                </Text>
                <Text className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  1st place 60% · 2nd place 20% · 3rd place 10% · System share 10%
                </Text>
                <Text className="mt-2 text-xs text-slate-500">
                  All percentages must total 100%. Prize pool is based on paid and confirmed entries.
                </Text>
              </View>

              {/* Official draw results */}
              {results.length > 0 ? (
                <View className="mt-4">
                  <Text className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                    Official Results
                  </Text>
                  {results.map((r) => (
                    <DrawResultCard key={r.id} result={r} />
                  ))}
                </View>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}
