import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Screen from "@/components/ui/Screen";
import AppButton from "@/components/ui/AppButton";
import StatCard from "@/components/ui/StatCard";
import FeatureNotice from "@/features/shared/FeatureNotice";
import StatusPill from "@/components/ui/StatusPill";
import DrawResultCard from "@/features/draws/DrawResultCard";
import {
  DrawService,
  type OfficialDrawResult,
  type OfficialDrawWinner,
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

const WHEEL_SIZE = 260;
const WHEEL_RADIUS = WHEEL_SIZE / 2;
const BADGE_OFFSET = WHEEL_RADIUS - 28;

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AdminDraw() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [confirmedNumbers, setConfirmedNumbers] = useState<ConfirmedEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [results, setResults] = useState<OfficialDrawResult[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  // Dynamic multi-spin tracking
  const [currentSpinningTier, setCurrentSpinningTier] = useState<PrizeTier | null>(null);
  const [revealedWinners, setRevealedWinners] = useState<OfficialDrawWinner[]>([]);
  const [lastWinnerAnnounced, setLastWinnerAnnounced] = useState<OfficialDrawWinner | null>(null);

  // Wheel rotation animations
  const spinValue = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);

  const notify = (title: string, msg: string) =>
    Platform.OS === "web"
      ? window.alert(`${title}\n${msg}`)
      : Alert.alert(title, msg);

  // 1. Load active/drawing/completed games eligible for inspection
  useEffect(() => {
    GameService.getAll()
      .then((list) => {
        const eligible = list.filter(
          (g) =>
            g.status === GameStatus.ACTIVE ||
            g.status === GameStatus.DRAWING ||
            g.status === GameStatus.COMPLETED
        );
        setGames(eligible);
        if (eligible.length > 0) setSelectedGame(eligible[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingGames(false));
  }, []);

  // 2. Load confirmed numbers & official results when game changes
  useEffect(() => {
    if (!selectedGame) return;
    setConfirmedNumbers([]);
    setResults([]);
    setRevealedWinners([]);
    setLastWinnerAnnounced(null);
    setCurrentSpinningTier(null);
    currentRotation.current = 0;
    spinValue.setValue(0);

    NumberService.getConfirmedByGame(selectedGame.id)
      .then((res: ConfirmedEntry[]) => {
        setConfirmedNumbers(res);
        setTotalCount(selectedGame.totalNumbers);
      })
      .catch(() => {});

    DrawService.getOfficialResults(selectedGame.id)
      .then((res) => {
        setResults(res);
        if (res.length > 0 && res[0].winners) {
          setRevealedWinners(res[0].winners);
        }
      })
      .catch(() => {});
  }, [selectedGame]);

  const confirmedCount = confirmedNumbers.length;
  const pct = totalCount > 0 ? Math.round((confirmedCount / totalCount) * 100) : 0;

  // Dynamic tiers based on game's prize distribution
  const configuredTiers = getGamePrizeTiers(selectedGame);
  const totalDrawSlots = Math.min(confirmedCount > 0 ? confirmedCount : configuredTiers.length, configuredTiers.length);

  const hasOfficialResult = results.length > 0;
  const displayWinners = hasOfficialResult ? results[0].winners : revealedWinners;
  const isComplete = hasOfficialResult || (displayWinners.length >= totalDrawSlots && totalDrawSlots > 0);

  // Numbers already drawn for visual indicator on the wheel
  const drawnNumbers = displayWinners.map((w) => Number(w.number));

  // 3. Multi-spin execution flow: One confirmation prompt, then spins dynamically for each tier
  const handleStartDraw = async () => {
    if (!selectedGame || drawing || isComplete) return;

    if (confirmedCount === 0) {
      notify("Cannot draw", "There are no eligible confirmed numbers for this game.");
      return;
    }

    // Single confirmation prompt before starting the draw sequence
    const tierSummary = configuredTiers
      .slice(0, totalDrawSlots)
      .map((t) => `${t.label} (${t.pct}%)`)
      .join(", ");

    const confirmed = await new Promise<boolean>((resolve) => {
      const promptMsg = `Start official draw for "${selectedGame.title}"?\n\nThis will spin and draw ${totalDrawSlots} winner(s) based on prize distribution:\n${tierSummary}`;
      if (Platform.OS === "web") {
        resolve(window.confirm(promptMsg));
      } else {
        Alert.alert("Confirm Draw", promptMsg, [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          { text: "Yes, Start Draw", style: "destructive", onPress: () => resolve(true) },
        ]);
      }
    });

    if (!confirmed) return;

    setDrawing(true);
    setRevealedWinners([]);
    setLastWinnerAnnounced(null);

    try {
      // Execute the official server-side draw
      const officialResult = await DrawService.drawNow(selectedGame.id);
      const allWinners = officialResult.winners || [];

      // Sequentially spin the wheel for each winner dynamically (1st, 2nd, 3rd, 4th)
      const accumulated: OfficialDrawWinner[] = [];

      for (let i = 0; i < allWinners.length; i++) {
        const winner = allWinners[i];
        const tier = configuredTiers[i] || {
          place: i + 1,
          label: `${i + 1}th Place`,
          pct: 0,
          icon: "🏆",
          color: "#3b82f6",
        };

        setCurrentSpinningTier(tier);

        // Spin the wheel with natural acceleration and deceleration
        const extraDegrees = 1800 + Math.floor(Math.random() * 360);
        const targetRotation = currentRotation.current + extraDegrees;

        await new Promise<void>((resolve) => {
          Animated.timing(spinValue, {
            toValue: targetRotation,
            duration: 2600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start(() => {
            currentRotation.current = targetRotation;
            resolve();
          });
        });

        // Reveal winner for this tier
        accumulated.push(winner);
        setRevealedWinners([...accumulated]);
        setLastWinnerAnnounced(winner);

        // Short dramatic pause before moving to next spin (WITHOUT asking again)
        if (i < allWinners.length - 1) {
          await sleep(1500);
        }
      }

      // Finalize draw
      setResults([officialResult]);
      setCurrentSpinningTier(null);
      notify("Draw complete", `All ${allWinners.length} winners have been successfully drawn!`);
    } catch (e: any) {
      notify(
        "Draw failed",
        e?.response?.data?.message ?? "Could not complete the draw. Please try again."
      );
    } finally {
      setDrawing(false);
      setCurrentSpinningTier(null);
    }
  };

  // 4. Admin Reset (for re-drawing or testing)
  const handleReset = async () => {
    if (!selectedGame) return;
    const ok = Platform.OS === "web"
      ? window.confirm(`Reset draw for "${selectedGame.title}"? This clears the results so you can spin again.`)
      : await new Promise((r) =>
          Alert.alert("Reset Draw", `Reset draw for "${selectedGame.title}"?`, [
            { text: "Cancel", style: "cancel", onPress: () => r(false) },
            { text: "Reset", style: "destructive", onPress: () => r(true) },
          ])
        );

    if (!ok) return;

    try {
      await DrawService.resetGame(selectedGame.id);
      setResults([]);
      setRevealedWinners([]);
      setLastWinnerAnnounced(null);
      currentRotation.current = 0;
      spinValue.setValue(0);
      notify("Draw reset", "Game is now open for a new draw.");
    } catch (e: any) {
      notify("Reset failed", e?.response?.data?.message ?? "Could not reset draw.");
    }
  };

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  // Display up to 12 confirmed numbers evenly around the perimeter
  const wheelNumbers = confirmedNumbers.slice(0, 12);

  return (
    <Screen
      title="Draw management"
      subtitle="Spin the circle to draw winners dynamically according to the game's prize distribution."
    >
      {loadingGames ? (
        <Text className="mb-4 text-slate-500 dark:text-slate-400">
          Loading eligible games…
        </Text>
      ) : games.length === 0 ? (
        <FeatureNotice
          title="No eligible games"
          body="Only games with status ACTIVE, DRAWING, or COMPLETED are available for draws."
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
              {/* Stats overview */}
              <View className="mb-4 flex-row gap-3">
                <StatCard label="Total numbers" value={totalCount} icon="🎱" />
                <StatCard
                  label="Confirmed"
                  value={`${confirmedCount} (${pct}%)`}
                  icon="✅"
                />
              </View>

              {/* Prize Tiers Distribution Banner */}
              <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <Text className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Prize Distribution ({configuredTiers.length} Winners)
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

              {/* Main Circular Wheel Card */}
              <View className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 items-center">
                <Text className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedGame.title} · #{selectedGame.id}
                </Text>

                {/* Dynamic Status / Spin Announcement */}
                <View className="my-2 min-h-[28px] items-center justify-center">
                  {drawing && currentSpinningTier ? (
                    <Text className="text-sm font-bold text-amber-500 animate-pulse">
                      Spinning for {currentSpinningTier.icon} {currentSpinningTier.label} ({currentSpinningTier.pct}%)...
                    </Text>
                  ) : lastWinnerAnnounced && !isComplete ? (
                    <Text className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      🎉 Winner: Number #{lastWinnerAnnounced.number} ({lastWinnerAnnounced.displayName})!
                    </Text>
                  ) : isComplete ? (
                    <Text className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      🏆 All {displayWinners.length} winners drawn!
                    </Text>
                  ) : (
                    <Text className="text-sm text-slate-500 dark:text-slate-400">
                      Press SPIN to start drawing {totalDrawSlots} winner(s)
                    </Text>
                  )}
                </View>

                {/* Wheel Stage */}
                <View style={localStyles.wheelStage}>
                  {/* Top Pointer */}
                  <View style={localStyles.pointer} />

                  {/* Corner Badges Showing Drawn Winners in Order */}
                  {displayWinners.map((winner, idx) => {
                    const cornerStyle =
                      idx === 0
                        ? localStyles.cornerTopLeft
                        : idx === 1
                        ? localStyles.cornerTopRight
                        : idx === 2
                        ? localStyles.cornerBottomLeft
                        : localStyles.cornerBottomRight;

                    const tier = configuredTiers[idx];

                    return (
                      <View key={`${winner.number}-${idx}`} style={[localStyles.cornerBadge, cornerStyle]}>
                        <Text className="text-[10px] font-bold text-amber-400">
                          {tier?.icon ?? "🏆"} #{winner.place}
                        </Text>
                        <Text className="text-base font-extrabold text-white">
                          #{winner.number}
                        </Text>
                        <Text className="text-[9px] text-slate-300 max-w-[70px]" numberOfLines={1}>
                          {winner.displayName}
                        </Text>
                      </View>
                    );
                  })}

                  {/* Rotating Circular Wheel */}
                  <View style={localStyles.wheelBase}>
                    <Animated.View
                      style={[
                        localStyles.wheel,
                        { transform: [{ rotate: spinInterpolate }] },
                      ]}
                    >
                      {/* Color Quadrants / Slices */}
                      <View style={[localStyles.quadrant, { backgroundColor: "#dc2626", top: 0, left: 0 }]} />
                      <View style={[localStyles.quadrant, { backgroundColor: "#2563eb", top: 0, right: 0 }]} />
                      <View style={[localStyles.quadrant, { backgroundColor: "#16a34a", bottom: 0, right: 0 }]} />
                      <View style={[localStyles.quadrant, { backgroundColor: "#d97706", bottom: 0, left: 0 }]} />

                      {/* Confirmed Numbers Placed Around the Circle */}
                      {wheelNumbers.map((entry, index) => {
                        const angle = (index / wheelNumbers.length) * 2 * Math.PI - Math.PI / 2;
                        const x = WHEEL_RADIUS - 16 + BADGE_OFFSET * Math.cos(angle);
                        const y = WHEEL_RADIUS - 16 + BADGE_OFFSET * Math.sin(angle);
                        const isDrawn = drawnNumbers.includes(Number(entry.number));

                        return (
                          <View
                            key={entry.id}
                            style={[
                              localStyles.numberNode,
                              { left: x, top: y },
                              isDrawn && localStyles.numberNodeDrawn,
                            ]}
                          >
                            <Text className={`text-xs font-black ${isDrawn ? "text-amber-900" : "text-slate-900"}`}>
                              {entry.number}
                            </Text>
                          </View>
                        );
                      })}
                    </Animated.View>

                    {/* Interactive Center SPIN Button */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleStartDraw}
                      disabled={drawing || isComplete}
                      style={[
                        localStyles.wheelCenter,
                        (drawing || isComplete) && localStyles.wheelCenterDisabled,
                      ]}
                    >
                      <Text className="text-[11px] font-black text-white text-center leading-tight">
                        {drawing
                          ? `${currentSpinningTier?.icon ?? "..."}\nSPIN`
                          : isComplete
                          ? "DONE"
                          : "START\nSPIN"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Status indicator & Reset Button */}
                <View className="mt-2 flex-row items-center gap-3">
                  <StatusPill
                    status={
                      isComplete
                        ? "COMPLETED"
                        : pct >= 50
                        ? "DRAW_AVAILABLE"
                        : "MANUAL_DRAW_ALLOWED"
                    }
                  />
                  {isComplete && (
                    <TouchableOpacity
                      onPress={handleReset}
                      className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 dark:border-rose-800 dark:bg-rose-950/50"
                    >
                      <Text className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                        Reset Draw
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Official Results Presentation */}
              {results.length > 0 ? (
                <View className="mt-4">
                  <Text className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                    Official Draw Winners ({results[0]?.winners?.length ?? 0}/{configuredTiers.length})
                  </Text>
                  {results.map((r, index) => (
                    <DrawResultCard key={r.id ?? index} result={r} />
                  ))}
                </View>
              ) : displayWinners.length > 0 ? (
                <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <Text className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                    Drawn Winners ({displayWinners.length}/{totalDrawSlots})
                  </Text>
                  {displayWinners.map((w, index) => {
                    const tier = configuredTiers[index];
                    return (
                      <View
                        key={w.place ?? index}
                        className="mb-2 flex-row items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800"
                      >
                        <View className="flex-row items-center gap-3">
                          <Text className="text-xl">{tier?.icon ?? "🏆"}</Text>
                          <View>
                            <Text className="text-sm font-bold text-slate-900 dark:text-white">
                              {tier?.label ?? `#${w.place}`} · Number #{w.number}
                            </Text>
                            <Text className="text-xs text-slate-500 dark:text-slate-400">
                              {w.displayName}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          {w.prizeAmount} ETB ({tier?.pct ?? ""}% pool)
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const localStyles = StyleSheet.create({
  wheelStage: {
    width: "100%",
    height: 310,
    marginVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#f59e0b",
    marginBottom: -6,
    zIndex: 25,
  },
  wheelBase: {
    width: WHEEL_SIZE + 18,
    height: WHEEL_SIZE + 18,
    borderRadius: (WHEEL_SIZE + 18) / 2,
    borderWidth: 8,
    borderColor: "#f59e0b",
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_RADIUS,
    position: "relative",
    overflow: "hidden",
  },
  quadrant: {
    position: "absolute",
    width: WHEEL_RADIUS,
    height: WHEEL_RADIUS,
  },
  numberNode: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  numberNodeDrawn: {
    backgroundColor: "#fde047",
    borderColor: "#b45309",
    transform: [{ scale: 1.15 }],
  },
  wheelCenter: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#0f172a",
    borderWidth: 3,
    borderColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  wheelCenterDisabled: {
    opacity: 0.7,
  },
  cornerBadge: {
    position: "absolute",
    minWidth: 70,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    borderWidth: 2,
    borderColor: "#f59e0b",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  cornerTopLeft: {
    top: 6,
    left: 6,
  },
  cornerTopRight: {
    top: 6,
    right: 6,
  },
  cornerBottomLeft: {
    bottom: 6,
    left: 6,
  },
  cornerBottomRight: {
    bottom: 6,
    right: 6,
  },
});
