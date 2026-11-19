import { TranslatedText as Text, TranslatedTextInput as TextInput } from "@/components/common/TranslatedText";
import AppButton from "@/components/ui/AppButton";
import Screen from "@/components/ui/Screen";
import { usePreferences } from "@/context/PreferencesContext";
import FeatureNotice from "@/features/shared/FeatureNotice";
import { useState } from "react";
import { View } from "react-native";
export default function AdminSettings() {
  const { isDark, toggleTheme } = usePreferences();
  const [name, setName] = useState("Bingo Platform");
  const [currency, setCurrency] = useState("ETB");
  const [reservation, setReservation] = useState("5");
  const [saved, setSaved] = useState(false);

  return (
    <Screen
      title="System settings"
      subtitle="Configure general defaults. Game-specific settings should override these defaults when saved by the backend."
    >
      <FeatureNotice
        title="Settings are now interactive"
        body="These values are editable in this frontend demo. Persist them through a settings API when your backend is ready."
      />
      <View className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Platform name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Currency code
        </Text>
        <TextInput
          value={currency}
          onChangeText={setCurrency}
          className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Default reservation minutes
        </Text>
        <TextInput
          value={reservation}
          onChangeText={setReservation}
          keyboardType="number-pad"
          className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <AppButton title="Save settings" onPress={() => setSaved(true)} />
        {saved ? (
          <Text className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
            Settings saved in this screen session. Connect backend persistence
            when ready.
          </Text>
        ) : null}
      </View>
      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Text className="mb-2 font-bold text-slate-900 dark:text-white">
          Feature modules
        </Text>
        {[
          "Games & number inventory",
          "Reservations & expiration",
          "Payments & proof review",
          "Draws & official results",
          "Notifications",
          "Reports",
          "Users, permissions & audit",
        ].map((x) => (
          <Text
            key={x}
            className="py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            • {x}
          </Text>
        ))}
      </View>
      <AppButton
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
        variant="secondary"
        onPress={toggleTheme}
      />
    </Screen>
  );
}
