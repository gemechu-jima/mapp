import { TranslatedText as Text } from '@/components/common/TranslatedText';
import StatusPill from '@/components/ui/StatusPill';
import type { OfficialDrawResult } from '@/services/draw.service';
import { View } from 'react-native';

const placeLabels: Record<number, string> = {
  1: '🥇 1st Place',
  2: '🥈 2nd Place',
  3: '🥉 3rd Place',
};

type Props = {
  result: OfficialDrawResult;
};

export default function DrawResultCard({ result }: Props) {
  return (
    <View className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <View className="mb-3 flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text className="font-bold text-slate-900 dark:text-white">
            Game #{result.gameId}
          </Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {new Date(result.createdAt).toLocaleString()}
          </Text>
        </View>
        <StatusPill status={result.status} />
      </View>

      {result.winners.map((w) => (
        <View
          key={w.place}
          className="mt-2 flex-row items-center rounded-xl bg-slate-50 p-3 dark:bg-slate-950"
        >
          <Text className="w-24 text-sm font-bold text-blue-600">
            {placeLabels[w.place] ?? `#${w.place}`}
          </Text>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-900 dark:text-white">
              Number #{w.number}
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {w.displayName} · {w.prizeAmount} ETB
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
