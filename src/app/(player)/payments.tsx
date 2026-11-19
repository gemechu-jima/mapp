import { TranslatedText as Text, TranslatedTextInput as TextInput } from "@/components/common/TranslatedText";
import ImageUpload from "@/components/ImageUpload";
import AppButton from "@/components/ui/AppButton";
import Screen from "@/components/ui/Screen";
import StatusPill from "@/components/ui/StatusPill";
import FeatureNotice from "@/features/shared/FeatureNotice";
import { uploadApi } from "@/services/api";
import { PaymentService } from "@/services/payment.service";
import { detectPaymentProvider, type DetectedPaymentMethod } from "@/shared/paymentDetector";
import { paymentOptions } from "@/shared/paymentOptions";
import { uploadToImageKit } from "@/shared/imagekitService";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform, Pressable, Share, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  const [autoDetected, setAutoDetected] = useState<DetectedPaymentMethod>(null);
  const [reference, setReference] = useState("");
  const [refCheckState, setRefCheckState] = useState<{
    status: 'idle' | 'checking' | 'valid' | 'invalid';
    message: string;
  }>({ status: 'idle', message: '' });
  const checkTimeoutRef = useRef<any>(null);

  const [proof, setProof] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const selectedPayment = paymentOptions.find((option) => option.type === provider);
const [copied, setCopied] = useState(false);

const handleCopyNumber = async (number: string) => {
  try {
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(number);
    } else {
      const { Clipboard } = require("react-native");
      if (Clipboard?.setString) {
        Clipboard.setString(number);
      } else {
        await Share.share({ message: number });
        return;
      }
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch {
    Alert.alert("Copy failed", "Please press and hold the account number to copy it.");
  }
};
  // Auto-detect payment provider and check unique reference number
  const handleReferenceChange = (text: string) => {
    setReference(text);
    // 1. Auto-detect payment method (provider) from reference pattern
    const detected = detectPaymentProvider(text);
    if (detected) {
      setProvider(detected);
      setAutoDetected(detected);
    }

    // 2. Debounce uniqueness check with backend
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    const clean = text.trim();
    if (!clean || clean.length < 3) {
      setRefCheckState({ status: 'idle', message: '' });
      return;
    }

    setRefCheckState({ status: 'checking', message: 'Checking reference uniqueness...' });

    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await PaymentService.checkReference(clean, {
          reservationId,
          gameId: params.gameId,
        });

        if (res.isUnique) {
          setRefCheckState({
            status: 'valid',
            message: res.message || 'Reference is unique and valid.',
          });
        } else {
          setRefCheckState({
            status: 'invalid',
            message: res.message || 'This transaction reference has already been used.',
          });
        }
      } catch (err: any) {
        // Network or server error during check - don't hard block user typing
        setRefCheckState({ status: 'idle', message: '' });
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

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

    if (refCheckState.status === 'invalid') {
      Alert.alert("Duplicate reference", refCheckState.message || "This reference number has already been used.");
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

        await uploadApi.post(
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
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm text-slate-600 dark:text-slate-300">
            Payment provider
          </Text>
          {autoDetected && (
            <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Auto-detected: {autoDetected}
            </Text>
          )}
        </View>
        <View className="mb-4 flex-row flex-wrap gap-2">
          {paymentOptions.map((p) => (
            <AppButton
              key={p.type}
              title={p.type}
              variant={provider === p.type ? "primary" : "secondary"}
              onPress={() => {
                setProvider(p.type);
                setAutoDetected(null);
              }}
            />
          ))}
        </View>

        {/* Payment info */}
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

    <Pressable
      onPress={() => handleCopyNumber(selectedPayment.number)}
      className="flex-row items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 active:opacity-80 dark:border-slate-700 dark:bg-slate-800"
    >
      <Text
        selectable
        className="text-lg font-bold text-blue-600 dark:text-blue-400"
      >
        {selectedPayment.number}
      </Text>

      <View
        className={`flex-row items-center gap-1 rounded-md px-2.5 py-1 ${
          copied
            ? 'bg-green-100 dark:bg-green-900/40'
            : 'bg-blue-50 dark:bg-blue-900/30'
        }`}
      >
        <Ionicons
          name={copied ? 'checkmark-outline' : 'copy-outline'}
          size={15}
          color={copied ? '#16A34A' : '#2563EB'}
        />
        <Text
          className={`text-xs font-bold ${
            copied
              ? 'text-green-700 dark:text-green-400'
              : 'text-blue-600 dark:text-blue-400'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Text>
      </View>
    </Pressable>
  </View>
)}

        {/* Transaction reference */}
        <Text className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Transaction reference *
        </Text>
        <TextInput
          value={reference}
          onChangeText={handleReferenceChange}
          placeholder="e.g. FT240101... or DBR..."
          placeholderTextColor="#94a3b8"
          autoCapitalize="characters"
          className={`rounded-xl border px-4 py-3 text-slate-900 dark:bg-slate-900 dark:text-white ${
            refCheckState.status === 'invalid'
              ? 'border-red-500'
              : refCheckState.status === 'valid'
              ? 'border-emerald-500'
              : 'border-slate-200 dark:border-slate-700'
          }`}
        />
        {refCheckState.status === 'checking' && (
          <Text className="mb-4 mt-1 text-xs text-slate-500">
            Checking reference uniqueness...
          </Text>
        )}
        {refCheckState.status === 'valid' && (
          <Text className="mb-4 mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            ✓ {refCheckState.message}
          </Text>
        )}
        {refCheckState.status === 'invalid' && (
          <Text className="mb-4 mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
            ⚠️ {refCheckState.message}
          </Text>
        )}
        {refCheckState.status === 'idle' && (
          <Text className="mb-4 mt-1 text-xs text-slate-400">
            Enter your bank or mobile money transaction ID.
          </Text>
        )}

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