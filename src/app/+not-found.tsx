import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found', headerShown: false }} />

      <View className="flex-1 items-center justify-center bg-gray-50 px-6 dark:bg-slate-950">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/30">
          <Ionicons name="alert-circle-outline" size={36} color="#DC2626" />
        </View>

        <Text className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Page Not Found
        </Text>

        <Text className="mt-2 text-center text-sm leading-5 text-slate-500 dark:text-slate-400">
          The page you are looking for does not exist or has been moved.
        </Text>

        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          className="mt-6 rounded-xl bg-green-600 px-6 py-3.5 active:bg-green-700"
        >
          <Text className="text-sm font-bold text-white">Go Back Home</Text>
        </Pressable>
      </View>
    </>
  );
}