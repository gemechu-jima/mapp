import { type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Plus, ChevronRight } from "lucide-react-native";
import Screen from "@/components/ui/Screen";
import AppButton from "@/components/ui/AppButton";
import StatusPill from "@/components/ui/StatusPill";
import StatCard from "@/components/ui/StatCard";
import SectionTitle from "@/components/ui/SectionTitle";
import Search, { useSearch } from "@/features/shared/Search";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
export type RecordItem = {
  id: string | number;
  title: string;
  subtitle: string;
  status: string;
  detail?: string;
};
type Props = {
  title: string;
  subtitle: string;
  stats?: { label: string; value: string | number; icon: string }[];
  records: RecordItem[];
  searchPlaceholder?: string;
  actionLabel?: string;
  onAction?: () => void;
  onSelect?: (item: RecordItem) => void;
  emptyText?: string;
  children?: ReactNode;
};
export default function ManagementList({
  title,
  subtitle,
  stats = [],
  records,
  searchPlaceholder = "Search records",
  actionLabel,
  onAction,
  onSelect,
  emptyText = "No records to display yet.",
  children,
}: Props) {
  const { query, setQuery, filteredItems: filtered } = useSearch(
    records,
    (r) => [r.title, r.subtitle, r.status, r.detail],
  );
  return (
    <Screen title={title} subtitle={subtitle}>
      <View className="mb-4 flex-row flex-wrap gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </View>
      {children}
      <Search
        value={query}
        onChangeText={setQuery}
        placeholder={searchPlaceholder}
        resultCount={filtered.length}
        className="mb-4"
      />
      {actionLabel ? (
        <AppButton
          title={actionLabel}
          icon={<Plus size={17} color="white" />}
          onPress={onAction}
          className="mb-4"
        />
      ) : null}
      <SectionTitle
        title="Records"
        caption={`${filtered.length} item${filtered.length === 1 ? "" : "s"}`}
      />
      {filtered.length === 0 ? (
        <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 dark:border-slate-700 dark:bg-slate-900">
          <Text className="text-base font-semibold text-slate-800 dark:text-white">
            {emptyText}
          </Text>
          <Text className="mt-2 text-center text-sm text-slate-500">
            Data will appear here when available from your backend.
          </Text>
        </View>
      ) : (
        filtered.map((item) => (
          <Pressable
            key={String(item.id)}
            onPress={() => onSelect?.(item)}
            className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <View className="flex-row items-start gap-3">
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </Text>
                <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {item.subtitle}
                </Text>
                {item.detail ? (
                  <Text className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {item.detail}
                  </Text>
                ) : null}
                <View className="mt-3">
                  <StatusPill status={item.status} />
                </View>
              </View>
              <ChevronRight size={20} color="#94a3b8" />
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
