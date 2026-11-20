import { Link, router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  View,
  TextInput as RNTextInput,
} from "react-native";

import PublicHeader from "@/components/common/PublicHeader";
import {
  TranslatedText as Text,
  TranslatedTextInput as TextInput,
} from "@/components/common/TranslatedText";
import { translateUiText } from "@/i18n/uiTranslations";
import { loginUser } from "@/services/auth.service";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [activationCode, setActivationCode] = useState<string>("");
  const [requiresActivation, setRequiresActivation] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const { t, i18n } = useTranslation();
  const { login } = useAuth();

  const notify = (message: string) =>
    Platform.OS === "web"
      ? window.alert(message)
      : Alert.alert("Bingo", message);

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    // Reset activation toggle if the user switches to a different phone number
    if (requiresActivation) {
      setRequiresActivation(false);
      setActivationCode("");
    }
  };

  async function handleLogin() {
    if (!phoneNumber.trim()) {
      notify(t("auth.phoneNumber"));
      return;
    }

    if (requiresActivation && !activationCode.trim()) {
      notify(
        translateUiText(
          "Please enter the activation code provided by Admin.",
          i18n.language,
        ),
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser(
        phoneNumber.trim(),
        requiresActivation ? activationCode.trim() : undefined,
      );

      login(response.user, response.token);

      if (response.user.role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/(player)/dashboard");
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Login failed:", error);
      const status = error?.response?.status;
      const data = error?.response?.data;

      // Toggle on the Activation Code box whenever backend returns 403 or requiresActivation
      if (status === 403 || data?.requiresActivation) {
        setRequiresActivation(true);
        notify(
          data?.message ||
            translateUiText(
              "First-time login requires an activation code from Admin.",
              i18n.language,
            ),
        );
        return;
      }

      const message =
        data?.message ??
        error?.message ??
        translateUiText("Login failed. Please try again.", i18n.language);
      notify(message);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-white px-6 pt-8 dark:bg-slate-950"
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <PublicHeader />

      <Text className="mb-2 pb-4 text-center text-3xl font-bold capitalize text-slate-900 dark:text-white">
        login
      </Text>

      {/* Phone Number Field */}
      <Text className="mb-2 text-slate-900 dark:text-white">
        {t("auth.phoneNumber")}
      </Text>

      <TextInput
        value={phoneNumber}
        onChangeText={handlePhoneChange}
        placeholder={t("auth.phoneNumber")}
        keyboardType="phone-pad"
        autoComplete="tel"
        className="mb-4 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />

      {/* Activation Code Field — Only toggled on when backend reports user is pending activation */}
      {requiresActivation && (
        <View className="mb-4 rounded-xl border border-amber-300 bg-amber-50/70 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <Text className="mb-1 text-sm font-semibold text-amber-800 dark:text-amber-300">
            Account Activation Required (First Login)
          </Text>
          <Text className="mb-3 text-xs text-amber-700 dark:text-amber-400">
            Enter the 6-digit activation code given to you by Admin. Next time
            you will log in with your phone number only.
          </Text>

          <RNTextInput
            value={activationCode}
            onChangeText={setActivationCode}
            placeholder="Enter 6-digit activation code"
            keyboardType="number-pad"
            maxLength={6}
            className="rounded-xl border border-amber-400 bg-white px-4 py-3 text-center text-lg font-bold tracking-widest text-slate-900 dark:border-amber-700 dark:bg-slate-900 dark:text-white"
          />
        </View>
      )}

      <Pressable
        onPress={handleLogin}
        disabled={isLoading}
        style={({ pressed }) => ({
          opacity: isLoading ? 0.6 : pressed ? 0.8 : 1,
        })}
        className="rounded-xl bg-blue-600 py-4"
      >
        <Text className="text-center font-bold text-white">
          {isLoading
            ? "Logging in..."
            : requiresActivation
              ? "Activate & Login"
              : t("auth.loginButton")}
        </Text>
      </Pressable>

      <View className="mt-6 flex-row items-center justify-center">
        <Text className="text-slate-700 dark:text-slate-300">
          {t("auth.noAccount")}{" "}
        </Text>

        <Link
          href="/auth/register"
          className="font-semibold text-blue-600 dark:text-blue-400"
        >
          {t("auth.createAccount")}
        </Link>
      </View>
    </ScrollView>
  );
}
