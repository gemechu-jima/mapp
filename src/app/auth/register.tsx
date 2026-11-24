import { registerUser, registerUserSMS } from "@/services/auth.service";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Platform,
  Pressable,
  View,
  ImageBackground,
  ScrollView,
} from "react-native";
import PublicHeader from "../../components/common/PublicHeader";
import { useTranslation } from "react-i18next";
import { translateUiText } from "@/i18n/uiTranslations";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
import { TranslatedTextInput as TextInput } from "@/components/common/TranslatedText";
export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { i18n } = useTranslation();
  const notify = (message: string) => {
    const localized = translateUiText(message, i18n.language);
    if (Platform.OS === "web") window.alert(localized);
    else Alert.alert("Bingo", localized);
  };

  const handleRegister = async () => {
    if (firstName.trim().length <= 3) {
      notify("First name must be greater than 3 characters.");
      return;
    }
    if (lastName.trim().length <= 3) {
      notify("Last name must be greater than 3 characters.");
      return;
    }

    const cleanPhone = phoneNumber.trim();
    const validPhoneNumber = /^(?:0\d{9}|251\d{9})$/;

    if (!validPhoneNumber.test(cleanPhone)) {
      notify(
        "Invalid phone number. Use 10 digits starting with 0 (e.g. 0912345678) or 12 digits starting with 251 (e.g. 251912345678).",
      );
      return;
    }
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await registerUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: cleanPhone,
      });

      if (response.success) {
        notify(
          response?.message ||
            "Registration successful. Please get your activation code from message to log in.",
        );
        router.replace("/auth/login");
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message;

      if (status === 409) {
        notify(
          backendMessage ||
            "This phone number is already registered. Please log in.",
        );
        router.replace("/auth/login");
      } else {
        notify(
          backendMessage ||
            error?.message ||
            "Registration failed. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/cover.png")}
      resizeMode="cover"
      blurRadius={14}
      className="flex-1"
    >
      {/* Tint overlay so text & card always have crisp contrast */}
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
          {/* Centered Frosted Card */}
          <View className="mx-auto w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
            <PublicHeader />

            <Text className="mt-2 pb-1 text-center text-3xl font-bold text-slate-900 dark:text-white">
              Create Account
            </Text>
            <Text className="mb-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Register to reserve your lucky numbers
            </Text>

            {/* First Name */}
            <Text className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              First Name
            </Text>
            <View className="mb-4 flex-row items-center rounded-xl border border-slate-300 bg-slate-50 px-3.5 dark:border-slate-700 dark:bg-slate-800">
              <Ionicons name="person-outline" size={18} color="#64748B" />
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                className="flex-1 px-3 py-3.5 text-slate-900 dark:text-white"
              />
            </View>

            {/* Last Name */}
            <Text className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              Last Name
            </Text>
            <View className="mb-4 flex-row items-center rounded-xl border border-slate-300 bg-slate-50 px-3.5 dark:border-slate-700 dark:bg-slate-800">
              <Ionicons name="person-outline" size={18} color="#64748B" />
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                className="flex-1 px-3 py-3.5 text-slate-900 dark:text-white"
              />
            </View>

            {/* Phone Number */}
            <Text className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              Phone Number
            </Text>
            <View className="mb-6 flex-row items-center rounded-xl border border-slate-300 bg-slate-50 px-3.5 dark:border-slate-700 dark:bg-slate-800">
              <Ionicons name="call-outline" size={18} color="#64748B" />
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="09XXXXXXXX"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                importantForAutofill="yes"
                className="flex-1 px-3 py-3.5 text-slate-900 dark:text-white"
              />
            </View>

            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              style={({ pressed }) => ({
                opacity: isLoading ? 0.6 : pressed ? 0.85 : 1,
              })}
              className="rounded-xl bg-blue-600 py-4 shadow-md"
            >
              <Text className="text-center text-base font-bold text-white">
                {isLoading ? "Registering..." : "Register"}
              </Text>
            </Pressable>

            <View className="mt-6 flex-row items-center justify-center">
              <Text className="text-sm text-slate-600 dark:text-slate-300">
                Already have an account?{" "}
              </Text>
              <Link
                href="/auth/login"
                className="text-sm font-bold text-blue-600 dark:text-blue-400"
              >
                Login
              </Link>
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}
