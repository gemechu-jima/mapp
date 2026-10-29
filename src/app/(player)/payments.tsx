import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import Screen from "@/components/ui/Screen";
import AppButton from "@/components/ui/AppButton";
import FeatureNotice from "@/features/shared/FeatureNotice";
import StatusPill from "@/components/ui/StatusPill";
import { Alert } from "react-native";
import {api} from "@/services/api";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
import { TranslatedTextInput as TextInput } from "@/components/common/TranslatedText";
import { paymentOptions } from "@/shared/paymentOptions";
import ImageUpload from "@/components/ImageUpload";
export default function PlayerPayments() {
  const params = useLocalSearchParams<{
    gameTitle?: string;
    numbers?: string;
    number?: string;
    reservationId?: string;
  }>();
  const selectedNumbers = (params.numbers || params.number || "")
    .split(",")
    .filter(Boolean);
  const [provider, setProvider] = useState("CBE");
  const [reference, setReference] = useState("");
  const [proof, setProof] = useState<string | null>(null);
const [submitting, setSubmitting] = useState(false);
  const selectedPayment = paymentOptions.find(
  (option) => option.type === provider
);





const handlePayment = async () => {
  if (!params.reservationId) {
    Alert.alert("Error", "Reservation not found.");
    return;
  }

  if (!selectedPayment) {
    Alert.alert("Error", "Please select a payment provider.");
    return;
  }

  if (!proof) {
    Alert.alert("Missing proof", "Please upload your payment screenshot.");
    return;
  }

  try {
    setSubmitting(true);

    const formData = new FormData();

    formData.append("provider", selectedPayment.type);
    formData.append("reservationId", String(params.reservationId));

    // React Native needs file metadata for multipart uploads.
    formData.append("proof", {
      uri: proof,
      name: `payment-proof-${Date.now()}.jpg`,
      type: "image/jpeg",
    } as any);

    const response = await api.post(
      `/reservations/${params.reservationId}/payment-proofs`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    Alert.alert(
      "Payment submitted",
      "Your payment proof was submitted successfully. Please wait for admin verification."
    );

    // Optionally refresh reservations/payment status here.
  } catch (error: any) {
    console.error("Payment submission failed:", error);

    Alert.alert(
      "Submission failed",
      error?.response?.data?.message ??
        "Could not submit your payment proof. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
};
  return (
    <Screen
      title="Payments"
      subtitle="Record a manual transfer and submit its proof for admin verification."
    >
      <FeatureNotice
        title="Manual payment workflow"
        body="Transfer the amount using the account details provided by the game administrator. This screen does not process or fake a payment. Actual proof upload and provider integration will be connected to your backend."
      />
      <View className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {params.gameTitle || selectedNumbers.length || params.reservationId ? (
          <View className="mb-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
            <Text className="font-semibold text-slate-900 dark:text-white">
              {params.gameTitle || "Reservation payment"}
            </Text>
            {selectedNumbers.length ? (
              <Text className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Numbers: {selectedNumbers.join(", ")}
              </Text>
            ) : null}
            {params.reservationId ? (
              <Text className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Reservation #{params.reservationId}
              </Text>
            ) : null}
            <Text className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              Estimated amount: {selectedNumbers.length * 100} ETB
            </Text>
          </View>
        ) : null}
        <Text className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
          Submit payment proof
        </Text>
        <Text className="mb-2 text-sm text-slate-600 dark:text-slate-300">
          Payment provider
        </Text>

        <View className="mb-4 flex-row flex-wrap gap-2">
          {paymentOptions.map((p) => (
            <AppButton
              key={p.type}
              title={p.type}
              variant={provider === p.type ? "primary" : "secondary"}
              onPress={() => setProvider(p.type)}
            />
          ))}
        </View>

        {selectedPayment && (
          <View className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
            <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
              {selectedPayment.type} Payment Information
            </Text>

            <Text className="mb-1 text-sm text-slate-500 dark:text-slate-400">
              Account Holder
            </Text>
            <Text className="mb-3 text-base font-semibold text-slate-900 dark:text-white">
              {selectedPayment.label}
            </Text>

            <Text className="mb-1 text-sm text-slate-500 dark:text-slate-400">
              Account Number
            </Text>
            <Text className="text-lg font-bold text-blue-600">
              {selectedPayment.number}
            </Text>
          </View>
        )}

        <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Transaction reference
        </Text>
        <TextInput
          value={reference}
          onChangeText={setReference}
          placeholder="Enter transaction/reference number"
          placeholderTextColor="#94a3b8"
          className="mb-3 rounded-xl border border-slate-200 px-4 py-3 text-slate-900 dark:border-slate-700 dark:text-white"
        />
        <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Screenshot file name (temporary UI)
        </Text>
        <ImageUpload
          value={proof || null}
          onChange={setProof}
          label="Payment proof"
          placeholder="Select your payment screenshot"
        />
       <AppButton
        title={submitting ? "Submitting..." : "Submit Payment"}
        onPress={handlePayment}
        disabled={submitting}
        />    
        {submitting ? (
          <View className="mt-4">
            <StatusPill status="UNDER_REVIEW" />
            <Text className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Demo state: {provider} proof is marked for review locally. Backend
              integration is still required.
            </Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
