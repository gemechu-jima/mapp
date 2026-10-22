import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../../context/PreferencesContext';

import { TranslatedText as Text } from '@/components/common/TranslatedText';
const languages = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'አማርኛ' },
  { code: 'or', label: 'Afaan Oromoo' },
];

export default function PublicHeader({ compact = false }: { compact?: boolean }) {
  const { isDark, toggleTheme } = usePreferences();
  const { i18n } = useTranslation();
  const [showLanguages, setShowLanguages] = useState(false);
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const buttonStyle = isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-slate-100';
  const currentLanguage = languages.find((item) => item.code === (i18n.resolvedLanguage || i18n.language))?.code ?? 'en';

  return (
    <View className={`${compact ? 'flex-row items-center gap-1' : 'z-10 mb-8 flex-row justify-end gap-3'}`}>
      <View className="z-30">
        <Pressable accessibilityRole="button" accessibilityLabel="Choose language" onPress={() => setShowLanguages((previous) => !previous)} className={`rounded-xl border ${compact ? 'px-2 py-2' : 'px-4 py-3'} ${buttonStyle}`}>
          <Text className={`${textColor} ${compact ? 'text-xs font-semibold' : ''}`}>🌐 {currentLanguage.toUpperCase()} ▾</Text>
        </Pressable>
        {showLanguages && (
          <View className={`absolute right-0 top-12 z-50 min-w-36 rounded-xl border p-2 shadow-lg ${buttonStyle}`}>
            {languages.map((language) => (
              <Pressable key={language.code} onPress={() => { void i18n.changeLanguage(language.code); setShowLanguages(false); }} className="rounded-lg px-3 py-3">
                <Text className={textColor}>{language.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
      {!compact ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Toggle color theme" onPress={toggleTheme} className={`rounded-xl border px-4 py-3 ${buttonStyle}`}>
          <Text className={textColor}>{isDark ? '☀️ Light' : '🌙 Dark'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}