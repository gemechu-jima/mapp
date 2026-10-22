import { Pressable } from 'react-native';

import { TranslatedText as Text } from '@/components/common/TranslatedText';
type HamburgerButtonProps = { onPress: () => void };

export default function HamburgerButton({ onPress }: HamburgerButtonProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Open menu" className="items-center justify-center rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
      <Text className="text-xl text-slate-900 dark:text-white">☰</Text>
    </Pressable>
  );
}