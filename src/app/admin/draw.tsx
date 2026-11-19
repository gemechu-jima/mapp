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
import { DrawService, type OfficialDrawResult } from "@/services/draw.service";
import { GameService } from "@/services/game.service";
import { NumberService } from "@/services/number.service";
import type { Game } from "@/types/game";
import { GameStatus } from "@/types/game";
import { TranslatedText as Text } from "@/components/common/TranslatedText";

// Shape of a confirmed reservation item returned by NumberService
interface ConfirmedEntry {
  id: string | number;
  number: number | string;
}

const WHEEL_SIZE = 240;
const WHEEL_RADIUS = WHEEL_SIZE / 2;
const BADGE_OFFSET = WHEEL_RADIUS - 26;

export default function AdminDraw() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [confirmedNumbers, setConfirmedNumbers] = useState<ConfirmedEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [results, setResults] = useState<OfficialDrawResult[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  // Track cumulative degrees so each subsequent spin rotates smoothly forward
  const spinValue = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);

  const notify = (title: string, msg: string) =>
    Platform.OS === "web"
      ? window.alert(`${title}\n${msg}`)
      : Alert.alert(title, msg);

  // 1. Load active/drawing games
  useEffect(() => {
    GameService.getAll()
      .then((list) => {
        const eligible = list.filter(
          (g) => g.status === GameStatus.ACTIVE || g.status === GameStatus.DRAWING
        );
        setGames(eligible);
        if (eligible.length > 0) setSelectedGame(eligible[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingGames(false));
  }, []);

  // 2. Load confirmed numbers & existing results when selected game changes
  useEffect(() => {
    if (!selectedGame) return;
    setConfirmedNumbers([]);
    setResults([]);
    currentRotation.current = 0;
    spinValue.setValue(0);

    NumberService.getConfirmedByGame(selectedGame.id)
      .then((res: ConfirmedEntry[]) => {
        setConfirmedNumbers(res);
        setTotalCount(selectedGame.totalNumbers);
      })
      .catch(() => {});

    DrawService.getOfficialResults(selectedGame.id)
      .then((res) => setResults(res))
      .catch(() => {});
  }, [selectedGame]);

  const confirmedCount = confirmedNumbers.length;
  const pct = totalCount > 0 ? Math.round((confirmedCount / totalCount) * 100) : 0;

  // Limit of numbers/winners to draw for this game (fallback to 3 if not on Game type)
  const drawLimit = (selectedGame as any)?.winnerCount ?? 3;
  const remainingDraws = Math.max(0, drawLimit - results.length);
  const isComplete = results.length >= drawLimit;

  // Extract drawn numbers in draw order (1st, 2nd, 3rd...)
  const drawnNumbersInOrder = results.map(
    (r: any) => r.winningNumber ?? r.number ?? r.id
  );

  // 3. Triggered when admin clicks SPIN in the center of the wheel
  const handleSpinPress = async () => {
    if (!selectedGame || drawing || isComplete) return;

    if (confirmedCount === 0) {
      notify("Cannot draw", "There are no eligible confirmed reservations.");
      return;
    }

    const drawOrdinal = results.length + 1;
    const confirmed = await new Promise<boolean>((resolve) => {
      const promptMsg = `Are you sure you want to draw Winner #${drawOrdinal} of ${drawLimit} for "${selectedGame.title}"?`;
      if (Platform.OS === "web") {
        resolve(window.confirm(promptMsg));
      } else {
        Alert.alert("Confirm Draw", promptMsg, [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          { text: "Yes, Spin", style: "destructive", onPress: () => resolve(true) },
        ]);
      }
    });

    if (!confirmed) return;

    setDrawing(true);

    // Spin 5 full rotations + a random offset for natural wheel deceleration
    const extraDegrees = 1800 + Math.floor(Math.random() * 360);
    const targetRotation = currentRotation.current + extraDegrees;

    // Start wheel spin animation alongside the backend draw call
    const spinPromise = new Promise<void>((resolve) => {
      Animated.timing(spinValue, {
        toValue: targetRotation,
        duration: 2800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        currentRotation.current = targetRotation;
        resolve();
      });
    });

    try {
      const [newResult] = await Promise.all([
        DrawService.drawNow(selectedGame.id),
        spinPromise,
      ]);

      // Append the newly drawn winner in chronological order
      setResults((prev) => [...prev, newResult]);

      if (results.length + 1 >= drawLimit) {
        notify("All draws complete", `All ${drawLimit} winners have been selected.`);
      }
    } catch (e: any) {
      notify(
        "Draw failed",
        e?.response?.data?.message ?? "Could not complete the draw. Please try again."
      );
    } finally {
      setDrawing(false);
    }
  };

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  // Display up to 12 confirmed numbers evenly around the wheel perimeter
  const wheelNumbers = confirmedNumbers.slice(0, 12);

  return (
    <Screen
      title="Draw management"
      subtitle="Spin the wheel to draw official winners one by one up to the game limit."
    >
      {loadingGames ? (
        <Text className="mb-4 text-slate-500 dark:text-slate-400">
          Loading eligible games…
        </Text>
      ) : games.length === 0 ? (
        <FeatureNotice
          title="No eligible games"
          body="Only games with status ACTIVE or DRAWING are eligible for a draw."
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
              <View className="mb-4 flex-row gap-3">
                <StatCard label="Total numbers" value={totalCount} icon="🎱" />
                <StatCard
                  label="Confirmed"
                  value={`${confirmedCount} (${pct}%)`}
                  icon="✅"
                />
              </View>

              {/* Main Wheel Card */}
              <View className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 items-center">
                <Text className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedGame.title} · #{selectedGame.id}
                </Text>
                <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400 text-center">
                  {isComplete
                    ? `Draw limit reached (${drawLimit}/${drawLimit} drawn).`
                    : `Drawn ${results.length} of ${drawLimit} · ${remainingDraws} remaining`}
                </Text>

                {/* Wheel Container with Corner Badges for Drawn Order */}
                <View style={localStyles.wheelStage}>
                  {/* Top Pointer / Indicator */}
                  <View style={localStyles.pointer} />

                  {/* Corner Badges Showing Drawn Numbers in Order */}
                  {drawnNumbersInOrder.map((num, idx) => {
                    const cornerStyle =
                      idx === 0
                        ? localStyles.cornerTopLeft
                        : idx === 1
                        ? localStyles.cornerTopRight
                        : idx === 2
                        ? localStyles.cornerBottomLeft
                        : localStyles.cornerBottomRight;

                    return (
                      <View key={`${num}-${idx}`} style={[localStyles.cornerBadge, cornerStyle]}>
                        <Text className="text-[10px] font-semibold text-amber-300">
                          #{idx + 1}
                        </Text>
                        <Text className="text-sm font-extrabold text-white">
                          {num}
                        </Text>
                      </View>
                    );
                  })}

                  {/* Rotating Circus Wheel */}
                  <View style={localStyles.wheelBase}>
                    <Animated.View
                      style={[
                        localStyles.wheel,
                        { transform: [{ rotate: spinInterpolate }] },
                      ]}
                    >
                      {/* Alternating Circus Color Quadrants */}
                      <View style={[localStyles.quadrant, { backgroundColor: "#dc2626", top: 0, left: 0 }]} />
                      <View style={[localStyles.quadrant, { backgroundColor: "#2563eb", top: 0, right: 0 }]} />
                      <View style={[localStyles.quadrant, { backgroundColor: "#16a34a", bottom: 0, right: 0 }]} />
                      <View style={[localStyles.quadrant, { backgroundColor: "#d97706", bottom: 0, left: 0 }]} />

                      {/* Confirmed Numbers Placed Around the Wheel Perimeter */}
                      {wheelNumbers.map((entry, index) => {
                        const angle = (index / wheelNumbers.length) * 2 * Math.PI - Math.PI / 2;
                        const x = WHEEL_RADIUS - 18 + BADGE_OFFSET * Math.cos(angle);
                        const y = WHEEL_RADIUS - 18 + BADGE_OFFSET * Math.sin(angle);
                        const isAlreadyDrawn = drawnNumbersInOrder.includes(entry.number);

                        return (
                          <View
                            key={entry.id}
                            style={[
                              localStyles.numberNode,
                              { left: x, top: y },
                              isAlreadyDrawn && localStyles.numberNodeDrawn,
                            ]}
                          >
                            <Text className="text-xs font-extrabold text-slate-900">
                              {entry.number}
                            </Text>
                          </View>
                        );
                      })}
                    </Animated.View>

                    {/* Interactive Center SPIN Button */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleSpinPress}
                      disabled={drawing || isComplete}
                      style={[
                        localStyles.wheelCenter,
                        (drawing || isComplete) && localStyles.wheelCenterDisabled,
                      ]}
                    >
                      <Text className="text-xs font-extrabold text-white tracking-wider">
                        {drawing ? "..." : isComplete ? "DONE" : "SPIN"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="my-2">
                  <StatusPill
                    status={
                      isComplete
                        ? "COMPLETED"
                        : pct >= 50
                        ? "DRAW_AVAILABLE"
                        : "MANUAL_DRAW_ALLOWED"
                    }
                  />
                </View>
              </View>

              {/* Official Draw Results List */}
              {results.length > 0 ? (
                <View className="mt-4">
                  <Text className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                    Official Results ({results.length}/{drawLimit})
                  </Text>
                  {results.map((r, index) => (
                    <DrawResultCard key={r.id ?? index} result={r} />
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

const localStyles = StyleSheet.create({
  wheelStage: {
    width: "100%",
    height: 290,
    marginVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 16,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#f59e0b",
    marginBottom: -4,
    zIndex: 20,
  },
  wheelBase: {
    width: WHEEL_SIZE + 16,
    height: WHEEL_SIZE + 16,
    borderRadius: (WHEEL_SIZE + 16) / 2,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  numberNodeDrawn: {
    backgroundColor: "#fde047",
    borderColor: "#b45309",
  },
  wheelCenter: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0f172a",
    borderWidth: 3,
    borderColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 15,
  },
  wheelCenterDisabled: {
    opacity: 0.5,
  },
  cornerBadge: {
    position: "absolute",
    minWidth: 54,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    borderWidth: 2,
    borderColor: "#f59e0b",
    alignItems: "center",
    zIndex: 10,
  },
  cornerTopLeft: {
    top: 4,
    left: 4,
  },
  cornerTopRight: {
    top: 4,
    right: 4,
  },
  cornerBottomLeft: {
    bottom: 4,
    left: 4,
  },
  cornerBottomRight: {
    bottom: 4,
    right: 4,
  },
});