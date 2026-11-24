import {
  TranslatedText as Text,
  TranslatedTextInput as TextInput,
} from "@/components/common/TranslatedText";
import AppButton from "@/components/ui/AppButton";
import Screen from "@/components/ui/Screen";
import { usePreferences } from "@/context/PreferencesContext";
import FeatureNotice from "@/features/shared/FeatureNotice";
import { SettingService } from "@/services/setting.service";
import { useEffect, useState } from "react";
import { Alert, Platform, View } from "react-native";

export default function AdminSettings() {
  const { isDark, toggleTheme } = usePreferences();
  const [name, setName] = useState("Bingo Platform");
  const [currency, setCurrency] = useState("ETB");
  const [reservation, setReservation] = useState("30");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const notify = (title: string, msg: string) =>
    Platform.OS === "web"
      ? window.alert(`${title}\n${msg}`)
      : Alert.alert(title, msg);

  useEffect(() => {
    let alive = true;
    SettingService.get()
      .then((data) => {
        if (!alive) return;
        if (data.platformName) setName(data.platformName);
        if (data.currency) setCurrency(data.currency);
        if (data.defaultReservationMinutes != null) {
          setReservation(String(data.defaultReservationMinutes));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const handleSave = async () => {
    const minutes = Number(reservation);
    if (!name.trim()) {
      notify("Invalid input", "Platform name is required.");
      return;
    }
    if (!currency.trim()) {
      notify("Invalid input", "Currency code is required.");
      return;
    }
    if (!Number.isFinite(minutes) || minutes < 1) {
      notify("Invalid input", "Reservation minutes must be at least 1.");
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      const updated = await SettingService.update({
        platformName: name.trim(),
        currency: currency.trim().toUpperCase(),
        defaultReservationMinutes: Math.round(minutes),
      });
      setName(updated.platformName);
      setCurrency(updated.currency);
      setReservation(String(updated.defaultReservationMinutes));
      setSaved(true);
    } catch (e: any) {
      notify(
        "Save failed",
        e?.response?.data?.message ?? "Could not save system settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      title="System settings"
      subtitle="Configure general defaults. Game-specific settings override these defaults when created."
    >
      <FeatureNotice
        title="Global platform defaults"
        body="Changes saved here persist in the database and apply as defaults across new games and reservations."
      />

      <View className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <Text className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading system settings…
          </Text>
        ) : (
          <>
            <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Platform name
            </Text>
            <TextInput
              value={name}
              onChangeText={(v) => {
                setName(v);
                setSaved(false);
              }}
              className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

            <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Currency code
            </Text>
            <TextInput
              value={currency}
              onChangeText={(v) => {
                setCurrency(v);
                setSaved(false);
              }}
              autoCapitalize="characters"
              className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

            <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Default reservation minutes
            </Text>
            <TextInput
              value={reservation}
              onChangeText={(v) => {
                setReservation(v);
                setSaved(false);
              }}
              keyboardType="number-pad"
              className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

            <AppButton
              title={saving ? "Saving…" : "Save settings"}
              onPress={handleSave}
              disabled={saving}
            />

            {saved ? (
              <Text className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                System settings saved successfully.
              </Text>
            ) : null}
          </>
        )}
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
            - {x}
          </Text>
        ))}
      </View>

      <View className="mt-4">
        <AppButton
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
          variant="secondary"
          onPress={toggleTheme}
        />
      </View>
    </Screen>
  );
}
