import { View } from "react-native";
import AppButton from "@/components/ui/AppButton";
import StatusPill from "@/components/ui/StatusPill";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
export default function PaymentProofCard({
  player,
  game,
  amount,
  status,
  onVerify,
  onRestore,
  onReport,
}: {
  player: string;
  game: string;
  amount: string;
  status: string;
  onVerify?: () => void;
  onRestore?: () => void;
  onReport?: () => void;
}) {
  return (
    <View className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text className="font-bold text-slate-900 dark:text-white">
            {player}
          </Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {game}
          </Text>
        </View>
        <StatusPill status={status} />
      </View>
      <Text className="my-3 text-lg font-bold text-slate-900 dark:text-white">
        {amount} ETB
      </Text>
      <View className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Payment proof
        </Text>
        <Text className="mt-1 text-sm text-slate-500">
          Screenshot preview will appear here when supplied by the backend.
        </Text>
      </View>
      <View className="mt-3 gap-2">
        {onVerify ? (
          <AppButton title="Verify payment and confirm" onPress={onVerify} />
        ) : null}
        {onRestore ? (
          <AppButton
            title="Restore expired reservation"
            variant="secondary"
            onPress={onRestore}
          />
        ) : null}
        {onReport ? (
          <AppButton
            title="Report a mistake"
            variant="danger"
            onPress={onReport}
          />
        ) : null}
      </View>
    </View>
  );
}
