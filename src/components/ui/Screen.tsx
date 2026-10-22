import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import AppButton from "./AppButton";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
export default function Screen({
  title,
  subtitle,
  children,
  back = true,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  back?: boolean;
}) {
  return (
    <ScrollView
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      contentContainerStyle={{ padding: 20, paddingTop: 20, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-6 flex-row items-start gap-3">
        {back ? (
          <AppButton
            title="Back"
            variant="secondary"
            icon={<ArrowLeft size={16} color="#64748b" />}
            onPress={() => router.back()}
            className="px-3"
          />
        ) : null}
        <View className="flex-1">
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {children}
    </ScrollView>
  );
}
