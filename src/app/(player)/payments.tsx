import { TranslatedText as Text, TranslatedTextInput as TextInput } from "@/components/common/TranslatedText";
import ImageUpload from "@/components/ImageUpload";
import AppButton from "@/components/ui/AppButton";
import Screen from "@/components/ui/Screen";
import StatusPill from "@/components/ui/StatusPill";
import FeatureNotice from "@/features/shared/FeatureNotice";
import { api } from "@/services/api";
import { paymentOptions } from "@/shared/paymentOptions";
import { uploadToImageKit } from "@/shared/imagekitService";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Platform, View } from "react-native";

export default function PlayerPayments() {
  const params = useLocalSearchParams<{
    gameTitle?: string;
    numbers?: string;
    number?: string;
    /** Single reservation (from reservations list) */
    reservationId?: string;
    /** Comma-separated reservation IDs (from game-details after multi-select) */
    reservationIds?: string;
    gameId?: string;
  }>();

  // Support both single and multiple reservation IDs
  const reservationId = params.reservationId || params.reservationIds?.split(",")[0];
  const allReservationIds = params.reservationIds
    ? params.reservationIds.split(",").filter(Boolean)
    : params.reservationId
      ? [params.reservationId]
      : [];

  const selectedNumbers = (params.numbers || params.number || "")
    .split(",")
    .filter(Boolean);

  const [provider, setProvider] = useState("CBE");
  const [reference, setReference] = useState("");
  const [proof, setProof] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const selectedPayment = paymentOptions.find((option) => option.type === provider);

  const handlePayment = async () => {
    if (allReservationIds.length === 0) {
      Alert.alert("Error", "Reservation not found.");
      return;
    }

    if (!selectedPayment) {
      Alert.alert("Error", "Please select a payment provider.");
      return;
    }

    if (!reference.trim()) {
      Alert.alert("Missing reference", "Please enter your transaction reference number.");
      return;
    }

    if (!proof) {
      Alert.alert("Missing proof", "Please upload your payment screenshot.");
      return;
    }

    try {
      setSubmitting(true);

      const proofFileName = `payment-proof-${Date.now()}.jpg`;

      // 1. Upload payment proof to ImageKit
      const uploadedImage = await uploadToImageKit(
        {
          uri: proof,
          name: proofFileName,
          type: "image/jpeg",
        },
        {
          folder: "/payment-proofs",
          tags: ["payment-proof", selectedPayment.type],
        },
      );
      setProofUrl(uploadedImage.url);

      // 2. Prepare proof file for both Web (File/Blob) and Native ({ uri, name, type })
      let proofFile: any = {
        uri: proof,
        name: proofFileName,
        type: "image/jpeg",
      };

      if (Platform.OS === "web") {
        const res = await fetch(proof);
        const blob = await res.blob();
        proofFile = new File([blob], proofFileName, { type: blob.type || "image/jpeg" });
      }

      // 3. Submit proof for each reservation (usually just one, but supports multi)
      for (const resId of allReservationIds) {
        const formData = new FormData();
        formData.append("provider", selectedPayment.type);
        formData.append("reservationId", resId);
        formData.append("numberId", resId);
        formData.append("transactionReference", reference.trim());
        formData.append("proofUrl", uploadedImage.url);
        formData.append("proof", proofFile);

        await api.post(
          `/numbers/${resId}/payment-proofs`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      }

      setSubmitted(true);
      Alert.alert(
        "Payment submitted",
        "Your payment proof was submitted successfully. Please wait for admin verification.",
        [{ text: "OK", onPress: () => router.replace("/(player)/reservations") }],
      );
    } catch (error: any) {
      console.error("Payment submission failed:", error);
      Alert.alert(
        "Submission failed",
        error?.response?.data?.message ??
        "Could not submit your payment proof. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      title="Submit Payment"
      subtitle="Transfer the amount using the account details below, then upload your payment screenshot."
    >
      <FeatureNotice
        title="Manual payment workflow"
        body="Transfer the amount using the account details provided. Upload a screenshot of your successful transfer for admin verification."
      />

      {/* Reservation summary */}
      {(params.gameTitle || selectedNumbers.length > 0 || allReservationIds.length > 0) ? (
        <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <Text className="mb-1 font-semibold text-slate-900 dark:text-white">
            {params.gameTitle || "Reservation payment"}
          </Text>
          {selectedNumbers.length > 0 ? (
            <Text className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Numbers: {selectedNumbers.join(", ")}
            </Text>
          ) : null}
          {allReservationIds.length > 0 ? (
            <Text className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Reservation{allReservationIds.length > 1 ? "s" : ""}: #{allReservationIds.join(", #")}
            </Text>
          ) : null}
          <Text className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
            Estimated amount: {selectedNumbers.length * 100 || 100} ETB
          </Text>
        </View>
      ) : null}

      <View className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Text className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
          Submit payment proof
        </Text>

        {/* Provider selection */}
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

        {/* Payment info */}
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

        {/* Transaction reference */}
        <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Transaction reference *
        </Text>
        <TextInput
          value={reference}
          onChangeText={setReference}
          placeholder="Enter transaction/reference number"
          placeholderTextColor="#94a3b8"
          className="mb-4 rounded-xl border border-slate-200 px-4 py-3 text-slate-900 dark:border-slate-700 dark:text-white"
        />

        {/* Screenshot */}
        <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Payment screenshot *
        </Text>
        <ImageUpload
          value={proof || null}
          onChange={setProof}
          label="Payment proof"
          placeholder="Select your payment screenshot"
        />

        <View className="mt-4">
          <AppButton
            title={submitting ? "Submitting..." : "Submit Payment Proof"}
            onPress={handlePayment}
            disabled={submitting || submitted}
            loading={submitting}
          />
        </View>

        {submitted ? (
          <View className="mt-4">
            <StatusPill status="UNDER_REVIEW" />
            <Text className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Your payment proof is under review. The admin will verify and confirm your reservation.
            </Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}