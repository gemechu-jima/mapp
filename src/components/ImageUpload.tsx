
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface ImageUploadProps {
  value: string | null;
  onChange: (uri: string | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  label = "Upload image",
  placeholder = "Select an image from your device",
  disabled = false,
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const selectImage = async () => {
    try {
      setLoading(true);

      const permission =await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        onChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image selection failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="mb-4">
      <Text className="mb-2 font-medium text-slate-800 dark:text-white">
        {label}
      </Text>

      {value ? (
        <View className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <Pressable
            onPress={() => setPreviewVisible(true)}
            accessibilityLabel="Preview selected image"
          >
            <Image
              source={{ uri: value }}
              className="h-48 w-full rounded-lg"
              resizeMode="contain"
            />
          </Pressable>

          <View className="mt-3 flex-row gap-3">
            <Pressable
              onPress={selectImage}
              disabled={disabled || loading}
              className="flex-1 items-center rounded-lg bg-blue-600 px-3 py-3"
            >
              <Text className="font-semibold text-white">
                Change image
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onChange(null)}
              disabled={disabled || loading}
              className="items-center rounded-lg bg-red-100 px-4 py-3 dark:bg-red-950"
            >
              <Text className="font-semibold text-red-600 dark:text-red-300">
                Remove
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={selectImage}
          disabled={disabled || loading}
          className="items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 dark:border-slate-700 dark:bg-slate-900"
        >
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : (
            <>
              <Text className="mb-2 text-3xl">☁️</Text>
              <Text className="mb-1 font-semibold text-slate-800 dark:text-white">
                {label}
              </Text>
              <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
                {placeholder}
              </Text>
              <Text className="mt-3 font-medium text-blue-600">
                Browse images
              </Text>
            </>
          )}
        </Pressable>
      )}

      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/90 px-4">
          <Pressable
            onPress={() => setPreviewVisible(false)}
            className="mb-4 self-end rounded-lg bg-white px-4 py-2"
          >
            <Text className="font-semibold text-slate-900">Close ✕</Text>
          </Pressable>

          {value ? (
            <Image
              source={{ uri: value }}
              className="h-3/4 w-full"
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
