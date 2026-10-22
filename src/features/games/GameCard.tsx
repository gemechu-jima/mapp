import { GameStatus, type Game } from '@/types/game';
import { Clock3, Hash } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { TranslatedText as Text } from '@/components/common/TranslatedText';
type GameCardProps = {
  game: Game;
  onPress: (game: Game) => void;
};

export default function GameCard({ game, onPress }: GameCardProps) {
  const isActive = game.status === GameStatus.ACTIVE;

  const statusLabel =
    game.status === GameStatus.ACTIVE
      ? 'OPEN'
      : game.status === GameStatus.PENDING
        ? 'STARTING SOON'
        : game.status;


  return (
    <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <View className="mb-4 flex-row items-start justify-between">
        <View className="mr-3 flex-1">
          <Text className="text-lg font-bold text-slate-900 dark:text-white">
            {game.title}
          </Text>

          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Game ID: {game.id}
          </Text>
        </View>

        <View
          className={`rounded-3xl px-3 py-1 ${
            game.status === GameStatus.ACTIVE
              ? 'bg-green-100'
              : game.status === GameStatus.PENDING
                ? 'bg-amber-100'
                : game.status === GameStatus.DRAWING
                  ? 'bg-blue-100'
                  : game.status === GameStatus.COMPLETED
                    ? 'bg-slate-200'
                    : 'bg-red-100'
          }`}
        >
          <Text className={`text-xs font-semibold ${
            game.status === GameStatus.ACTIVE
              ? 'text-green-700'
              : game.status === GameStatus.PENDING
                ? 'text-amber-700'
                : game.status === GameStatus.DRAWING
                  ? 'text-blue-700'
                  : game.status === GameStatus.COMPLETED
                    ? 'text-slate-700'
                    : 'text-red-700'
          }`}>
            {statusLabel.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <View className="mb-4 flex-row gap-3">
        <View className="flex-1 rounded-xl bg-blue-50 p-3 dark:bg-slate-800">
          <Hash size={20} color="#2563eb" />

          <Text className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {game.totalNumbers}
          </Text>

          <Text className="text-xs text-slate-500 dark:text-slate-400">
            Total numbers
          </Text>
        </View>

        <View className="flex-1 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
          <Clock3 size={20} color="#64748b" />

          <Text className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {game.reservationMinutes} min
          </Text>

          <Text className="text-xs text-slate-500 dark:text-slate-400">
            Reservation time
          </Text>
        </View>
      </View>
     
      {game.status === GameStatus.PENDING ? <View className="mb-4 items-center rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950"><Text className="text-2xl">🔒</Text><Text className="mt-1 font-semibold text-amber-800 dark:text-amber-200">Coming soon</Text><Text className="mt-1 text-center text-xs text-amber-700 dark:text-amber-300">This game will open when the admin starts it.</Text></View> : null}
      <Pressable
        onPress={() => onPress(game)}
        disabled={!isActive}
        className={`items-center rounded-xl p-3 ${
          isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
       
        <Text
          className={`font-semibold ${
            isActive ? 'text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          {isActive
            ? 'View Game'
            : game.status === GameStatus.PENDING
              ? 'Waiting to Start'
              : game.status === GameStatus.DRAWING
                ? 'Game in Progress'
                : game.status === GameStatus.COMPLETED
                  ? 'Game Completed'
                  : 'Game Cancelled'}
        </Text>
      </Pressable>
      
    </View>
  );
}