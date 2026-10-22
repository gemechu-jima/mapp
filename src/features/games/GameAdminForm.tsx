import { useState } from "react";
import { View } from "react-native";
import AppButton from "@/components/ui/AppButton";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
import { TranslatedTextInput as TextInput } from "@/components/common/TranslatedText";
type GameDraft = {
  title: string;
  totalNumbers: number;
  reservationMinutes: number;
  winnerCount: number;
  numberPrice: number;
  prizeDistribution: {
    first: number;
    second: number;
    third: number;
    fourth: number;
    system: number;
  };
};
export default function GameAdminForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (game: GameDraft) => void;
}) {
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState("50");
  const [minutes, setMinutes] = useState("5");
  const [winners, setWinners] = useState("3");
  const [price, setPrice] = useState("100");
  const [first, setFirst] = useState("60");
  const [second, setSecond] = useState("20");
  const [third, setThird] = useState("10");
  const [fourth, setFourth] = useState("0");
  const [system, setSystem] = useState("10");
  const shareTotal =
    Number(first) +
    Number(second) +
    Number(third) +
    Number(fourth) +
    Number(system);
  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <Text className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
        Create game
      </Text>
      <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
        Game title
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Friday Bingo"
        className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
      <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
        Total numbers
      </Text>
      <TextInput
        value={total}
        onChangeText={setTotal}
        keyboardType="number-pad"
        className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
      <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
        Reservation duration (minutes)
      </Text>
      <TextInput
        value={minutes}
        onChangeText={setMinutes}
        keyboardType="number-pad"
        className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
      <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
        Winner count
      </Text>
      <TextInput
        value={winners}
        onChangeText={setWinners}
        keyboardType="number-pad"
        className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
      <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
        Price per number (ETB)
      </Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
      <Text className="mb-2 mt-2 text-base font-bold text-slate-900 dark:text-white">
        Prize distribution (%)
      </Text>
      {[
        { label: "1st place", value: first, set: setFirst },
        { label: "2nd place", value: second, set: setSecond },
        { label: "3rd place", value: third, set: setThird },
        { label: "4th place", value: fourth, set: setFourth },
        { label: "System share", value: system, set: setSystem },
      ].map((x) => (
        <View key={x.label}>
          <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {x.label}
          </Text>
          <TextInput
            value={x.value}
            onChangeText={x.set}
            keyboardType="decimal-pad"
            className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </View>
      ))}
      <Text
        className={`mb-3 text-sm font-semibold ${shareTotal === 100 ? "text-emerald-600" : "text-red-600"}`}
      >
        Total allocation: {shareTotal}%{" "}
        {shareTotal === 100 ? "✓" : "— must equal 100%"}
      </Text>
      <View className="mt-2 flex-row gap-2">
        <View className="flex-1">
          <AppButton title="Cancel" variant="secondary" onPress={onCancel} />
        </View>
        <View className="flex-1">
          <AppButton
            title="Save game"
            disabled={
              !title.trim() ||
              Number(total) < 1 ||
              Number(minutes) < 1 ||
              Number(winners) < 1 ||
              Number(winners) > 4 ||
              Number(price) < 0 ||
              shareTotal !== 100 ||
              [first, second, third, fourth, system].some((v) => Number(v) < 0)
            }
            onPress={() =>
              onSave({
                title: title.trim(),
                totalNumbers: Number(total),
                reservationMinutes: Number(minutes),
                winnerCount: Number(winners),
                numberPrice: Number(price),
                prizeDistribution: {
                  first: Number(first),
                  second: Number(second),
                  third: Number(third),
                  fourth: Number(fourth),
                  system: Number(system),
                },
              })
            }
          />
        </View>
      </View>
    </View>
  );
}
