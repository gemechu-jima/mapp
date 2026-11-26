import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { usePreferences } from "@/context/PreferencesContext";
import { UserService } from "@/services/user.service";
import Screen from "@/components/ui/Screen";
import AppButton from "@/components/ui/AppButton";
import StatusPill from "@/components/ui/StatusPill";
import FeatureNotice from "@/features/shared/FeatureNotice";
import {
  TranslatedText as Text,
  TranslatedTextInput as TextInput,
} from "@/components/common/TranslatedText";

export type SharedProfileProps = {
  mode?: "player" | "admin";
};

export default function ProfileScreen({
  mode = "player",
}: SharedProfileProps) {
  const isAdmin = mode === "admin";
  const { user, token, login, logout } = useAuth();
  const { isDark, toggleTheme } = usePreferences();

  const [editing, setEditing] = useState(isAdmin);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [role, setRole] = useState(user?.role || (isAdmin ? "ADMIN" : "PLAYER"));
  const [loading, setLoading] = useState(isAdmin);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const notify = (title: string, msg: string) =>
    Platform.OS === "web"
      ? window.alert(`${title}\n${msg}`)
      : Alert.alert(title, msg);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.role) setRole(user.role);
    }
  }, [user]);

  useEffect(() => {
    let alive = true;
    UserService.profile(user?.id)
      .then((res: any) => {
        if (!alive) return;
        const profile = res?.user || res?.data || res;
        if (profile?.name) setName(profile.name);
        if (profile?.phone) setPhone(profile.phone);
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

  const handleSaveProfile = async () => {
    const cleanName = (name || "").trim();
    const cleanPhone = (phone || "").trim();

    if (!cleanName) {
      const msg = "Full name is required.";
      if (isAdmin) notify("Invalid name", msg);
      else setErrorMsg(msg);
      return;
    }

    const nameParts = cleanName.split(/\s+/);
    if (!isAdmin && nameParts.length < 2) {
      setErrorMsg("Please enter both your first name and last name.");
      return;
    }
    if (isAdmin && cleanName.length <= 3) {
      notify("Invalid name", "Full name must be greater than 3 characters.");
      return;
    }

    const validPhoneNumber = /^(?:0\d{9}|251\d{9})$/;
    if (!validPhoneNumber.test(cleanPhone)) {
      const msg =
        "Enter a valid phone number (10 digits starting with 0, or 12 digits starting with 251).";
      if (isAdmin) notify("Invalid phone", msg);
      else setErrorMsg(msg);
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      setSaved(false);

      const res = await UserService.updateProfile({
        name: cleanName,
        phoneNumber: cleanPhone,
      });

      const updatedUser = res?.user;
      if (updatedUser) {
        setName(updatedUser.name);
        setPhone(updatedUser.phone);
        if (updatedUser.role) setRole(updatedUser.role);
        login(updatedUser, res?.token || token || "");
      }

      if (!isAdmin) setEditing(false);
      setSaved(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to update profile.";
      if (isAdmin) notify("Update failed", msg);
      else setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const proceed = async () => {
      await logout();
      router.replace("/auth/login");
    };

    if (!isAdmin) {
      await proceed();
      return;
    }

    if (Platform.OS === "web") {
      if (window.confirm("Sign out of your admin account?")) {
        await proceed();
      }
    } else {
      Alert.alert("Sign out", "Sign out of your admin account?", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign out", style: "destructive", onPress: () => void proceed() },
      ]);
    }
  };

  const initials = (name || (isAdmin ? "AD" : "P"))
    .split(/\s+/)
    .slice(0, isAdmin ? 2 : 1)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <Screen
      title={isAdmin ? "Admin profile" : "My profile"}
      subtitle={
        isAdmin
          ? "Manage your administrator account details, appearance, and session."
          : "View and update your player profile details."
      }
    >
      {isAdmin ? (
        <View className="mb-4 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <View className="flex-1 flex-row items-center gap-3">
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
                {phone || "No phone number"} · ID #{user?.id ?? "—"}
              </Text>
            </View>
          </View>
          <StatusPill status={role || "ADMIN"} />
        </View>
      ) : (
        <View className="items-center rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
            <Text className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {initials || "P"}
            </Text>
          </View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">
            {name}
          </Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {role || "PLAYER"}
          </Text>
        </View>
      )}

      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {isAdmin ? (
          <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
            Personal details
          </Text>
        ) : null}

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
              editable={isAdmin || editing}
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
              editable={isAdmin || editing}
              value={phone}
              onChangeText={(v) => {
                setPhone(v);
                setSaved(false);
              }}
              placeholder="09..."
              keyboardType="phone-pad"
              className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

            {!isAdmin ? (
              <>
                <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Account role
                </Text>
                <View className="mb-4 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
                  <Text className="text-slate-700 dark:text-slate-200">
                    {role || "PLAYER"}
                  </Text>
                </View>
              </>
            ) : null}

            {isAdmin ? (
              <AppButton
                title={saving ? "Saving…" : "Update profile"}
                onPress={handleSaveProfile}
                disabled={saving}
              />
            ) : editing ? (
              <View className="gap-2">
                <AppButton
                  title={saving ? "Saving..." : "Save profile"}
                  onPress={handleSaveProfile}
                  disabled={saving}
                />
                <AppButton
                  title="Cancel editing"
                  variant="secondary"
                  onPress={() => {
                    setName(user?.name || "");
                    setPhone(user?.phone || "");
                    setErrorMsg(null);
                    setEditing(false);
                  }}
                />
              </View>
            ) : (
              <AppButton
                title="Edit profile"
                onPress={() => {
                  setEditing(true);
                  setSaved(false);
                  setErrorMsg(null);
                }}
              />
            )}

            {errorMsg ? (
              <Text className="mt-3 text-sm text-red-600 dark:text-red-400">
                {errorMsg}
              </Text>
            ) : null}
            {saved ? (
              <Text className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Profile updated successfully.
              </Text>
            ) : null}
          </>
        )}
      </View>

      {isAdmin ? (
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
              onPress={() => void handleLogout()}
            />
          </View>
        </View>
      ) : (
        <>
          <View className="mt-4 gap-2">
            <AppButton
              title="Settings"
              variant="secondary"
              onPress={() => router.push("/(player)/settings")}
            />
            <AppButton
              title="Log out"
              variant="danger"
              onPress={() => void handleLogout()}
            />
          </View>
          <View className="mt-4">
            <FeatureNotice
              title="Privacy"
              body="Public reservation lists should show only safe display names and reservation details. Phone numbers and payment proof are private."
            />
          </View>
        </>
      )}
    </Screen>
  );
}
