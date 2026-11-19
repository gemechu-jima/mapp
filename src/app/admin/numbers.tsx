import { TranslatedText as Text } from "@/components/common/TranslatedText";
import AppButton from "@/components/ui/AppButton";
import Screen from "@/components/ui/Screen";
import SectionTitle from "@/components/ui/SectionTitle";
import NumberGrid, { type NumberCell } from "@/features/numbers/NumberGrid";
import FeatureNotice from "@/features/shared/FeatureNotice";
import { GameService } from "@/services/game.service";
import { NumberService } from "@/services/number.service";
import type { Game } from "@/types/game";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function AdminNumbers() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [numbers, setNumbers] = useState<NumberCell[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNumbers, setLoadingNumbers] = useState(false);

  // Load games on mount
  useEffect(() => {
    GameService.getAll()
      .then((list) => {
        setGames(list);
        if (list.length > 0) setSelectedGame(list[0]);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Load numbers when selected game changes
  useEffect(() => {
    if (!selectedGame) return;
    setSelected([]);
    setLoadingNumbers(true);
    NumberService.getForGame(selectedGame.id)
      .then((list) => {
        if (list.length > 0) {
          setNumbers(
            list.map((n) => ({
              id: n.id,
              number: n.number,
              status: n.status,
            })),
          );
        } else {
          // Show placeholder grid if game has no numbers yet
          setNumbers(
            Array.from({ length: selectedGame.totalNumbers }, (_, i) => ({
              id: i + 1,
              number: i + 1,
              status: "AVAILABLE" as const,
            })),
          );
        }
      })
      .catch(() => {
        setNumbers([]);
      })
      .finally(() => setLoadingNumbers(false));
  }, [selectedGame]);

  const available = numbers.filter((n) => n.status === "AVAILABLE").length;
  const reserved = numbers.filter((n) => n.status === "RESERVED").length;
  const confirmed = numbers.filter((n) => n.status === "CONFIRMED").length;

  return (
    <Screen
      title="Number management"
      subtitle="Inspect number states and review number availability per game."
    >
      {/* Game selector */}
      {loading ? (
        <Text className="mb-4 text-slate-500 dark:text-slate-400">Loading games…</Text>
      ) : games.length === 0 ? (
        <FeatureNotice
          title="No games found"
          body="Create a game first to view its number inventory."
        />
      ) : (
        <>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {games.slice(0, 6).map((g) => (
              <AppButton
                key={g.id}
                title={g.title}
                variant={selectedGame?.id === g.id ? "primary" : "secondary"}
                onPress={() => setSelectedGame(g)}
              />
            ))}
          </View>

          <FeatureNotice
            title="Status consistency"
            body="Confirmed numbers are locked. Reservation expiry and status transitions are enforced by the backend."
          />

          {/* Legend */}
          <View className="mb-4 flex-row flex-wrap gap-2">
            {[
              { c: "bg-emerald-100", t: "Available" },
              { c: "bg-amber-100", t: "Reserved" },
              { c: "bg-blue-100", t: "Confirmed" },
            ].map((x) => (
              <View key={x.t} className={`rounded-full px-3 py-2 ${x.c}`}>
                <Text className="text-xs font-semibold text-slate-800">{x.t}</Text>
              </View>
            ))}
          </View>

          {selectedGame ? (
            <SectionTitle
              title={selectedGame.title}
              caption={`${available} available · ${reserved} reserved · ${confirmed} confirmed`}
            />
          ) : null}

          {loadingNumbers ? (
            <Text className="text-slate-500 dark:text-slate-400">Loading numbers…</Text>
          ) : (
            <NumberGrid
              numbers={numbers}
              selected={selected}
              onToggle={(id) =>
                setSelected((s) => (s.includes(id) ? s.filter((n) => n !== id) : [...s, id]))
              }
            />
          )}

          <View className="mt-5 gap-2">
            <AppButton
              title="Clear selection"
              variant="secondary"
              disabled={!selected.length}
              onPress={() => setSelected([])}
            />
            <Text className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              Selected: {selected.length} number(s). Confirmed numbers are read-only.
            </Text>
          </View>
        </>
      )}
    </Screen>
  );
}
