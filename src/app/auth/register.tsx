
import { registerUser } from '@/services/auth.service';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, View } from 'react-native';
import PublicHeader from '../../components/common/PublicHeader';
import { useTranslation } from 'react-i18next';
import { translateUiText } from '@/i18n/uiTranslations';
import { TranslatedText as Text } from '@/components/common/TranslatedText';
import { TranslatedTextInput as TextInput } from '@/components/common/TranslatedText';
export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { i18n } = useTranslation();
  const notify = (message: string) => { const localized = translateUiText(message, i18n.language);
     if (Platform.OS === 'web') window.alert(localized)
      else Alert.alert('Bingo', localized); };


  const handleRegister =async () => {
    if (!firstName.trim()) {
    notify('Please enter your first name.');
    return;
  }
      if (!lastName.trim()) {
    notify('Please enter your last name.');
    return;
  }

const cleanPhone = phoneNumber.trim();
const validPhoneNumber = /^(?:0\d{9}|251\d{9})$/;

if (!validPhoneNumber.test(cleanPhone)) {
  notify(
    'Invalid phone number. Use 10 digits starting with 0 (e.g. 0912345678) or 12 digits starting with 251 (e.g. 251912345678).'
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
          'Registration successful. Please get your activation code from Admin to log in.'
      );
      router.replace('/auth/login');
    }
  } catch (error: any) {
    const status = error?.response?.status;
    const backendMessage = error?.response?.data?.message;

    if (status === 409) {
      notify(
        backendMessage ||
          'This phone number is already registered. Please log in.'
      );
      router.replace('/auth/login');
    } else {
      notify(backendMessage || error?.message || 'Registration failed. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
  };



  return (
    <View className={`flex-1 bg-white px-6 pt-14 dark:bg-slate-950`}>
      <PublicHeader />
      <Text className="text-3xl font-bold text-slate-900 dark:text-white">
        Create Account
      </Text>



      <Text className="text-slate-900 dark:text-white">First Name</Text>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter your first name"
        autoCapitalize="words"
        className={`mb-5 rounded-xl border px-4 py-3 `}

      />

      <Text className="text-slate-900 dark:text-white">Last Name</Text>
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter your last name"
        autoCapitalize="words"
        className={`mb-5 rounded-xl border px-4 py-3 `}

      />

      <Text className="text-slate-900 dark:text-white">Phone Number</Text>
      <TextInput
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        autoComplete="tel"
        className={`mb-6 rounded-xl border px-4 py-3 `}
      />

      <Pressable
        onPress={handleRegister}
        className="items-center rounded-xl bg-blue-600 py-4"
      >
      <Text className="font-bold text-white">Register</Text>
      </Pressable>

      <View className="mt-6 flex-row justify-center">
        <Text >Already have an account? </Text>
        <Link href="/auth/login" className="font-semibold text-blue-500">
          Login
        </Link>
      </View>
    </View>
  );
}