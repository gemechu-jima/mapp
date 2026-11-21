import { Pressable, View } from "react-native";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
export type NumberCell = {
  id: number;
  number: number;
  status: "AVAILABLE" | "RESERVED" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  reservedBy?: number | string | null;
};

export default function NumberGrid({
  numbers,
  selected,
  currentUserId,
  onToggle,
}: {
  numbers: NumberCell[];
  selected: number[];
  currentUserId?: number | string;
  onToggle: (id: number) => void;
}) {
  return (
    <>
      <View className="flex-row flex-wrap gap-2">
      {numbers.map((n) => {
        const active = selected.includes(n.id);
        const isAvailable =
          n.status === "AVAILABLE" ||
          n.status === "CANCELLED" ||
          n.status === "EXPIRED";
        const isMine =
          !isAvailable &&
          currentUserId != null &&
          String(n.reservedBy) === String(currentUserId);

        return (
          <Pressable
            key={n.id}
            disabled={!isAvailable}
            onPress={() => onToggle(n.id)}
            className={`aspect-square w-[17%] min-w-[42px] max-w-[64px] p-1 items-center justify-center rounded-full border ${
              active
                ? "border-blue-600 bg-blue-600"
                : isAvailable
                  ? "border-emerald-200 bg-green-500 dark:border-emerald-900 dark:bg-emerald-950"
                  : n.status === "CONFIRMED"
                    ? "border-blue-200 bg-blue-50 opacity-85 dark:border-blue-900 dark:bg-blue-950"
                    : "border-amber-200 bg-amber-50 opacity-85 dark:border-amber-900 dark:bg-amber-950"
            }`}
          >
            <Text
              className={`font-bold h-16 w-16 -p-2 rounded-full flex justify-center items-center text-xl ${
                active
                  ? "text-white"
                  : isAvailable
                    ? "text-emerald-100 bg-green-500 dark:text-emerald-200 cursor-pointer"
                    : n.status === "CONFIRMED"
                      ? "text-blue-800 dark:text-blue-300 cursor-none"
                      : "text-amber-800 dark:text-amber-300"
              }`}
            >
              {n.number}
            </Text>
            {isMine ? (
              <Text
                className={`text-[9px] font-bold uppercase ${
                  n.status === "CONFIRMED"
                    ? "text-blue-800 dark:text-blue-300"
                    : "text-amber-800 dark:text-amber-300"
                }`}
              >
                YOURS
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
    </>
  );
}
