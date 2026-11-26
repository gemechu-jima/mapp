import { type ReactNode } from "react";
import { View } from "react-native";
import { Slash, X } from "lucide-react-native";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
import NumberGrid, { type NumberCell } from "@/features/numbers/NumberGrid";

export function normalizeNumberCells(
  rawList: any,
  fallbackTotalNumbers = 0,
): NumberCell[] {
  const list = Array.isArray(rawList)
    ? rawList
    : Array.isArray(rawList?.data)
      ? rawList.data
      : [];

  if (list.length > 0) {
    return list.map((n: any) => {
      const expiry = n.reservedUntil || n.expiresAt;
      const isExpired =
        n.status === "RESERVED" &&
        expiry &&
        new Date(expiry).getTime() < Date.now();

      return {
        id: n.id,
        number: n.number,
        status: isExpired ? "AVAILABLE" : n.status,
        reservedBy: n.reservedBy ?? n.userId ?? null,
      };
    });
  }

  if (fallbackTotalNumbers > 0) {
    return Array.from({ length: fallbackTotalNumbers }, (_, i) => ({
      id: i + 1,
      number: i + 1,
      status: "AVAILABLE" as const,
      reservedBy: null,
    }));
  }

  return [];
}

export function getNumberStats(numbers: NumberCell[]) {
  return {
    available: numbers.filter((n) => n.status === "AVAILABLE").length,
    reserved: numbers.filter((n) => n.status === "RESERVED").length,
    confirmed: numbers.filter((n) => n.status === "CONFIRMED").length,
  };
}

export function NumberLegend() {
  return (
    <View className="mb-4 flex-row flex-wrap gap-2">
      <View className="flex-row items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 dark:border-emerald-800 dark:bg-emerald-950/40">
        <View className="h-3.5 w-3.5 rounded-full bg-emerald-500" />
        <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
          Available
        </Text>
      </View>

      <View className="flex-row items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 dark:border-amber-800 dark:bg-amber-950/40">
        <View className="h-4 w-4 items-center justify-center rounded-full bg-amber-100">
          <Slash size={12} strokeWidth={4} color="#16a34a" />
        </View>
        <Text className="text-xs font-bold text-amber-800 dark:text-amber-300">
          Reserved (Green /)
        </Text>
      </View>

      <View className="flex-row items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 dark:border-red-800 dark:bg-red-950/40">
        <View className="h-4 w-4 items-center justify-center rounded-full bg-red-100">
          <X size={12} strokeWidth={4} color="#dc2626" />
        </View>
        <Text className="text-xs font-bold text-red-800 dark:text-red-300">
          Confirmed (Red ✕)
        </Text>
      </View>
    </View>
  );
}

type NumberBoardProps = {
  numbers: NumberCell[];
  selected: number[];
  onToggle: (id: number) => void;
  currentUserId?: string | number | null;
  loading?: boolean;
  loadingText?: string;
  showLegend?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
};

export default function NumberBoard({
  numbers,
  selected,
  onToggle,
  currentUserId,
  loading = false,
  loadingText = "Loading numbers…",
  showLegend = true,
  header,
  footer,
}: NumberBoardProps) {
  return (
    <View>
      {showLegend ? <NumberLegend /> : null}
      {header}
      {loading ? (
        <Text className="text-slate-500 dark:text-slate-400">
          {loadingText}
        </Text>
      ) : (
        <NumberGrid
          numbers={numbers}
          selected={selected}
          currentUserId={currentUserId ?? undefined}
          onToggle={onToggle}
        />
      )}
      {footer}
    </View>
  );
}
