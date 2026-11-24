import { Ionicons } from "@expo/vector-icons";
import { Href, router, usePathname } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { AuthUser, useAuth } from "@/context/AuthContext";
export type UserRole = "admin" | "player";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface NavItem {
  key: "home" | "history" | "profile" | "games";
  label: string;
  icon: IconName;
  activeIcon: IconName;
  routes: Record<UserRole, Href>;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: "home",
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
    routes: {
      player: "/(player)/dashboard",
      admin: "/admin/dashboard",
    },
  },
  {
    key: "history",
    label: "History",
    icon: "time-outline",
    activeIcon: "time",
    routes: {
      player: "/(player)/history",
      admin: "/admin/results",
    },
  },
  {
    key: "profile",
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
    routes: {
      player: "/(player)/profile",
      admin: "/admin/profile",
    },
  },
  {
    key: "games",
    label: "Game",
    icon: "game-controller-outline",
    activeIcon: "game-controller",
    routes: {
      player: "/(player)/games",
      admin: "/admin/games",
    },
  },
];

interface BottomNavigationProps {
  role?: UserRole;
}

export default function BottomNavigation({ role }: BottomNavigationProps) {
  const { user } = useAuth();
  const pathname = usePathname() ?? "";
  const normalizedRole: UserRole =
    user?.role?.toLowerCase() === "admin" ? "admin" : "player";
  return (
    <View className="flex-row justify-around border-t border-gray-300 bg-white py-3 dark:border-slate-800 dark:bg-slate-900">
      {NAV_ITEMS.map((item) => {
        const targetHref = item.routes[normalizedRole];
        if (!targetHref) return null;

        const targetRoute = String(targetHref);
        const cleanTarget = targetRoute.replace(/\/\([^)]+\)/g, "");
        const isActive =
          Boolean(pathname) &&
          (pathname === cleanTarget || pathname.startsWith(`${cleanTarget}/`));

        return (
          <Pressable
            key={item.key}
            onPress={() => {
              if (!isActive) {
                router.replace(targetHref);
              }
            }}
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
