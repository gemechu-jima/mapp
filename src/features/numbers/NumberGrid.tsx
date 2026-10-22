import { Pressable, View } from "react-native";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
export type NumberCell = {
  id: number;
  number: number;
  status: "AVAILABLE" | "RESERVED" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
};
export default function NumberGrid({
  numbers,
  selected,
  onToggle,
}: {
  numbers: NumberCell[];
  selected: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {numbers.map((n) => {
        const active = selected.includes(n.id);
        return (
          <Pressable
            key={n.id}
            disabled={n.status !== "AVAILABLE"}
            onPress={() => onToggle(n.id)}
            className={`h-12 w-[17%] min-w-[42px] items-center justify-center rounded-xl border ${active ? "border-blue-600 bg-blue-600" : n.status === "AVAILABLE" ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950" : n.status === "CONFIRMED" ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950" : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"}`}
          >
            <Text
              className={`font-bold ${active ? "text-white" : n.status === "AVAILABLE" ? "text-emerald-800 dark:text-emerald-300" : n.status === "CONFIRMED" ? "text-blue-800 dark:text-blue-300" : "text-amber-800 dark:text-amber-300"}`}
            >
              {n.number}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
