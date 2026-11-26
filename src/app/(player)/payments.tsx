import {
  TranslatedText as Text,
  TranslatedTextInput as TextInput,
} from "@/components/common/TranslatedText";
import ImageUpload from "@/components/ImageUpload";
import AppButton from "@/components/ui/AppButton";
import Screen from "@/components/ui/Screen";
import StatusPill from "@/components/ui/StatusPill";
import { useAuth } from "@/context/AuthContext";
import FeatureNotice from "@/features/shared/FeatureNotice";
import { api } from "@/services/api";
import { PaymentService } from "@/services/payment.service";
import { ReservationService } from "@/services/reservation.service";
import { uploadImage } from "@/shared/uploadImage";
import {
  detectPaymentProvider,
  type DetectedPaymentMethod,
} from "@/shared/paymentDetector";
import { paymentOptions } from "@/shared/paymentOptions";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform, Pressable, Share, View } from "react-native";

type PendingReservation = {
  id: number;
  gameId: number;
  gameTitle: string;
  number: number;
  price: number;
  status: string;
  expiresAt: string;
};

function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return "00:00";
  const totalSeconds = Math.floor(msRemaining / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function PlayerPayments() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    reservationId?: string;
    reservationIds?: string;
    gameId?: string;
  }>();

  // Optional pre-selected IDs if navigated directly from reservation/game screen
  const initialParamIds = useMemo(() => {
    if (params.reservationIds) {
      return params.reservationIds.split(",").map(Number).filter(Boolean);
    }
    if (params.reservationId) {
      return [Number(params.reservationId)].filter(Boolean);
    }
    return [];
  }, [params.reservationId, params.reservationIds]);

  const [pendingList, setPendingList] = useState<PendingReservation[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  const [provider, setProvider] = useState("CBE");
  const [autoDetected, setAutoDetected] = useState<DetectedPaymentMethod>(null);
  const [reference, setReference] = useState("");
  const [refCheckState, setRefCheckState] = useState<{
    status: "idle" | "checking" | "valid" | "invalid";
    message: string;
  }>({ status: "idle", message: "" });
  const checkTimeoutRef = useRef<any>(null);

  const [proof, setProof] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const selectedPayment = paymentOptions.find(
    (option) => option.type === provider,
  );
  const [copied, setCopied] = useState(false);

  // 1. Live 1-second ticker for countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch active PENDING reservations from DB whenever screen opens/focuses
  const loadPendingReservations = useCallback(async () => {
    if (!user?.id) {
      setPendingList([]);
      setLoadingReservations(false);
      return;
    }

    try {
      setLoadingReservations(true);
      const response: any = await ReservationService.getByUser(user.id);
      const rawList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      const currentTime = Date.now();
      const activePending: PendingReservation[] = rawList
        .filter((r: any) => {
          if (r.status !== "PENDING") return false;
          if (!r.expiresAt) return true;
          return new Date(r.expiresAt).getTime() > currentTime;
        })
        .map((r: any) => ({
          id: Number(r.id),
          gameId: Number(r.gameId),
          gameTitle: r.gameTitle || r.game?.title || `Game #${r.gameId}`,
          number: r.number?.number ?? r.numberId,
          price: Number(r.game?.numberPrice ?? r.numberPrice ?? r.amount ?? 100),
          status: r.status,
          expiresAt: r.expiresAt,
        }));

      setPendingList(activePending);

      // Select URL-passed IDs if present, otherwise select all active pending reservations
      if (initialParamIds.length > 0) {
        const matched = activePending
          .filter((item) => initialParamIds.includes(item.id))
          .map((item) => item.id);
        setSelectedIds(
          matched.length > 0 ? matched : activePending.map((i) => i.id),
        );
      } else {
        setSelectedIds(activePending.map((i) => i.id));
      }
    } catch {
      setPendingList([]);
    } finally {
      setLoadingReservations(false);
    }
  }, [user?.id, initialParamIds]);

  useFocusEffect(
    useCallback(() => {
      loadPendingReservations();
    }, [loadPendingReservations]),
  );

  // Filter out items whose countdown just hit 0 in real time
  const activeReservations = useMemo(
    () =>
      pendingList.filter(
        (r) => !r.expiresAt || new Date(r.expiresAt).getTime() > now,
      ),
    [pendingList, now],
  );

  const selectedReservations = useMemo(
    () => activeReservations.filter((r) => selectedIds.includes(r.id)),
    [activeReservations, selectedIds],
  );

  const totalAmount = useMemo(
    () => selectedReservations.reduce((sum, r) => sum + (r.price || 100), 0),
    [selectedReservations],
  );

  const toggleSelectReservation = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCopyNumber = async (number: string) => {
    try {
      if (
        Platform.OS === "web" &&
        typeof navigator !== "undefined" &&
        navigator.clipboard
      ) {
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
      Alert.alert(
        "Copy failed",
        "Please press and hold the account number to copy it.",
      );
    }
  };

  const handleReferenceChange = (text: string) => {
    setReference(text);
    const detected = detectPaymentProvider(text);
    if (detected) {
      setProvider(detected);
      setAutoDetected(detected);
    }

    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    const clean = text.trim();
    if (!clean || clean.length < 3) {
      setRefCheckState({ status: "idle", message: "" });
      return;
    }

    setRefCheckState({
      status: "checking",
      message: "Checking reference uniqueness...",
    });

    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const firstSelected = selectedReservations[0];
        const res = await PaymentService.checkReference(clean, {
          reservationId: firstSelected ? String(firstSelected.id) : undefined,
          gameId: firstSelected
            ? String(firstSelected.gameId)
            : params.gameId,
        });

        if (res.isUnique) {
          setRefCheckState({
            status: "valid",
            message: res.message || "Reference is unique and valid.",
          });
        } else {
          setRefCheckState({
            status: "invalid",
            message:
              res.message ||
              "This transaction reference has already been used.",
          });
        }
      } catch {
        setRefCheckState({ status: "idle", message: "" });
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
    if (selectedReservations.length === 0) {
      Alert.alert(
        "No active reservation",
        "You have no active reserved numbers selected, or your reservation time expired.",
      );
      return;
    }

    if (!selectedPayment) {
      Alert.alert("Error", "Please select a payment provider.");
      return;
    }

    if (!reference.trim()) {
      Alert.alert(
        "Missing reference",
        "Please enter your transaction reference number.",
      );
      return;
    }

    if (refCheckState.status === "invalid") {
      Alert.alert(
        "Duplicate reference",
        refCheckState.message || "This reference number has already been used.",
      );
      return;
    }

    if (!proof) {
      Alert.alert("Missing proof", "Please upload your payment screenshot.");
      return;
    }

    try {
      setSubmitting(true);

      const proofFileName = `payment-proof-${Date.now()}.jpg`;

      // 1. Upload payment proof directly to Cloudinary (never save file on backend)
      const uploadedImage = await uploadImage(
        {
          uri: proof,
          name: proofFileName,
          type: "image/jpeg",
        },
        {
          folder: "payment-proofs",
          tags: ["payment-proof", selectedPayment.type],
        },
      );

      // 2. Submit only the Cloudinary URL and metadata to the backend payment table
      for (const item of selectedReservations) {
        const resId = String(item.id);
        await api.post(`/numbers/${resId}/payment-proofs`, {
          provider: selectedPayment.type,
          reservationId: resId,
          numberId: resId,
          transactionReference: reference.trim(),
          proofUrl: uploadedImage.url,
          screenshotUrl: uploadedImage.url,
        });
      }

      setSubmitted(true);
      if (Platform.OS === "web") {
        window.alert(
          "Payment submitted! Your payment proof is under admin verification.",
        );
        router.replace("/(player)/reservations");
      } else {
        Alert.alert(
          "Payment submitted",
          "Your payment proof was submitted successfully. Please wait for admin verification.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(player)/reservations"),
            },
          ],
        );
      }
    } catch (error: any) {
      console.error("Payment submission failed:", error);
      Alert.alert(
        "Submission failed",
        error?.response?.data?.message ??
          error?.message ??
          "Could not submit your payment proof. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      title="Submit Payment"
      subtitle="Transfer the amount using the account details below before your reservation timer expires."
    >
      <FeatureNotice
        title="Manual payment workflow"
        body="Transfer the exact total for your active reservations below, then upload your payment screenshot before the countdown reaches 00:00."
      />

      {/* Active Reserved Numbers from Database with Live Countdown */}
      {loadingReservations ? (
        <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            Loading your active reservations…
          </Text>
        </View>
      ) : activeReservations.length > 0 ? (
        <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-bold text-slate-900 dark:text-white">
              Your Active Reservations ({selectedReservations.length}/
              {activeReservations.length})
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              Tap to select
            </Text>
          </View>

          <View className="gap-2">
            {activeReservations.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const remainingMs = item.expiresAt
                ? Math.max(0, new Date(item.expiresAt).getTime() - now)
                : 0;
              const isUrgent = remainingMs > 0 && remainingMs <= 60_000;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggleSelectReservation(item.id)}
                  className={`flex-row items-center justify-between rounded-xl border p-3 ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40"
                      : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                  }`}
                >
                  <View className="flex-row items-center gap-2.5 flex-1">
                    <Ionicons
                      name={isSelected ? "checkbox" : "square-outline"}
                      size={20}
                      color={isSelected ? "#2563EB" : "#94A3B8"}
                    />
                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-sm font-bold text-slate-900 dark:text-white"
                      >
                        {item.gameTitle} · Number #{item.number}
                      </Text>
                      <Text className="text-xs text-slate-500 dark:text-slate-400">
                        Res #{item.id} · {item.price} ETB
                      </Text>
                    </View>
                  </View>

                  {item.expiresAt ? (
                    <View
                      className={`flex-row items-center gap-1 rounded-lg px-2.5 py-1 ${
                        isUrgent
                          ? "bg-rose-100 dark:bg-rose-950/70"
                          : "bg-amber-100 dark:bg-amber-950/70"
                      }`}
                    >
                      <Ionicons
                        name="time-outline"
                        size={13}
                        color={isUrgent ? "#E11D48" : "#D97706"}
                      />
                      <Text
                        className={`text-xs font-extrabold ${
                          isUrgent
                            ? "text-rose-700 dark:text-rose-300"
                            : "text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {formatCountdown(remainingMs)}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <View className="mt-3 flex-row items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Total Amount Due
            </Text>
            <Text className="text-base font-extrabold text-blue-600 dark:text-blue-400">
              {totalAmount} ETB
            </Text>
          </View>
        </View>
      ) : (
        <View className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <Text className="font-bold text-slate-900 dark:text-white">
            No active unpaid reservations
          </Text>
          <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Your reserved numbers have either expired and been released or you
            haven't reserved any numbers yet.
          </Text>
          <View className="mt-3">
            <AppButton
              title="Browse Games"
              variant="secondary"
              onPress={() => router.push("/(player)/games")}
            />
          </View>
        </View>
      )}

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
                    ? "bg-green-100 dark:bg-green-900/40"
                    : "bg-blue-50 dark:bg-blue-900/30"
                }`}
              >
                <Ionicons
                  name={copied ? "checkmark-outline" : "copy-outline"}
                  size={15}
                  color={copied ? "#16A34A" : "#2563EB"}
                />
                <Text
                  className={`text-xs font-bold ${
                    copied
                      ? "text-green-700 dark:text-green-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
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
            refCheckState.status === "invalid"
              ? "border-red-500"
              : refCheckState.status === "valid"
                ? "border-emerald-500"
                : "border-slate-200 dark:border-slate-700"
          }`}
        />
        {refCheckState.status === "checking" && (
          <Text className="mb-4 mt-1 text-xs text-slate-500">
            Checking reference uniqueness...
          </Text>
        )}
        {refCheckState.status === "valid" && (
          <Text className="mb-4 mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            ✓ {refCheckState.message}
          </Text>
        )}
        {refCheckState.status === "invalid" && (
          <Text className="mb-4 mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
            ⚠️ {refCheckState.message}
          </Text>
        )}
        {refCheckState.status === "idle" && (
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
            disabled={
              submitting || submitted || selectedReservations.length === 0
            }
            loading={submitting}
            className={
              submitted
                ? "bg-emerald-600"
                : submitting
                  ? "bg-blue-400"
                  : "bg-blue-600 active:bg-blue-700"
            }
          />
        </View>

        {submitted ? (
          <View className="mt-4">
            <StatusPill status="UNDER_REVIEW" />
            <Text className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Your payment proof is under review. The admin will verify and
              confirm your reservation.
            </Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}