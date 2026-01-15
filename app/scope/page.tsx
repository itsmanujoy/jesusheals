"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useLevelSync } from "@/utils/levelSync";
import { syncLevelUnlockToDatabase } from "@/utils/levelSync";
import { supabase, PlayerRecord } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Zap, Users, TrendingUp, RotateCw } from "lucide-react";

const LEVEL_CONFIG = {
  1: { name: "Level 1: Complete the Verse", color: "from-green-500 to-emerald-600" },
  2: { name: "Level 2: Multiple Choice", color: "from-blue-500 to-cyan-600" },
  3: { name: "Level 3: Image Identification", color: "from-teal-500 to-green-600" },
  4: { name: "Level 4: Easy - Fragment Arrange", color: "from-purple-500 to-pink-600" },
  5: { name: "Level 5: Medium2 - Fragment Arrange", color: "from-indigo-500 to-purple-600" },
  6: { name: "Level 6: Medium - Fragment Arrange", color: "from-orange-500 to-red-600" },
  7: { name: "Level 7: Image Identification", color: "from-red-500 to-rose-600" },
};

export default function ScopePage() {
  const { levelsUnlocked, unlockLevel, lockLevel } = useGameStore();
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLevelSync();

  const fetchLeaderboard = async () => {
    try {
      setRefreshing(true);
      const { data, error: fetchError } = await supabase
        .from("players")
        .select("*")
        .order("final_score", { ascending: false });

      if (fetchError) {
        console.error("Error fetching leaderboard:", fetchError);
        setError("Failed to load leaderboard");
        return;
      }

      setPlayers(data || []);
      setError(null);
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred while fetching leaderboard");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const refreshInterval = setInterval(fetchLeaderboard, 2000);
    return () => clearInterval(refreshInterval);
  }, []);

  const toggleLevel = async (level: 1 | 2 | 3 | 4 | 5 | 6 | 7) => {
    const newState = !levelsUnlocked[level];
    if (newState) {
      unlockLevel(level);
    } else {
      lockLevel(level);
    }
    const newLevels = { ...levelsUnlocked, [level]: newState };
    await syncLevelUnlockToDatabase(newLevels);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8 flex flex-col gap-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-700/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-700/10 rounded-full blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Host Control Panel</h1>
        <p className="text-gray-400">Manage level access and view live leaderboard</p>
      </motion.div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl p-6 space-y-4 sticky top-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold">Level Controls</h2>
            </div>

            <div className="space-y-3">
              {(Object.entries(LEVEL_CONFIG) as Array<[string, any]>).map(([level, config]) => {
                const levelNum = parseInt(level) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
                const isUnlocked = levelsUnlocked[levelNum];

                return (
                  <motion.button
                    key={level}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleLevel(levelNum)}
                    className={`w-full p-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-3 ${
                      isUnlocked
                        ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                        : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-700/50"
                    }`}
                  >
                    {isUnlocked ? (
                      <Unlock className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium text-xs">{config.name}</div>
                      <div className="text-xs opacity-75">
                        {isUnlocked ? "✓ Open" : "✗ Locked"}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="text-xs text-gray-500 mb-3">Active Levels</div>
              <div className="text-2xl font-bold text-blue-400">
                {Object.values(levelsUnlocked).filter(Boolean).length}/7
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold">Live Leaderboard</h2>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={fetchLeaderboard}
                disabled={refreshing}
                className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RotateCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </motion.button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            ) : players.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">No players yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">{player.name}</div>
                          <div className="text-xs text-gray-400">{player.region}</div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-lg font-bold text-green-400">{player.final_score || 0}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!loading && players.length > 0 && (
              <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Players</div>
                  <div className="text-2xl font-bold text-blue-400">{players.length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Highest Score</div>
                  <div className="text-2xl font-bold text-green-400">
                    {Math.max(...players.map(p => p.final_score || 0))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Average Score</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round(
                      players.reduce((sum, p) => sum + (p.final_score || 0), 0) /
                        players.length
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

