import React, { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { soonData, ComingSoonItem } from '@/assets/banners/soon'; // adjust path if needed

interface ComingSoonDisplayProps {
  pageKey?: keyof typeof soonData;
  data?: ComingSoonItem;
  showBackButton?: boolean;
  onNotifyPress?: (item: ComingSoonItem) => void;
}

export default function ComingSoonDisplay({
  pageKey = 'default',
  data,
  showBackButton = true,
  onNotifyPress,
}: ComingSoonDisplayProps) {
  const router = useRouter();
  const [notified, setNotified] = useState(false);

  const item = data ?? soonData[pageKey] ?? soonData.default;

  const handleNotify = () => {
    setNotified(true);
    onNotifyPress?.(item);
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="px-4 py-5"
      showsVerticalScrollIndicator={false}
    >
      {/* Top Hero Banner Card */}
      <View className="overflow-hidden rounded-2xl bg-gray-900 shadow-md">
        <View className="relative w-full" style={{ height: 185 }}>
          <Image
            source={item.image}
            style={{ width: '100%', height: 185 }}
            resizeMode="cover"
          />

          <View className="absolute inset-0 bg-black/55" />

          {/* Top Row: Status Badge & Release Tag */}
          <View className="absolute top-3.5 left-3.5 right-3.5 flex-row items-center justify-between">
            {item.badge ? (
              <View className="flex-row items-center gap-1.5 rounded-full bg-green-600 px-3 py-1">
                <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                <Text className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                  {item.badge}
                </Text>
              </View>
            ) : (
              <View />
            )}

            {item.releaseTag && (
              <View className="rounded-full border border-white/20 bg-black/65 px-3 py-1">
                <Text className="text-xs font-bold text-amber-300">
                  {item.releaseTag}
                </Text>
              </View>
            )}
          </View>

          {/* Bottom Row: Title & Subtitle */}
          <View className="absolute bottom-4 left-3.5 right-3.5">
            <Text className="text-xl font-extrabold text-white">
              {item.title}
            </Text>
            <Text
              numberOfLines={2}
              className="mt-1 text-xs leading-4 text-gray-200"
            >
              {item.description}
            </Text>
          </View>
        </View>
      </View>

      {/* What's Coming Card */}
      {item.features.length > 0 && (
        <View className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
            What to Expect
          </Text>

          <View className="gap-3.5">
            {item.features.map((feature, index) => (
              <View key={index} className="flex-row items-start gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-green-50">
                  <Ionicons name={feature.icon} size={18} color="#16A34A" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-800">
                    {feature.title}
                  </Text>
                  <Text className="mt-0.5 text-xs leading-4 text-gray-500">
                    {feature.subtitle}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="mt-5 gap-2.5">
        <Pressable
          onPress={handleNotify}
          disabled={notified}
          className={`flex-row items-center justify-center gap-2 rounded-xl py-3.5 ${
            notified ? 'bg-green-100' : 'bg-green-600 active:bg-green-700'
          }`}
        >
          <Ionicons
            name={notified ? 'checkmark-circle' : 'notifications-outline'}
            size={18}
            color={notified ? '#15803D' : '#FFFFFF'}
          />
          <Text
            className={`text-sm font-bold ${
              notified ? 'text-green-800' : 'text-white'
            }`}
          >
            {notified ? 'We Will Notify You!' : 'Notify Me When Ready'}
          </Text>
        </Pressable>

        {showBackButton && (
          <Pressable
            onPress={() => router.back()}
            className="items-center rounded-xl border border-gray-200 bg-white py-3 active:bg-gray-100"
          >
            <Text className="text-sm font-semibold text-gray-700">Go Back</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}