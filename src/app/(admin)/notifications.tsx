import { TranslatedText as Text, TranslatedTextInput as TextInput } from "@/components/common/TranslatedText";
import AppButton from "@/components/ui/AppButton";
import Screen from "@/components/ui/Screen";
import StatusPill from "@/components/ui/StatusPill";
import StatCard from "@/components/ui/StatCard";
import FeatureNotice from "@/features/shared/FeatureNotice";
import { PaymentService } from "@/services/payment.service";
import { NumberService } from "@/services/number.service";
import type { PaymentProof } from "@/types/payment";
import type { GameNumber } from "@/types/number";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Platform, Pressable, View } from "react-native";
import { ArrowLeft, CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react-native";

export default function AdminNotifications() {
  const params = useLocalSearchParams<{ highlightId?: string }>();
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [activeNumbers, setActiveNumbers] = useState<GameNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const notify = (title: string, msg: string) =>
    Platform.OS === "web"
      ? window.alert(`${title}\n${msg}`)
      : Alert.alert(title, msg);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allProofs, allNumbers] = await Promise.all([
        PaymentService.getAll().catch(() => []),
        NumberService.getAllActive().catch(() => []),
      ]);
      setProofs(Array.isArray(allProofs) ? allProofs : []);
      setActiveNumbers(Array.isArray(allNumbers) ? allNumbers : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Filter proofs awaiting review
  const pendingProofs = proofs.filter(
    (p) => p.status === "SUBMITTED" || p.status === "UNDER_REVIEW"
  );

  // Filter numbers currently in RESERVED state (pending payment or proof)
  const pendingNumbers = activeNumbers.filter((n) => n.status === "RESERVED");

  const handleConfirmProof = async (proof: PaymentProof) => {
    try {
      setProcessingId(proof.id);
      await PaymentService.verify(proof.id);
      notify("Payment Confirmed", `Reservation #${proof.numberId || proof.reservationId} confirmed successfully!`);
      await loadData();
    } catch (e: any) {
      notify("Action Failed", e?.response?.data?.message ?? "Could not confirm payment.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectProof = async (proof: PaymentProof) => {
    if (!rejectReason.trim()) {
      notify("Reason Required", "Please provide a reason for rejecting this payment proof.");
      return;
    }
    try {
      setProcessingId(proof.id);
      await PaymentService.reject(proof.id, { note: rejectReason.trim() });
      notify("Payment Rejected", `Reservation #${proof.numberId || proof.reservationId} has been rejected and released.`);
      setRejectingId(null);
      setRejectReason("");
      await loadData();
    } catch (e: any) {
      notify("Action Failed", e?.response?.data?.message ?? "Could not reject payment.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleQuickConfirmNumber = async (numberId: number) => {
    try {
      setProcessingId(numberId);
      await NumberService.confirm(numberId);
      notify("Number Confirmed", `Number #${numberId} has been confirmed directly.`);
      await loadData();
    } catch (e: any) {
      notify("Confirmation Failed", e?.response?.data?.message ?? "Could not confirm number.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleQuickCancelNumber = async (numberId: number) => {
    try {
      setProcessingId(numberId);
      await NumberService.cancel(numberId);
      notify("Number Cancelled", `Number #${numberId} has been released back to Available.`);
      await loadData();
    } catch (e: any) {
      notify("Action Failed", e?.response?.data?.message ?? "Could not cancel number.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Screen
      title="Admin Notifications"
      subtitle="Review pending number reservations, inspect payment proofs, and confirm or reject."
    >
      {/* Top action / refresh bar */}
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center rounded-xl bg-white p-3 dark:bg-slate-900"
        >
          <ArrowLeft size={18} color="#64748b" />
          <Text className="ml-2 text-sm font-semibold text-slate-700 dark:text-white">
            Back
          </Text>
        </Pressable>

        <Pressable
          onPress={loadData}
          disabled={loading}
          className="flex-row items-center rounded-xl bg-blue-600 px-4 py-3"
        >
          <RefreshCw size={16} color="white" />
          <Text className="ml-2 text-sm font-bold text-white">Refresh</Text>
        </Pressable>
      </View>

      {/* Stats summary */}
      <View className="mb-6 flex-row gap-3">
        <StatCard
          label="Pending Proofs"
          value={pendingProofs.length}
          icon="💳"
        />
        <StatCard
          label="Pending Numbers"
          value={pendingNumbers.length}
          icon="⏳"
        />
      </View>

      {/* Section 1: Payment Proofs Awaiting Verification */}
      <View className="mb-6">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-slate-900 dark:text-white">
            Pending Payment Proofs ({pendingProofs.length})
          </Text>
          <Text className="text-xs text-slate-500">Requires Admin Action</Text>
        </View>

        {loading ? (
          <Text className="text-slate-500">Loading notifications...</Text>
        ) : pendingProofs.length === 0 ? (
          <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <CheckCircle2 size={32} color="#10b981" />
            <Text className="mt-2 font-semibold text-slate-800 dark:text-white">
              No pending payment proofs
            </Text>
            <Text className="mt-1 text-center text-xs text-slate-500">
              When players submit payment screenshots, they will appear here immediately for confirmation or rejection.
            </Text>
          </View>
        ) : (
          pendingProofs.map((proof) => {
            const isTarget = params.highlightId === String(proof.id);
            return (
              <View
                key={proof.id}
                className={`mb-4 rounded-2xl border bg-white p-4 dark:bg-slate-900 ${
                  isTarget
                    ? "border-blue-500 shadow-md ring-2 ring-blue-400"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <View className="mb-2 flex-row items-start justify-between">
                  <View className="flex-1 mr-2">
                    <Text className="text-base font-bold text-slate-900 dark:text-white">
                      {proof.provider} · Proof #{proof.id}
                    </Text>
                    <Text className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Reservation/Number #{proof.numberId || proof.reservationId} · {proof.amount} ETB
                    </Text>
                    {proof.transactionReference ? (
                      <Text className="mt-1 font-mono text-xs text-blue-600 dark:text-blue-400">
                        Ref: {proof.transactionReference}
                      </Text>
                    ) : null}
                    <Text className="mt-1 text-xs text-slate-400">
                      Date: {new Date(proof.submittedAt || (proof as any).createdAt).toLocaleString()}
                    </Text>
                  </View>
                  <StatusPill status={proof.status} />
                </View>

                {/* Screenshot view */}
                {proof.proofUrl ? (
                  <View className="my-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <Image
                      source={{ uri: proof.proofUrl }}
                      style={{ width: "100%", height: 200 }}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <View className="my-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
                    <Text className="text-xs text-amber-700 dark:text-amber-300">
                      No screenshot attached (Reference number provided)
                    </Text>
                  </View>
                )}

                {/* Action buttons: Confirm or Reject */}
                {rejectingId === proof.id ? (
                  <View className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
                    <Text className="mb-2 text-xs font-semibold text-red-900 dark:text-red-200">
                      Rejection Reason (Player will be notified):
                    </Text>
                    <TextInput
                      value={rejectReason}
                      onChangeText={setRejectReason}
                      placeholder="e.g. Invalid reference or mismatched transfer amount"
                      placeholderTextColor="#94a3b8"
                      className="mb-3 rounded-lg border border-red-300 bg-white p-2.5 text-xs text-slate-900 dark:border-red-800 dark:bg-slate-900 dark:text-white"
                    />
                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <AppButton
                          title="Confirm Reject"
                          variant="danger"
                          loading={processingId === proof.id}
                          disabled={processingId === proof.id}
                          onPress={() => handleRejectProof(proof)}
                        />
                      </View>
                      <View className="flex-1">
                        <AppButton
                          title="Cancel"
                          variant="secondary"
                          onPress={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                        />
                      </View>
                    </View>
                  </View>
                ) : (
                  <View className="mt-3 flex-row gap-2">
                    <View className="flex-1">
                      <AppButton
                        title="Confirm & Verify ✓"
                        variant="primary"
                        loading={processingId === proof.id}
                        disabled={processingId === proof.id}
                        onPress={() => handleConfirmProof(proof)}
                      />
                    </View>
                    <View className="flex-1">
                      <AppButton
                        title="Reject Proof"
                        variant="danger"
                        disabled={processingId === proof.id}
                        onPress={() => setRejectingId(proof.id)}
                      />
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* Section 2: Numbers Reserved (Pending Payment Transfer) */}
      <View className="mb-6">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-slate-900 dark:text-white">
            Reserved Numbers ({pendingNumbers.length})
          </Text>
          <Text className="text-xs text-slate-500">Active Countdown</Text>
        </View>

        {pendingNumbers.length === 0 ? (
          <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <Clock size={32} color="#64748b" />
            <Text className="mt-2 font-semibold text-slate-800 dark:text-white">
              No active reservations
            </Text>
            <Text className="mt-1 text-center text-xs text-slate-500">
              Numbers reserved by players will appear here with expiration timers.
            </Text>
          </View>
        ) : (
          pendingNumbers.map((num) => (
            <View
              key={num.id}
              className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-2">
                  <Text className="font-bold text-slate-900 dark:text-white">
                    Number #{num.number} · {num.gameTitle || `Game #${num.gameId}`}
                  </Text>
                  <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Player: {num.user?.name || `User #${num.userId}`} ({num.user?.phoneNumber || "No phone"})
                  </Text>
                  {num.expiresAt ? (
                    <Text className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      Expires: {new Date(num.expiresAt).toLocaleTimeString()}
                    </Text>
                  ) : null}
                </View>
                <StatusPill status={num.status} />
              </View>

              {/* Direct manual admin override for number */}
              <View className="mt-3 flex-row gap-2">
                <View className="flex-1">
                  <AppButton
                    title="Direct Confirm"
                    variant="primary"
                    loading={processingId === num.id}
                    disabled={processingId === num.id}
                    onPress={() => handleQuickConfirmNumber(num.id)}
                  />
                </View>
                <View className="flex-1">
                  <AppButton
                    title="Release Number"
                    variant="secondary"
                    loading={processingId === num.id}
                    disabled={processingId === num.id}
                    onPress={() => handleQuickCancelNumber(num.id)}
                  />
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}
