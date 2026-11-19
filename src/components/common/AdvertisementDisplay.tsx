import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {  BannerItem } from '@/assets/banners/banner'; // Adjust path if your folder differs

interface AdvertisementDisplayProps {
  ads?: BannerItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  height?: number;
}

export default function AdvertisementDisplay({
  ads = [],
  autoPlay = true,
  autoPlayInterval = 4000,
  height = 145,
}: AdvertisementDisplayProps) {
  const flatListRef = useRef<FlatList<BannerItem>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure actual container width so slides fit cleanly on both mobile and web
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  // Auto-advance slides
  useEffect(() => {
    if (!autoPlay || ads.length <= 1 || containerWidth === 0) return;

    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % ads.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [activeIndex, ads.length, autoPlay, autoPlayInterval, containerWidth]);

  // Sync active dot on manual swipe
  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (containerWidth === 0) return;
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / containerWidth);
    if (currentIndex >= 0 && currentIndex < ads.length) {
      setActiveIndex(currentIndex);
    }
  };

  const handleDotPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

  if (!ads || ads.length === 0) return null;

  return (
    <View onLayout={handleLayout} className="my-2.5 w-full">
      {containerWidth > 0 && (
        <FlatList
          ref={flatListRef}
          data={ads}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={(_, index) => ({
            length: containerWidth,
            offset: containerWidth * index,
            index,
          })}
          renderItem={({ item }) => (
            <View style={{ width: containerWidth }} className="px-0.5">
              <Pressable
                onPress={item.onPress}
                className="overflow-hidden rounded-2xl bg-gray-900 shadow-md active:opacity-95"
              >
                <View className="relative w-full" style={{ height }}>
                  <Image
                    source={item.image}
                    style={{ width: '100%', height }}
                    resizeMode="cover"
                  />

                  {/* Dark contrast scrim so text & badges always stay legible */}
                  <View className="absolute inset-0 bg-black/45" />

                  {/* Top Row: Urgency Badge & Prize Pill */}
                  <View className="absolute top-3 left-3 right-3 flex-row items-center justify-between">
                    {item.badge ? (
                      <View className="rounded-full bg-green-600 px-2.5 py-1">
                        <Text className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                          {item.badge}
                        </Text>
                      </View>
                    ) : (
                      <View />
                    )}

                    {item.prize && (
                      <View className="rounded-full border border-white/20 bg-black/65 px-3 py-1">
                        <Text className="text-xs font-bold text-amber-300">
                          {item.prize}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Bottom Row: Title, Subtitle & Compact CTA Button */}
                  <View className="absolute bottom-3 left-3 right-3 flex-row items-end justify-between gap-2">
                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-base font-extrabold text-white"
                      >
                        {item.title}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="mt-0.5 text-xs text-gray-200"
                      >
                        {item.description}
                      </Text>
                    </View>

                    {item.buttonText && (
                      <View className="rounded-lg bg-green-600 px-3 py-2">
                        <Text className="text-xs font-bold text-white">
                          {item.buttonText}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            </View>
          )}
        />
      )}

      {/* Pagination Dots */}
      {ads.length > 1 && (
        <View className="mt-2.5 flex-row items-center justify-center gap-1.5">
          {ads.map((ad, index) => {
            const isActive = index === activeIndex;
            return (
              <Pressable
                key={ad.id}
                onPress={() => handleDotPress(index)}
                hitSlop={8}
                className={`h-2 rounded-full ${
                  isActive ? 'w-5 bg-green-600' : 'w-2 bg-gray-300'
                }`}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}