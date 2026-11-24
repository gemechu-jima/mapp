import { useEffect, useState } from "react";
import { Alert, Platform, View } from "react-native";
import { router } from "expo-router";
import Screen from "@/components/ui/Screen";
import AppButton from "@/components/ui/AppButton";
import StatusPill from "@/components/ui/StatusPill";
import {
  TranslatedText as Text,
  TranslatedTextInput as TextInput,
} from "@/components/common/TranslatedText";
import { useAuth } from "@/context/AuthContext";
import { usePreferences } from "@/context/PreferencesContext";
import { UserService } from "@/services/user.service";

export default function AdminProfile() {
  const { user, logout, login, token } = useAuth();
  const { isDark, toggleTheme } = usePreferences();

  const [name, setName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [role, setRole] = useState(user?.role || "ADMIN");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const notify = (title: string, msg: string) =>
    Platform.OS === "web"
      ? window.alert(`${title}\n${msg}`)
      : Alert.alert(title, msg);

  // Sync whenever user session updates
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhoneNumber(user.phone);
      if (user.role) setRole(user.role);
    }
  }, [user]);

  // 1. Fetch latest admin profile from GET /users/me
  useEffect(() => {
    let alive = true;
    UserService.profile(user?.id)
      .then((res: any) => {
        if (!alive) return;
        const profile = res?.user || res?.data || res;
        if (profile?.name) setName(profile.name);
        if (profile?.phone) setPhoneNumber(profile.phone);
        if (profile?.role) setRole(profile.role);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [user?.id]);

  // 2. Save updates to PATCH /users/me (matches userService.updateProfile)
  const handleSaveProfile = async () => {
    const cleanName = name.trim();
    const cleanPhone = phoneNumber.trim();

    if (cleanName.length <= 3) {
      notify("Invalid name", "Full name must be greater than 3 characters.");
      return;
    }

    if (!cleanPhone) {
      notify("Invalid phone", "Phone number is required.");
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      const res = await UserService.updateProfile({
        name: cleanName,
        phoneNumber: cleanPhone,
      });

      const updatedUser = res?.user;
      if (updatedUser) {
        setName(updatedUser.name);
        setPhoneNumber(updatedUser.phone);
        setRole(updatedUser.role);
        if (login) {
          login(updatedUser, res?.token || token || "");
        }
      }

      setSaved(true);
    } catch (e: any) {
      notify(
        "Update failed",
        e?.response?.data?.message ?? "Could not update admin profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // 3. Sign out confirmation
  const handleLogout = async () => {
    const proceed = async () => {
      if (typeof logout === "function") {
        await logout();
      }
      router.replace("/auth/login");
    };

    if (Platform.OS === "web") {
      if (window.confirm("Sign out of your admin account?")) {
        await proceed();
      }
    } else {
      Alert.alert("Sign out", "Sign out of your admin account?", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign out", style: "destructive", onPress: () => proceed() },
      ]);
    }
  };

  const initials = (name || "AD")
    .split(/\s+/)
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <Screen
      title="Admin profile"
      subtitle="Manage your administrator account details, appearance, and session."
    >
      {/* Account Overview Header Card */}
      <View className="mb-4 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-600">
            <Text className="text-base font-extrabold text-white">
              {initials || "AD"}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-base font-bold text-slate-900 dark:text-white"
            >
              {name || "Administrator"}
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {phoneNumber || "No phone number"} · ID #{user?.id ?? "—"}
            </Text>
          </View>
        </View>
        <StatusPill status={role || "ADMIN"} />
      </View>

      {/* Editable Profile Form */}
      <View className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
          Personal details
        </Text>

        {loading ? (
          <Text className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading profile…
          </Text>
        ) : (
          <>
            <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Full name
            </Text>
            <TextInput
              value={name}
              onChangeText={(v) => {
                setName(v);
                setSaved(false);
              }}
              placeholder="Enter full name"
              className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

            <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Phone number
            </Text>
            <TextInput
              value={phoneNumber}
              onChangeText={(v) => {
                setPhoneNumber(v);
                setSaved(false);
              }}
              placeholder="09..."
              keyboardType="phone-pad"
              className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

            <AppButton
              title={saving ? "Saving…" : "Update profile"}
              onPress={handleSaveProfile}
              disabled={saving}
            />

            {saved ? (
              <Text className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Profile updated successfully.
              </Text>
            ) : null}
          </>
        )}
      </View>

      {/* Quick Admin Shortcuts & Preferences */}
      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
          Workspace & preferences
        </Text>

        <View className="gap-2.5">
          <AppButton
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
            variant="secondary"
            onPress={toggleTheme}
          />
          <AppButton
            title="System settings"
            variant="secondary"
            onPress={() => router.push("/admin/settings")}
          />
          <AppButton
            title="Sign out"
            variant="secondary"
            onPress={handleLogout}
          />
        </View>
      </View>
    </Screen>
  );
}