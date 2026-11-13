import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, ScrollView, View } from 'react-native';

import PublicHeader from '@/components/common/PublicHeader';
import {
  TranslatedText as Text,
  TranslatedTextInput as TextInput,
} from '@/components/common/TranslatedText';
import { translateUiText } from '@/i18n/uiTranslations';
import { loginUser } from '@/services/auth.service';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const { login } = useAuth();

  const notify = (message: string) =>
    Platform.OS === 'web' ? window.alert(message) : Alert.alert('Bingo', message);

  async function handleLogin() {
    if (!phoneNumber.trim()) {
      notify(t('auth.phoneNumber'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser(phoneNumber.trim());

      login(response.user, response.token);

      if (response.user.role === 'ADMIN') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(player)/dashboard');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      const message =
        error?.response?.data?.message ??
        error?.message ??
        translateUiText('Login failed. Please try again.', i18n.language);
      notify(message);
    } finally {
      setIsLoading(false);
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
        {t('auth.loginDescription')}
      </Text>

      <Text className="mb-2 text-slate-900 dark:text-white">
        {t('auth.phoneNumber')}
      </Text>

      <TextInput
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder={t('auth.phoneNumber')}
        keyboardType="phone-pad"
        autoComplete="tel"
        className="mb-6 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />

      <View
        style={{ opacity: isLoading ? 0.6 : 1 }}
        className="rounded-xl bg-blue-600"
      >
        <Text
          onPress={isLoading ? undefined : handleLogin}
          className="py-4 text-center font-bold text-white"
        >
          {isLoading ? 'Logging in...' : t('auth.loginButton')}
        </Text>
      </View>

      <View className="mt-6 flex-row items-center justify-center">
        <Text className="text-slate-700 dark:text-slate-300">
          {t('auth.noAccount')}{' '}
        </Text>

        <Link
          href="/auth/register"
          className="font-semibold text-blue-600 dark:text-blue-400"
        >
          {t('auth.createAccount')}
        </Link>
      </View>
    </ScrollView>
  );
}
