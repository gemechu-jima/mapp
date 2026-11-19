import AppButton from "@/components/ui/AppButton";
import FeatureNotice from "@/features/shared/FeatureNotice";
import ManagementList, { type RecordItem } from "@/features/shared/ManagementList";
import { ReservationService } from "@/services/reservation.service";
import type { ReservationResponse } from "@/types/reservation";
import { useEffect, useState } from "react";
import { Alert, Platform, View } from "react-native";

function reservationToRecord(r: ReservationResponse): RecordItem {
  const name = r.user
    ? `${r.user.firstName} ${r.user.lastName ?? ''}`.trim()
    : `User #${r.userId}`;
  const num = r.number?.number ?? r.numberId;
  return {
    id: r.id,
    title: `Reservation #${r.id} · Number ${num}`,
    subtitle: `${name} · Game #${r.gameId}`,
    status: r.status,
    detail: r.expiresAt
      ? `Expires: ${new Date(r.expiresAt).toLocaleString()}`
      : `Created: ${new Date(r.createdAt).toLocaleString()}`,
  };
}

export default function AdminReservations() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const notify = (title: string, msg: string) =>
    Platform.OS === "web"
      ? window.alert(`${title}\n${msg}`)
      : Alert.alert(title, msg);

  const load = async () => {
    setLoading(true);
    try {
      const list = await ReservationService.getAll();
      setRecords(list.map(reservationToRecord));
    } catch {
      // Backend unavailable – show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered =
    filter === "ALL" ? records : records.filter((r) => r.status === filter);

  return (
    <ManagementList
      title="Reservation management"
      subtitle="Review pending reservations, expiry, cancellations and confirmed numbers."
      records={filtered}
      stats={[
        {
          label: "Pending",
          value: records.filter((r) => r.status === "PENDING").length,
          icon: "⏳",
        },
        {
          label: "Confirmed",
          value: records.filter((r) => r.status === "CONFIRMED").length,
          icon: "✅",
        },
        {
          label: "Expired",
          value: records.filter((r) => r.status === "EXPIRED").length,
          icon: "⌛",
        },
      ]}
      actionLabel="Refresh"
      onAction={load}
      onSelect={(r) => {
        if (Platform.OS === "web") window.alert(`${r.title}\n${r.subtitle}\n${r.detail}`);
        else Alert.alert(r.title, `${r.subtitle}\n${r.detail}`);
      }}
    >
      {/* Status filter pills */}
      <View className="mb-4 flex-row flex-wrap gap-2">
        {["ALL", "PENDING", "CONFIRMED", "EXPIRED", "CANCELLED"].map((s) => (
          <AppButton
            key={s}
            title={s === "ALL" ? "All" : s}
            variant={filter === s ? "primary" : "secondary"}
            onPress={() => setFilter(s)}
          />
        ))}
      </View>

      {loading ? (
        <FeatureNotice title="Loading…" body="Fetching reservations from the backend." />
      ) : records.length === 0 ? (
        <FeatureNotice
          title="No reservations"
          body="Reservations will appear here once players start selecting numbers."
        />
      ) : null}

      <FeatureNotice
        title="Expired payment recovery"
        body="Restore an expired reservation only after reviewing proof and checking that the number is still available. Confirmed reservations are locked; mistakes must be reported through the audit workflow."
      />
    </ManagementList>
  );
}
