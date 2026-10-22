import { router } from "expo-router";
import { View } from "react-native";
import Screen from "@/components/ui/Screen";
import AppButton from "@/components/ui/AppButton";
import { usePreferences } from "@/context/PreferencesContext";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
export default function PlayerSettings() {
  const { isDark, toggleTheme } = usePreferences();
  return (
    <Screen title="Settings" subtitle="Customize your Bingo app experience.">
      <View className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Text className="text-base font-bold text-slate-900 dark:text-white">
          Appearance
        </Text>
        <Text className="mb-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose the theme used across the app.
        </Text>
        <AppButton
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
          variant="secondary"
          onPress={toggleTheme}
        />
        <View className="my-4 h-px bg-slate-100 dark:bg-slate-800" />
        <Text className="text-base font-bold text-slate-900 dark:text-white">
          Account
        </Text>
        <Text className="mb-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your profile and security options.
        </Text>
        <AppButton
          title="My profile"
          onPress={() => router.push("/(player)/profile")}
        />
      </View>
    </Screen>
  );
}
