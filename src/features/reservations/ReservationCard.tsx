import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import StatusPill from "@/components/ui/StatusPill";
import AppButton from "@/components/ui/AppButton";
import { TranslatedText as Text } from "@/components/common/TranslatedText";

export type ReservationRowItem = {
  id: string | number;
  game: string;
  number: number;
  status: string;
  expiresAt?: string;
  displayName?: string;
  canPay?: boolean;
  canCancel?: boolean;
};

export default function ReservationCard({
  items,
  showPlayer = false,
  onPay,
  onCancel,
}: {
  items: ReservationRowItem[];
  showPlayer?: boolean;
  onPay?: (item: ReservationRowItem) => void;
  onCancel?: (item: ReservationRowItem) => void;
}) {
  const [selected, setSelected] = useState<ReservationRowItem | null>(null);

  return (
    <>
      {/* Table inside a Card */}
      <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {/* Table Header */}
        <View className="flex-row items-center border-b border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-950">
          <Text className="flex-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Game / Number
          </Text>
          <View className="w-24 items-center">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status
            </Text>
          </View>
          <View className="w-20 items-end">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Detail
            </Text>
          </View>
        </View>

        {/* Table Rows */}
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <Pressable
              key={item.id}
              onPress={() => setSelected(item)}
              className={`flex-row items-center px-3.5 py-3 active:bg-slate-50 dark:active:bg-slate-800/60 ${
                !isLast ? "border-b border-slate-100 dark:border-slate-800" : ""
              }`}
            >
              {/* Col 1: Game + Number Badge */}
              <View className="flex-1 flex-row items-center gap-2.5 pr-2">
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60">
                  <Text className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    #{item.number}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-sm font-bold text-slate-900 dark:text-white"
                  >
                    {item.game}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-xs text-slate-500 dark:text-slate-400"
                  >
                    Res #{item.id}
                    {showPlayer && item.displayName
                      ? ` · ${item.displayName}`
                      : ""}
                  </Text>
                </View>
              </View>

              {/* Col 2: Status */}
              <View className="w-24 items-center">
                <StatusPill status={item.status} />
              </View>

              {/* Col 3: View Detail Button */}
              <View className="w-20 items-end">
                <Pressable
                  onPress={() => setSelected(item)}
                  className="rounded-lg bg-slate-100 px-2.5 py-1.5 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
                >
                  <Text className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Details
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Reservation Detail Modal */}
      <Modal
        visible={Boolean(selected)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable
          onPress={() => setSelected(null)}
          className="flex-1 items-center justify-center bg-black/60 px-4"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            {selected ? (
              <>
                <View className="mb-3 flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">
                      {selected.game}
                    </Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                      Reservation #{selected.id}
                    </Text>
                  </View>
                  <StatusPill status={selected.status} />
                </View>

                {/* Detail Key-Value Rows */}
                <View className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                  <View className="flex-row justify-between py-1.5">
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                      Reserved Number
                    </Text>
                    <Text className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                      #{selected.number}
                    </Text>
                  </View>

                  {selected.displayName ? (
                    <View className="flex-row justify-between border-t border-slate-200/70 py-1.5 dark:border-slate-800">
                      <Text className="text-xs text-slate-500 dark:text-slate-400">
                        Player
                      </Text>
                      <Text className="text-xs font-semibold text-slate-900 dark:text-white">
                        {selected.displayName}
                      </Text>
                    </View>
                  ) : null}

                  <View className="flex-row justify-between border-t border-slate-200/70 py-1.5 dark:border-slate-800">
                    <Text className="text-xs text-slate-500 dark:text-slate-400">
                      Status
                    </Text>
                    <Text className="text-xs font-semibold text-slate-900 dark:text-white">
                      {selected.status}
                    </Text>
                  </View>

                  {selected.expiresAt ? (
                    <View className="flex-row justify-between border-t border-slate-200/70 py-1.5 dark:border-slate-800">
                      <Text className="text-xs text-slate-500 dark:text-slate-400">
                        Expires At
                      </Text>
                      <Text className="text-xs font-semibold text-slate-900 dark:text-white">
                        {new Date(selected.expiresAt).toLocaleString()}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Modal Action Buttons */}
                <View className="gap-2">
                  {selected.canPay && onPay ? (
                    <AppButton
                      title="Submit payment"
                      onPress={() => {
                        const current = selected;
                        setSelected(null);
                        onPay(current);
                      }}
                    />
                  ) : null}

                  {selected.canCancel && onCancel ? (
                    <AppButton
                      title="Cancel reservation"
                      variant="secondary"
                      onPress={() => {
                        const current = selected;
                        setSelected(null);
                        onCancel(current);
                      }}
                    />
                  ) : null}

                  <AppButton
                    title="Close"
                    variant="secondary"
                    onPress={() => setSelected(null)}
                  />
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}