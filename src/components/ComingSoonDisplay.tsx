import React, { useState } from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { soonItems, ComingSoonItem } from "@/assets/banners/soon";

interface ComingSoonDisplayProps {
  items?: ComingSoonItem[];
  item?: ComingSoonItem;
  showBackButton?: boolean;
  onNotifyPress?: (item: ComingSoonItem) => void;
}

export default function ComingSoonDisplay({
  items,
  item,
  showBackButton = true,
  onNotifyPress,
}: ComingSoonDisplayProps) {
  const router = useRouter();
  const [notifiedIds, setNotifiedIds] = useState<Record<string, boolean>>({});

  // Display a single passed object, a passed array, or default soonItems array
  const displayList: ComingSoonItem[] = item ? [item] : (items ?? soonItems);

  const handleNotify = (selected: ComingSoonItem) => {
    setNotifiedIds((prev) => ({ ...prev, [selected.id]: true }));
    onNotifyPress?.(selected);
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="px-4 py-5 gap-6"
      showsVerticalScrollIndicator={false}
    >
      {displayList.map((entry) => {
        const isNotified = !!notifiedIds[entry.id];

        return (
          <View key={entry.id}>
            {/* Top Hero Banner Card */}
            <View className="overflow-hidden rounded-2xl bg-gray-900 shadow-md">
              <View className="relative w-full" style={{ height: 185 }}>
                <Image
                  source={entry.image}
                  style={{ width: "100%", height: 185 }}
                  resizeMode="cover"
                />

                <View className="absolute inset-0 bg-black/55" />

                {/* Top Row: Status Badge & Release Tag */}
                <View className="absolute top-3.5 left-3.5 right-3.5 flex-row items-center justify-between">
                  {entry.badge ? (
                    <View className="flex-row items-center gap-1.5 rounded-full bg-green-600 px-3 py-1">
                      <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                      <Text className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                        {entry.badge}
                      </Text>
                    </View>
                  ) : (
                    <View />
                  )}

                  {entry.releaseTag && (
                    <View className="rounded-full border border-white/20 bg-black/65 px-3 py-1">
                      <Text className="text-xs font-bold text-amber-300">
                        {entry.releaseTag}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Bottom Row: Title & Subtitle */}
                <View className="absolute bottom-4 left-3.5 right-3.5">
                  <Text className="text-xl font-extrabold text-white">
                    {entry.title}
                  </Text>
                  <Text
                    numberOfLines={2}
                    className="mt-1 text-xs leading-4 text-gray-200"
                  >
                    {entry.description}
                  </Text>
                </View>
              </View>
            </View>

            {/* What's Coming Card */}
            {entry.features.length > 0 && (
              <View className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
                <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  What to Expect
                </Text>

                <View className="gap-3.5">
                  {entry.features.map((feature, index) => (
                    <View key={index} className="flex-row items-start gap-3">
                      <View className="h-9 w-9 items-center justify-center rounded-xl bg-green-50">
                        <Ionicons
                          name={feature.icon}
                          size={18}
                          color="#16A34A"
                        />
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

            {/* Notify Button per Item */}
            <Pressable
              onPress={() => handleNotify(entry)}
              disabled={isNotified}
              className={`mt-3 flex-row items-center justify-center gap-2 rounded-xl py-3.5 ${
                isNotified ? "bg-green-100" : "bg-green-600 active:bg-green-700"
              }`}
            >
              <Ionicons
                name={isNotified ? "checkmark-circle" : "notifications-outline"}
                size={18}
                color={isNotified ? "#15803D" : "#FFFFFF"}
              />
              <Text
                className={`text-sm font-bold ${
                  isNotified ? "text-green-800" : "text-white"
                }`}
              >
                {isNotified ? "We Will Notify You!" : "Notify Me When Ready"}
              </Text>
            </Pressable>
          </View>
        );
      })}

      {showBackButton && (
        <Pressable
          onPress={() => router.back()}
          className="items-center rounded-xl border border-gray-200 bg-white py-3 active:bg-gray-100"
        >
          <Text className="text-sm font-semibold text-gray-700">Go Back</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
