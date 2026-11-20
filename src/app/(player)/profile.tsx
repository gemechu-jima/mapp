import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { UserService } from "@/services/user.service";
import Screen from "@/components/ui/Screen";
import AppButton from "@/components/ui/AppButton";
import FeatureNotice from "@/features/shared/FeatureNotice";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
import { TranslatedTextInput as TextInput } from "@/components/common/TranslatedText";
export default function ProfileScreen() {
  const { user, token, login, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveProfile = async () => {
    const cleanName = (name || "").trim();
    const cleanPhone = (phone || "").trim();

    if (!cleanName) {
      setErrorMsg("Full name is required.");
      return;
    }
    // Require at least first name and last name (2 words)
    const nameParts = cleanName.split(/\s+/);
    if (nameParts.length < 2) {
      setErrorMsg("Please enter both your first name and last name.");
      return;
    }
    const validPhoneNumber = /^(?:0\d{9}|251\d{9})$/;
    if (!validPhoneNumber.test(cleanPhone)) {
      setErrorMsg(
        "Enter a valid phone number (10 digits starting with 0, or 12 digits starting with 251).",
      );
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const res = await UserService.updateProfile({
        name: cleanName,
        phoneNumber: cleanPhone,
      });

      // Update AuthContext & persisted storage so changes remain after reload
      if (res?.user) {
        login(res.user, res.token || token || "");
        setName(res.user.name);
        setPhone(res.user.phone);
      }

      setEditing(false);
      setSaved(true);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Screen
      title="My profile"
      subtitle="View and update your player profile details."
    >
      <View className="items-center rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
          <Text className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            {name?.trim().charAt(0).toUpperCase() || "P"}
          </Text>
        </View>
        <Text className="text-xl font-bold text-slate-900 dark:text-white">
          {name}
        </Text>
        <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {user?.role || "PLAYER"}
        </Text>
      </View>
      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Full name
        </Text>
        <TextInput
          editable={editing}
          value={name}
          onChangeText={setName}
          className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Phone number
        </Text>
        <TextInput
          editable={editing}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Account role
        </Text>
        <View className="mb-4 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
          <Text className="text-slate-700 dark:text-slate-200">
            {user?.role || "PLAYER"}
          </Text>
        </View>
        {editing ? (
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
          <Text className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
            Profile updated successfully.
          </Text>
        ) : null}
      </View>
      <View className="mt-4 gap-2">
        <AppButton
          title="Settings"
          variant="secondary"
          onPress={() => router.push("/(player)/settings")}
        />
        <AppButton
          title="Log out"
          variant="danger"
          onPress={() => {
            logout();
            router.replace("/auth/login");
          }}
        />
      </View>
      <View className="mt-4">
        <FeatureNotice
          title="Privacy"
          body="Public reservation lists should show only safe display names and reservation details. Phone numbers and payment proof are private."
        />
      </View>
    </Screen>
  );
}
