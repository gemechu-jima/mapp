
import { Pressable, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { TranslatedText as Text } from '@/components/common/TranslatedText';
export type SidebarItem = {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  active?: boolean;
};

type SidebarMenuProps = {
  items: SidebarItem[];
};

export default function SidebarMenu({ items }: SidebarMenuProps) {
  return (
    <View className="gap-2">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            className={`flex-row items-center gap-3 rounded-xl p-4 ${
              item.active
                ? 'bg-blue-50 dark:bg-slate-800'
                : 'bg-transparent'
            }`}
          >
            <Icon
              size={22}
              color={item.active ? '#2563eb' : '#64748b'}
              strokeWidth={2}
            />

            <Text
              className={`text-base ${
                item.active
                  ? 'font-semibold text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}