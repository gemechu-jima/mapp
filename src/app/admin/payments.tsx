import { TranslatedText as Text, TranslatedTextInput as TextInput } from "@/components/common/TranslatedText";
import AppButton from "@/components/ui/AppButton";
import Screen from "@/components/ui/Screen";
import StatusPill from "@/components/ui/StatusPill";
import FeatureNotice from "@/features/shared/FeatureNotice";
import { PaymentService } from "@/services/payment.service";
import type { PaymentProof } from "@/types/payment";
import { useEffect, useState } from "react";
import { Alert, Image, Platform, View } from "react-native";

export default function AdminPayments() {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reason, setReason] = useState("");
  const [reportingId, setReportingId] = useState<number | null>(null);

  const notify = (title: string, msg: string) =>
    Platform.OS === "web"
      ? window.alert(`${title}\n${msg}`)
      : Alert.alert(title, msg);

  const load = async () => {
    try {
      const data = await PaymentService.getAll();
      setProofs(data);
    } catch (e) {
      console.error("Failed to load payment proofs:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleVerify = async (proof: PaymentProof) => {
    try {
      const updated = await PaymentService.verify(proof.id);
      setProofs((prev) => prev.map((p) => (p.id === proof.id ? updated : p)));
      notify("Payment verified", "The reservation has been confirmed.");
    } catch (e: any) {
      notify("Verify failed", e?.response?.data?.message ?? "Could not verify payment.");
    }
  };

  const handleReject = async (proof: PaymentProof) => {
    if (!reason.trim()) {
      notify("Reason required", "Please provide a rejection reason.");
      return;
    }
    try {
      const updated = await PaymentService.reject(proof.id, { note: reason.trim() });
      setProofs((prev) => prev.map((p) => (p.id === proof.id ? updated : p)));
      setReportingId(null);
      setReason("");
      notify("Payment rejected", "The reservation has been released.");
    } catch (e: any) {
      notify("Reject failed", e?.response?.data?.message ?? "Could not reject payment.");
    }
  };

  const handleReport = async (proof: PaymentProof) => {
    if (!reason.trim()) {
      notify("Reason required", "Please explain the issue.");
      return;
    }
    try {
      await PaymentService.reportMistake(proof.id, { reason: reason.trim() });
      setReportingId(null);
      setReason("");
      notify("Report submitted", "The mistake report has been recorded.");
    } catch (e: any) {
      notify("Report failed", e?.response?.data?.message ?? "Could not submit report.");
    }
  };

  return (
    <Screen
      title="Payment verification"
      subtitle="Inspect manual transfers and payment screenshots before confirming a reservation."
    >
      {loading ? (
        <Text className="text-slate-500 dark:text-slate-400">Loading payment proofs…</Text>
      ) : proofs.length === 0 ? (
        <FeatureNotice
          title="No pending payments"
          body="Payment proof submissions will appear here for admin review. All manual transfers require screenshot verification before a reservation is confirmed."
        />
      ) : (
        proofs.map((proof) => (
          <View
            key={proof.id}
            className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <View className="mb-3 flex-row items-start justify-between">
              <View className="flex-1 mr-3">
                <Text className="font-bold text-slate-900 dark:text-white">
                  {proof.provider} · #{proof.id}
                </Text>
                <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Reservation #{proof.reservationId} · {proof.amount} ETB
                </Text>
                {proof.transactionReference ? (
                  <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Ref: {proof.transactionReference}
                  </Text>
                ) : null}
                <Text className="mt-1 text-xs text-slate-400">
                  Submitted: {new Date(proof.submittedAt || proof.createdAt || Date.now()).toLocaleString()}
                </Text>
              </View>
              <StatusPill status={proof.status} />
            </View>

            {proof.proofUrl ? (
              <Image
                source={{ uri: proof.proofUrl }}
                style={{ width: "100%", height: 180, borderRadius: 8, marginBottom: 12 }}
                resizeMode="cover"
              />
            ) : null}

            {proof.status === "SUBMITTED" || proof.status === "UNDER_REVIEW" ? (
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <AppButton title="Verify ✓" onPress={() => handleVerify(proof)} />
                </View>
                <View className="flex-1">
                  <AppButton
                    title="Reject"
                    variant="danger"
                    onPress={() => setReportingId(proof.id)}
                  />
                </View>
              </View>
            ) : proof.status === "VERIFIED" ? (
              <View>
                <AppButton
                  title="Report mistake"
                  variant="secondary"
                  onPress={() => setReportingId(proof.id)}
                />
              </View>
            ) : null}

            {reportingId === proof.id ? (
              <View className="mt-3">
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  placeholder="Describe the issue or rejection reason"
                  placeholderTextColor="#94a3b8"
                  className="min-h-24 rounded-xl border border-slate-200 p-3 text-slate-900 dark:border-slate-700 dark:text-white"
                />
                <View className="mt-2 flex-row gap-2">
                  <View className="flex-1">
                    <AppButton
                      title={proof.status === "VERIFIED" ? "Submit report" : "Confirm reject"}
                      variant="danger"
                      onPress={() =>
                        proof.status === "VERIFIED"
                          ? handleReport(proof)
                          : handleReject(proof)
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <AppButton
                      title="Cancel"
                      variant="secondary"
                      onPress={() => { setReportingId(null); setReason(""); }}
                    />
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        ))
      )}
    </Screen>
  );
}
