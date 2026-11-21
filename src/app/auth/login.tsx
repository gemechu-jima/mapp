import { Link, router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  View,
  ImageBackground,
  TextInput as RNTextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
    <ImageBackground
      source={require("../../../assets/images/cover.png")}
      resizeMode="cover"
      blurRadius={14}
      className="flex-1"
    >
      {/* Dark/Light tint overlay so text & card always have crisp contrast */}
      <View className="flex-1 bg-slate-950/60 dark:bg-slate-950/75">
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingVertical: 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Centered Glass/Elevated Login Card */}
          <View className="mx-auto w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
            <PublicHeader />

            <Text className="mt-2 pb-1 text-center text-3xl font-bold capitalize text-slate-900 dark:text-white">
              login
            </Text>
            <Text className="mb-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Sign in with your registered phone number
            </Text>

            {/* Phone Number Field */}
            <Text className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t("auth.phoneNumber")}
            </Text>

            <View className="mb-4 flex-row items-center rounded-xl border border-slate-300 bg-slate-50 px-3.5 dark:border-slate-700 dark:bg-slate-800">
              <Ionicons name="call-outline" size={18} color="#64748B" />
              <TextInput
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                placeholder={t("auth.phoneNumber")}
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                autoComplete="tel"
                className="flex-1 px-3 py-3.5 text-slate-900 dark:text-white"
              />
            </View>

            {/* Activation Code Field — Only toggled on when backend reports user is pending activation */}
            {requiresActivation && (
              <View className="mb-4 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 dark:border-amber-800 dark:bg-amber-950/50">
                <View className="mb-1 flex-row items-center gap-1.5">
                  <Ionicons name="key-outline" size={16} color="#D97706" />
                  <Text className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Account Activation Required (First Login)
                  </Text>
                </View>
                <Text className="mb-3 text-xs text-amber-700 dark:text-amber-400">
                  Enter the 6-digit activation code given to you by Admin. Next
                  time you will log in with your phone number only.
                </Text>

                <RNTextInput
                  value={activationCode}
                  onChangeText={setActivationCode}
                  placeholder="Enter 6-digit activation code"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  className="rounded-xl border border-amber-400 bg-white px-4 py-3 text-center text-lg font-bold tracking-widest text-slate-900 dark:border-amber-700 dark:bg-slate-950 dark:text-white"
                />
              </View>
            )}

            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={({ pressed }) => ({
                opacity: isLoading ? 0.6 : pressed ? 0.85 : 1,
              })}
              className="mt-1 rounded-xl bg-blue-600 py-4 shadow-md"
            >
              <Text className="text-center text-base font-bold text-white">
                {isLoading
                  ? "Logging in..."
                  : requiresActivation
                    ? "Activate & Login"
                    : t("auth.loginButton")}
              </Text>
            </Pressable>

            <View className="mt-6 flex-row items-center justify-center">
              <Text className="text-sm text-slate-600 dark:text-slate-300">
                {t("auth.noAccount")}{" "}
              </Text>

              <Link
                href="/auth/register"
                className="text-sm font-bold text-blue-600 dark:text-blue-400"
              >
                {t("auth.createAccount")}
              </Link>
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  )
}
