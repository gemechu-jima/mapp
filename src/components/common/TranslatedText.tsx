import React, { Children, type ReactNode } from 'react';
import { Text as NativeText, TextInput as NativeTextInput, type TextProps, type TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { translateUiText } from '@/i18n/uiTranslations';

function translateChild(child: ReactNode, language: string): ReactNode {
  return Children.map(child, (part) => typeof part === 'string' ? translateUiText(part, language) : part);
}

export function TranslatedText({ children, ...props }: TextProps) {
  const { i18n } = useTranslation();
  return <NativeText {...props}>{translateChild(children, i18n.resolvedLanguage || i18n.language || 'en')}</NativeText>;
}

export function TranslatedTextInput(props: TextInputProps) {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || 'en';
  return <NativeTextInput {...props}
    placeholder={props.placeholder ? translateUiText(props.placeholder, language) : props.placeholder}
    accessibilityLabel={props.accessibilityLabel ? translateUiText(props.accessibilityLabel, language) : props.accessibilityLabel}
  />;
}
