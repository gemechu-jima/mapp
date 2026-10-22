
import { FlatList, View } from 'react-native';
import type { Game } from '@/types/game';
import GameCard from './GameCard';

import { TranslatedText as Text } from '@/components/common/TranslatedText';
type GameListProps = {
  games: Game[];
  onGamePress: (game: Game) => void;
};

export default function GameList({
  games,
  onGamePress,
}: GameListProps) {
  if (games.length === 0) {
    return (
      <View className="items-center justify-center rounded-2xl border border-dashed border-slate-300 px-5 py-10 dark:border-slate-700">
        <Text className="text-lg font-semibold text-slate-800 dark:text-white">
          No games available
        </Text>

        <Text className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          Please check again later for new Bingo games.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={games}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <GameCard
          game={item}
          onPress={onGamePress}
        />
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}