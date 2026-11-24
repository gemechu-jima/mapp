import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import {
  TranslatedText as Text,
  TranslatedTextInput as TextInput,
} from "@/components/common/TranslatedText";

export interface SearchProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Optional debounce delay in ms (default: 0 for instant local filtering) */
  debounceMs?: number;
  /** Optional filtered count to display on the right (e.g., "12 results") */
  resultCount?: number;
  /** Optional extra className for outer spacing */
  className?: string;
}

export default function Search({
  value,
  onChangeText,
  placeholder = "Search…",
  debounceMs = 0,
  resultCount,
  className = "mb-3",
}: SearchProps) {
  const [internalValue, setInternalValue] = useState(value);

  // Sync external resets (e.g., when parent clears search)
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounce updates if debounceMs > 0
  useEffect(() => {
    if (debounceMs <= 0) return;
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChangeText(internalValue);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [internalValue, debounceMs]);

  const handleChange = (text: string) => {
    setInternalValue(text);
    if (debounceMs <= 0) {
      onChangeText(text);
    }
  };

  const handleClear = () => {
    setInternalValue("");
    onChangeText("");
  };

  return (
    <View className={className}>
      <View className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900">
        <Text className="mr-2 text-sm text-slate-400">🔍</Text>

        <TextInput
          value={internalValue}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          className="flex-1 text-sm text-slate-900 dark:text-white"
        />

        {typeof resultCount === "number" && internalValue.trim().length > 0 ? (
          <Text className="mr-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            {resultCount}
          </Text>
        ) : null}

        {internalValue.length > 0 ? (
          <Pressable
            onPress={handleClear}
            hitSlop={8}
            className="h-6 w-6 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
          >
            <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">
              ✕
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Generic hook to filter any array of items across multiple fields or a custom selector.
 */
export function useSearch<T>(
  items: T[],
  getSearchableValues: (item: T) => Array<string | number | null | undefined>,
  initialQuery = ""
) {
  const [query, setQuery] = useState(initialQuery);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) =>
      getSearchableValues(item).some(
        (val) => val != null && String(val).toLowerCase().includes(q)
      )
    );
  }, [items, query]);

  return {
    query,
    setQuery,
    filteredItems,
    clearQuery: () => setQuery(""),
  };
}