import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { TranslatedText as Text } from '@/components/common/TranslatedText';
export default function PlayerDashboard() {
  const [filter, setFilter] = useState('ALL');
  const filters = [
    { label: 'ALL', value: 'ALL' },
    { label: 'OPEN', value: 'OPEN' },
    { label: 'STARTING SOON', value: 'STARTING SOON' },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28 }}>
      <View className="mb-6">
        <Text className="text-sm text-slate-500 dark:text-slate-400">Welcome back,</Text>
        <Text className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">Player 👋</Text>
        <Text className="mt-2 text-slate-500 dark:text-slate-400">Find a game and reserve your numbers.</Text>
      </View>

      <View className="mb-8 flex-row gap-3">
        <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <Text className="text-2xl">🎟️</Text>
          <Text className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">—</Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">My reservations</Text>
        </View>
        <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <Text className="text-2xl">🏆</Text>
          <Text className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">—</Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">My wins</Text>
        </View>
      </View>

      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">Bingo games</Text>
        <Pressable onPress={() => router.push('/(player)/games')} className="rounded-lg px-2 py-1"><Text className="font-semibold text-blue-600">View all</Text></Pressable>
      </View>
      <View className="mb-5 flex-row flex-wrap gap-2">
        {filters.map((item) => (
          <Pressable key={item.value} onPress={() => setFilter(item.value)} className={`rounded-full border px-4 py-2 ${filter === item.value ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
            <Text className={filter === item.value ? 'font-semibold text-white' : 'text-slate-900 dark:text-white'}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {filter !== 'STARTING SOON' ? (
        <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-2xl">🎱</Text>
            <Text className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-950 dark:text-green-300">OPEN</Text>
          </View>
          <Text className="text-lg font-bold text-slate-900 dark:text-white">Daily Bingo</Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">Game #101</Text>
          <View className="mt-5 flex-row justify-between">
            <View><Text className="text-xs text-slate-500 dark:text-slate-400">Available numbers</Text><Text className="mt-1 font-semibold text-slate-900 dark:text-white">18 / 50</Text></View>
            <View className="items-end"><Text className="text-xs text-slate-500 dark:text-slate-400">Reservation time</Text><Text className="mt-1 font-semibold text-slate-900 dark:text-white">5 minutes</Text></View>
          </View>
          <Pressable onPress={() => router.push('/(player)/games')} className="mt-5 items-center rounded-xl bg-blue-600 py-3"><Text className="font-semibold text-white">View game & reserve</Text></Pressable>
        </View>
      ) : (
        <View className="rounded-2xl border border-dashed border-slate-300 p-6 dark:border-slate-700"><Text className="text-center text-slate-500 dark:text-slate-400">Upcoming games will appear here.</Text></View>
      )}
      <View className="mt-2 rounded-2xl bg-blue-50 p-4 dark:bg-blue-950"><Text className="font-semibold text-blue-900 dark:text-blue-200">Coming soon</Text><Text className="mt-1 text-sm text-blue-800 dark:text-blue-300">New Bingo games and announcements will appear here.</Text></View>
    </ScrollView>
  );
}