import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Pressable, Text, View } from "react-native";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const items: {
  label: string;
  route: string;
  icon: IconName;
  activeIcon: IconName;
}[] = [
  { label: "Home", route: "/(player)/home", icon: "home-outline", activeIcon: "home" },
  { label: "History", route: "/(player)/history", icon: "time-outline", activeIcon: "time" },
  { label: "Profile", route: "/(player)/profile", icon: "person-outline", activeIcon: "person" },
  { label: "Game", route: "/(player)/games", icon: "game-controller-outline", activeIcon: "game-controller" },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <View className="flex-row justify-around border-t border-gray-300 bg-white py-3 dark:border-slate-800 dark:bg-slate-900">
      {items.map((item) => {
        const segment = item.route.split("/").pop() ?? "";
        const isActive = pathname.includes(segment);

        return (
          <Pressable
            key={item.label}
            onPress={() => router.replace(item.route as any)}
            className="items-center justify-center px-3"
          >
            <Ionicons
              name={isActive ? item.activeIcon : item.icon}
              size={22}
              color={isActive ? "#16a34a" : "#6b7280"}
            />
            <Text
              className={`mt-1 text-xs ${
                isActive ? "font-bold text-green-600" : "text-gray-500"
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