import { useAuth } from "@/context/AuthContext";
import GameAdminForm from "@/features/games/GameAdminForm";
import FeatureNotice from "@/features/shared/FeatureNotice";
import ManagementList, { type RecordItem } from "@/features/shared/ManagementList";
import { GameService } from "@/services/game.service";
import type { Game } from "@/types/game";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

function gameToRecord(g: Game): RecordItem {
  return {
    id: g.id,
    title: g.title,
    subtitle: `${g.totalNumbers} numbers · ${g.reservationMinutes}-min reservation`,
    status: g.status,
    detail: `Game ID: ${g.id}`,
  };
}

export default function AdminGames() {
  const { user } = useAuth();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [form, setForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const notify = (title: string, msg: string) =>
    Platform.OS === "web"
      ? window.alert(`${title}\n${msg}`)
      : Alert.alert(title, msg);

  const load = async () => {
    setLoading(true);
    try {
      const list = await GameService.getAll();
      setGames(list);
      setRecords(list.map(gameToRecord));
    } catch {
      // Backend unavailable – keep empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const save = async (g: {
    title: string;
    totalNumbers: number;
    reservationMinutes: number;
    winnerCount: number;
    numberPrice: number;
    prizeDistribution: {
      first: number;
      second: number;
      third: number;
      fourth: number;
      system: number;
    };
  }) => {
    if (!user?.id) {
      notify("Error", "You must be logged in as admin to create a game.");
      return;
    }

    setSaving(true);
    try {
      const created = await GameService.create({
        id: "",
        title: g.title,
        totalNumbers: g.totalNumbers,
        reservationMinutes: g.reservationMinutes,
        createdBy: user.id,
      });
      setGames((old) => [created, ...old]);
      setRecords((old) => [gameToRecord(created), ...old]);
      setForm(false);
      notify("Game created", `"${created.title}" has been created and is now PENDING.`);
    } catch (e: any) {
      notify(
        "Create failed",
        e?.response?.data?.message ?? "Could not create the game. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (record: RecordItem) => {
    const game = games.find((g) => g.id === record.id);
    if (!game) return;

    const msg = `${record.title}\n${record.subtitle}\nStatus: ${record.status}`;
    if (Platform.OS === "web") window.alert(msg);
    else Alert.alert(record.title, msg);
  };

  return (
    <ManagementList
      title="Manage games"
      subtitle="Create games and configure numbers, reservation expiry, winners and prizes."
      records={records}
      stats={[
        { label: "Total games", value: records.length, icon: "🎱" },
        {
          label: "Active",
          value: records.filter((r) => r.status === "ACTIVE").length,
          icon: "🟢",
        },
        {
          label: "Completed",
          value: records.filter((r) => r.status === "COMPLETED").length,
          icon: "🏁",
        },
      ]}
      actionLabel={form ? "Close form" : "Create game"}
      onAction={() => setForm((v) => !v)}
      onSelect={handleAction}
    >
      {loading ? (
        <FeatureNotice title="Loading games…" body="Fetching games from the backend." />
      ) : null}
      {form ? (
        <GameAdminForm
          onCancel={() => setForm(false)}
          onSave={save}
        />
      ) : null}
    </ManagementList>
  );
}
