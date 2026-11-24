import { Pressable, StyleSheet, View } from "react-native";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
import { X } from "lucide-react-native";

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
    <View className="flex-row flex-wrap gap-2">
      {numbers.map((n) => {
        const active = selected.includes(n.id);
        const isAvailable =
          n.status === "AVAILABLE" ||
          n.status === "CANCELLED" ||
          n.status === "EXPIRED";
        const isReserved = n.status === "RESERVED";
        const isConfirmed = n.status === "CONFIRMED";
        const isMine =
          !isAvailable &&
          currentUserId != null &&
          String(n.reservedBy) === String(currentUserId);

        return (
          <Pressable
            key={n.id}
            disabled={!isAvailable}
            onPress={() => onToggle(n.id)}
            className={`aspect-square w-[17%] min-w-[44px] max-w-[64px] items-center justify-center rounded-full border relative overflow-hidden ${
              active
                ? "border-blue-600 bg-blue-600 shadow-sm"
                : isAvailable
                ? "border-emerald-400 bg-emerald-500 shadow-xs dark:border-emerald-700 dark:bg-emerald-600"
                : isConfirmed
                ? "border-red-300 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40"
                : "border-amber-300 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40"
            }`}
          >
            {/* The number value */}
            <Text
              className={`font-bold text-lg ${
                active
                  ? "text-white"
                  : isAvailable
                  ? "text-white"
                  : isConfirmed
                  ? "text-red-950/70 dark:text-red-300/70"
                  : "text-amber-950/70 dark:text-amber-300/70"
              }`}
            >
              {n.number}
            </Text>

            {/* CONFIRMED: Bold Red Cross directly over the number */}
            {isConfirmed && (
              <View
                pointerEvents="none"
                style={StyleSheet.absoluteFillObject}
                className="items-center justify-center"
              >
                <X size={34} strokeWidth={4.5} color="#dc2626" />
              </View>
            )}

            {/* RESERVED: Bold Green Cross directly over the number */}
            {isReserved && (
              <View
                pointerEvents="none"
                style={StyleSheet.absoluteFillObject}
                className="items-center justify-center"
              >
                <X size={34} strokeWidth={4.5} color="#16a34a" />
              </View>
            )}

            {/* If it belongs to current user */}
            {isMine ? (
              <View
                pointerEvents="none"
                className="absolute bottom-0.5 rounded-full px-1 bg-black/60"
              >
                <Text className="text-[7px] font-black uppercase text-white">
                  YOU
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
