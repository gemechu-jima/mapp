import React, { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import Screen from "@/components/ui/Screen";
import StatCard from "@/components/ui/StatCard";
import StatusPill from "@/components/ui/StatusPill";
import Search from "@/features/shared/Search";
import {
  DrawService,
  type DrawHistoryRecord,
  type OfficialDrawWinner,
} from "@/services/draw.service";
import { useAuth } from "@/context/AuthContext";
import { TranslatedText as Text } from "@/components/common/TranslatedText";
import { Trophy, RefreshCw, Calendar, Sparkles } from "lucide-react-native";

export type SharedDrawHistoryProps = {
  mode?: "player" | "admin";
};

export default function DrawHistoryScreen({
  mode = "player",
}: SharedDrawHistoryProps) {
  const isAdmin = mode === "admin";
  const { user } = useAuth();
  const currentUserId = user?.id ? Number(user.id) : null;

  const [draws, setDraws] = useState<DrawHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "MY_WINS">("ALL");

  const loadDrawHistory = async () => {
    try {
      const data = await DrawService.getDrawHistory();
      setDraws(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load draw history:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDrawHistory();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadDrawHistory();
  };

  const getUserWin = (winners: OfficialDrawWinner[]) => {
    if (!currentUserId || !winners) return null;
    return winners.find((w) => Number(w.userId) === currentUserId) || null;
  };

  const totalPublishedDraws = draws.length;
  const totalWinnersCount = draws.reduce(
    (sum, d) => sum + (Array.isArray(d.winners) ? d.winners.length : 0),
    0,
  );
  const totalPoolDistributed = draws.reduce(
    (sum, d) => sum + (Number(d.totalPrize) || 0),
    0,
  );
  const myWinningDraws = draws.filter((d) => getUserWin(d.winners)).length;
  const myTotalWonPrize = draws.reduce((sum, d) => {
    const win = getUserWin(d.winners);
    return sum + (win ? Number(win.prizeAmount) || 0 : 0);
  }, 0);

  const filteredDraws = useMemo(() => {
    return draws.filter((draw) => {
      if (!isAdmin && filterMode === "MY_WINS" && !getUserWin(draw.winners)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = (draw.gameTitle || "").toLowerCase().includes(q);
        const matchesWinner = (draw.winners || []).some(
          (w) =>
            (w.displayName || "").toLowerCase().includes(q) ||
            String(w.number) === q ||
            `#${w.number}` === q,
        );
        return matchesTitle || matchesWinner;
      }

      return true;
    });
  }, [draws, filterMode, searchQuery, currentUserId, isAdmin]);

  const getRankBadge = (place: number) => {
    switch (place) {
      case 1:
        return {
          icon: "🥇",
          label: "1st Place",
          bg: "bg-amber-100 dark:bg-amber-950/40",
          border: "border-amber-400 dark:border-amber-600",
          text: "text-amber-800 dark:text-amber-300",
          ballBg: "bg-amber-500",
        };
      case 2:
        return {
          icon: "🥈",
          label: "2nd Place",
          bg: "bg-slate-100 dark:bg-slate-800/60",
          border: "border-slate-300 dark:border-slate-600",
          text: "text-slate-800 dark:text-slate-200",
          ballBg: "bg-slate-500",
        };
      case 3:
        return {
          icon: "🥉",
          label: "3rd Place",
          bg: "bg-orange-100 dark:bg-orange-950/40",
          border: "border-orange-300 dark:border-orange-600",
          text: "text-orange-900 dark:text-orange-300",
          ballBg: "bg-orange-600",
        };
      default:
        return {
          icon: "🎖️",
          label: `${place}th Place`,
          bg: "bg-purple-100 dark:bg-purple-950/40",
          border: "border-purple-300 dark:border-purple-600",
          text: "text-purple-900 dark:text-purple-300",
          ballBg: "bg-purple-600",
        };
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Screen
      title={isAdmin ? "Draw History" : "Draw Results"}
      subtitle={
        isAdmin
          ? "Audit all completed draws, winning numbers, and prize payouts."
          : "Browse official game results, winning numbers, and prize winners."
      }
    >
      {/* Top Stat Cards */}
      <View className="mb-4 flex-row flex-wrap gap-3">
        <StatCard
          label="Published Draws"
          value={totalPublishedDraws}
          icon="🏆"
        />
        {isAdmin ? (
          <>
            <StatCard
              label="Total Winners"
              value={totalWinnersCount}
              icon="🎖️"
            />
            <StatCard
              label="Total Pool"
              value={`${totalPoolDistributed.toLocaleString()} ETB`}
              icon="💰"
            />
          </>
        ) : (
          <>
            <StatCard label="My Wins" value={myWinningDraws} icon="🎉" />
            {myTotalWonPrize > 0 && (
              <StatCard
                label="Total Won"
                value={`${myTotalWonPrize.toLocaleString()} ETB`}
                icon="💰"
              />
            )}
          </>
        )}
      </View>

      {/* Filter Chips & Shared Search Bar */}
      <View className="mb-4 gap-3">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => setFilterMode("ALL")}
            className={`rounded-full border px-4 py-2 ${
              filterMode === "ALL"
                ? "border-black bg-black"
                : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                filterMode === "ALL"
                  ? "text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              All Draws ({totalPublishedDraws})
            </Text>
          </Pressable>

          {!isAdmin ? (
            <Pressable
              onPress={() => setFilterMode("MY_WINS")}
              className={`flex-row items-center gap-1.5 rounded-full border px-4 py-2 ${
                filterMode === "MY_WINS"
                  ? "border-amber-500 bg-amber-500"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <Sparkles
                size={12}
                color={filterMode === "MY_WINS" ? "#fff" : "#f59e0b"}
              />
              <Text
                className={`text-xs font-semibold ${
                  filterMode === "MY_WINS"
                    ? "text-white"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                My Wins ({myWinningDraws})
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={handleRefresh}
            className="ml-auto rounded-full border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900"
          >
            <RefreshCw size={14} color="#64748b" />
          </Pressable>
        </View>

        <Search
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by game title, winner name, or number #…"
          resultCount={filteredDraws.length}
          className="mb-0"
        />
      </View>

      {/* Main Draw History List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {loading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color="#0284c7" />
            <Text className="mt-3 text-sm text-slate-500">
              Loading draw results...
            </Text>
          </View>
        ) : filteredDraws.length === 0 ? (
          <View className="items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-16 dark:border-slate-800 dark:bg-slate-900/50">
            <Trophy size={48} color="#cbd5e1" />
            <Text className="mt-4 text-base font-semibold text-slate-700 dark:text-slate-200">
              {!isAdmin && filterMode === "MY_WINS"
                ? "No winning draws yet"
                : "No published draw results yet"}
            </Text>
            <Text className="mt-1 max-w-xs text-center text-xs text-slate-500">
              {!isAdmin && filterMode === "MY_WINS"
                ? "Keep playing! When your reserved numbers are drawn, your winning badges and prize payouts will appear right here."
                : "Past games and official winning numbers will be listed here after admin completes a live draw."}
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {filteredDraws.map((draw) => {
              const myWin = !isAdmin ? getUserWin(draw.winners) : null;
              const sortedWinners = [...(draw.winners || [])].sort(
                (a, b) => a.place - b.place,
              );

              return (
                <View
                  key={draw.id}
                  className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900 ${
                    myWin
                      ? "border-amber-400 bg-amber-50/20 dark:border-amber-600"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {/* Card Header: Title, Date, Status */}
                  <View className="flex-row items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800/80">
                    <View className="flex-1 pr-2">
                      <View className="flex-row flex-wrap items-center gap-1.5">
                        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {draw.gameTitle || `Bingo Game #${draw.gameId}`}
                        </Text>
                        <StatusPill status="COMPLETED" />
                      </View>
                      <View className="mt-1 flex-row items-center gap-1">
                        <Calendar size={13} color="#94a3b8" />
                        <Text className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(draw.createdAt)}
                        </Text>
                        {draw.totalPrize > 0 && (
                          <Text className="ml-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            • Pool: {draw.totalPrize.toLocaleString()} ETB
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Highlight banner if current user won */}
                  {myWin && (
                    <View className="mt-3 flex-row items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 p-2.5 dark:bg-amber-950/30">
                      <Sparkles size={18} color="#f59e0b" />
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-amber-800 dark:text-amber-300">
                          🎉 You Won {myWin.tierName || `#${myWin.place}`}!
                        </Text>
                        <Text className="text-xs text-amber-700 dark:text-amber-400">
                          Your Lucky Number #{myWin.number} won{" "}
                          {myWin.prizeAmount.toLocaleString()} ETB
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Section: Winning Numbers Breakdown */}
                  <View className="mt-3.5">
                    <Text className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Official Winning Numbers
                    </Text>

                    <View className="gap-2">
                      {sortedWinners.map((winner) => {
                        const rank = getRankBadge(winner.place);
                        const isMe =
                          !isAdmin &&
                          currentUserId &&
                          Number(winner.userId) === currentUserId;

                        return (
                          <View
                            key={`${draw.id}-winner-${winner.place}-${winner.number}`}
                            className={`flex-row items-center justify-between rounded-xl border p-2.5 ${
                              isMe
                                ? "border-amber-300 bg-amber-50/70 dark:border-amber-700 dark:bg-amber-950/40"
                                : `${rank.bg} ${rank.border}`
                            }`}
                          >
                            <View className="flex-1 flex-row items-center gap-2.5 pr-2">
                              <Text className="text-base">{rank.icon}</Text>
                              <View
                                className={`h-9 w-9 items-center justify-center rounded-full ${rank.ballBg}`}
                              >
                                <Text className="text-sm font-black text-white">
                                  #{winner.number}
                                </Text>
                              </View>
                              <View className="flex-1">
                                <View className="flex-row flex-wrap items-center gap-1.5">
                                  <Text
                                    className={`text-xs font-bold ${rank.text}`}
                                  >
                                    {winner.tierName || rank.label}
                                  </Text>
                                  {isMe && (
                                    <View className="rounded-md bg-amber-500 px-1.5 py-0.5">
                                      <Text className="text-[10px] font-black uppercase text-white">
                                        You
                                      </Text>
                                    </View>
                                  )}
                                </View>
                                <Text
                                  numberOfLines={1}
                                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                                >
                                  {winner.displayName ||
                                    `Player #${winner.userId || "?"}`}
                                </Text>
                              </View>
                            </View>

                            <View className="items-end pl-2">
                              <Text className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                {Number(winner.prizeAmount || 0).toLocaleString()}{" "}
                                ETB
                              </Text>
                              {winner.pct ? (
                                <Text className="text-[10px] text-slate-500">
                                  {winner.pct}% of pool
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
