import { TranslatedText as Text } from "@/components/common/TranslatedText";
import AppButton from "@/components/ui/AppButton";
import Screen from "@/components/ui/Screen";
import SectionTitle from "@/components/ui/SectionTitle";
import NumberBoard, {
  getNumberStats,
  normalizeNumberCells,
} from "@/features/numbers/NumberBoard";
import { type NumberCell } from "@/features/numbers/NumberGrid";
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load numbers when selected game changes
  useEffect(() => {
    if (!selectedGame) return;
    setSelected([]);
    setLoadingNumbers(true);
    NumberService.getForGame(selectedGame.id)
      .then((list) => {
        setNumbers(normalizeNumberCells(list, selectedGame.totalNumbers));
      })
      .catch(() => {
        setNumbers([]);
      })
      .finally(() => setLoadingNumbers(false));
  }, [selectedGame]);

  const { available, reserved, confirmed } = getNumberStats(numbers);

  return (
    <Screen
      title="Number management"
      subtitle="Inspect number states and review number availability per game."
    >
      {loading ? (
        <Text className="mb-4 text-slate-500 dark:text-slate-400">
          Loading games…
        </Text>
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

          <NumberBoard
            numbers={numbers}
            selected={selected}
            loading={loadingNumbers}
            onToggle={(id) =>
              setSelected((s) =>
                s.includes(id) ? s.filter((n) => n !== id) : [...s, id],
              )
            }
            header={
              selectedGame ? (
                <SectionTitle
                  title={selectedGame.title}
                  caption={`${available} available · ${reserved} reserved · ${confirmed} confirmed`}
                />
              ) : null
            }
            footer={
              <View className="mt-5 gap-2">
                <AppButton
                  title="Clear selection"
                  variant="secondary"
                  disabled={!selected.length}
                  onPress={() => setSelected([])}
                />
                <Text className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Selected: {selected.length} number(s). Confirmed numbers are
                  read-only.
                </Text>
              </View>
            }
          />
        </>
      )}
    </Screen>
  );
}
