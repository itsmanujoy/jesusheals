"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase, PlayerRecord } from "@/lib/supabase";
import { useGameStore } from "@/store/gameStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Home, 
  Settings2, 
  MapPin, 
  ShieldAlert, 
  X, 
  Crown,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function LeaderboardPage() {
  const router = useRouter();
  const { resetGame } = useGameStore();
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState(false);
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "jaago"; 

  const channelRef = useRef<any>(null);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    fetchLeaderboard();

    // Set up real-time subscription
    const channel = supabase
      .channel("leaderboard-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, 
      () => fetchLeaderboard())
      .subscribe();
    
    channelRef.current = channel;

    // Set up polling as backup
    const interval = setInterval(fetchLeaderboard, 5000);

    return () => {
      clearInterval(interval);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("final_score", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) {
        console.error("Error fetching leaderboard:", error);
      } else {
        setPlayers(data || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    // Validate password
    if (resetPassword !== ADMIN_PASSWORD) {
      setPasswordError(true);
      setResetPassword("");
      setTimeout(() => setPasswordError(false), 3000);
      return;
    }

    setResetLoading(true);
    setResetError(null);
    setPasswordError(false);

    try {
      // Delete all records - using a filter that matches all rows
      const { error, count } = await supabase
        .from("players")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // This matches all non-null UUIDs

      if (error) {
        // If the above fails, try alternative approach
        const { error: error2 } = await supabase
          .from("players")
          .delete()
          .gte("id", ""); // Match all rows with non-empty id
        
        if (error2) {
          throw new Error(error2.message || "Failed to delete records. Check database permissions.");
        }
      }

      // Success - update UI
      setPlayers([]);
      setShowResetConfirm(false);
      setResetPassword("");
      setResetError(null);
      
      // Refresh leaderboard to confirm deletion
      await fetchLeaderboard();
    } catch (error: any) {
      console.error("Reset error:", error);
      setResetError(error.message || "Failed to reset leaderboard. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const getRankStyles = (rank: number) => {
    if (rank === 1) return "from-yellow-400/20 to-transparent border-yellow-500/50 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.15)] ring-1 ring-yellow-500/20";
    if (rank === 2) return "from-gray-300/15 to-transparent border-gray-400/50 text-gray-200 shadow-[0_0_15px_rgba(156,163,175,0.1)]";
    if (rank === 3) return "from-orange-600/15 to-transparent border-orange-600/50 text-orange-300 shadow-[0_0_15px_rgba(234,88,12,0.1)]";
    return "border-white/20 bg-black/40 backdrop-blur-sm text-gray-100";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8 relative overflow-hidden">
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* --- Header Section --- */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 glass-effect p-5 md:p-6 rounded-[2.5rem] border border-white/10 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <Trophy className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Leaderboard</h1>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Global Standings</p>
            </div>
          </div>
        </motion.div>

        {/* --- Leaderboard Content --- */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-gray-500 font-bold uppercase tracking-widest animate-pulse">Syncing Scores...</p>
            </div>
          ) : players.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-effect rounded-[2.5rem] border border-white/10">
              <p className="text-xl text-gray-500">The podium is empty. Be the first to claim it!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {/* Header Row (Hidden on Mobile) */}
              <div className="hidden md:grid grid-cols-12 px-8 py-2 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5">Player</div>
                <div className="col-span-3">Region</div>
                <div className="col-span-3 text-right">Final Score</div>
              </div>

              {/* Player Rows */}
              <div className="space-y-3">
                {players.map((player, idx) => {
                  const rank = idx + 1;
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`grid grid-cols-1 md:grid-cols-12 items-center px-4 md:px-8 py-4 md:py-5 rounded-2xl border transition-all duration-300 hover:translate-x-1 md:hover:translate-x-2 group ${getRankStyles(rank)}`}
                    >
                      <div className="col-span-1 flex items-center gap-3 mb-2 md:mb-0">
                        <span className={`text-xl md:text-2xl font-black italic w-8 md:w-10 ${
                          rank <= 3 ? 'opacity-50' : 'opacity-60 text-gray-300'
                        }`}>#{rank}</span>
                        {rank <= 3 && <Crown className="w-5 h-5 md:hidden" />}
                      </div>
                      
                      <div className="col-span-5 flex items-center gap-3 md:gap-4">
                        <div className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center font-black text-xs border ${rank <= 3 ? 'border-current' : 'border-white/30 bg-white/10 text-gray-100'}`}>
                          {rank <= 3 ? <Crown className="w-5 h-5" /> : <span className="text-gray-100">{player.name[0].toUpperCase()}</span>}
                        </div>
                        <span className={`text-base md:text-lg font-bold tracking-tight break-words transition-colors ${
                          rank <= 3 
                            ? 'text-white group-hover:text-blue-400' 
                            : 'text-gray-100 group-hover:text-blue-300'
                        }`}>
                          {player.name}
                        </span>
                      </div>

                      <div className={`col-span-3 flex items-center gap-2 ${rank <= 3 ? 'text-gray-400 md:text-gray-500' : 'text-gray-300'}`}>
                        <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-medium truncate">{player.region}</span>
                      </div>

                      <div className="col-span-3 text-left md:text-right mt-2 md:mt-0">
                        <span className={`text-xl md:text-2xl font-black tracking-tighter ${
                          rank === 1 ? 'text-yellow-400' 
                          : rank === 2 ? 'text-gray-300' 
                          : rank === 3 ? 'text-orange-400' 
                          : 'text-gray-100'
                        }`}>
                          {player.final_score.toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Admin Reset Modal --- */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                if (!resetLoading) {
                  setShowResetConfirm(false);
                  setResetPassword("");
                  setResetError(null);
                  setPasswordError(false);
                }
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              aria-label="Close modal"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl glass-effect border border-red-500/20 bg-[#121216] rounded-[2rem] p-6 md:p-8 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reset-modal-title"
            >
              <div className="flex flex-col items-center text-center gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-red-500/10 text-red-500">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <div>
                  <h2 id="reset-modal-title" className="text-2xl font-black">Wipe Data?</h2>
                  <p className="text-gray-500 text-sm">This action is irreversible. All scores will be purged from the archive.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={resetPassword}
                    onChange={(e) => {
                      setResetPassword(e.target.value);
                      setPasswordError(false);
                      setResetError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !resetLoading) {
                        handleReset();
                      }
                    }}
                    placeholder="Enter Administrator Key"
                    aria-label="Administrator password"
                    className={`w-full px-5 py-4 rounded-2xl bg-white/5 border outline-none text-center font-mono tracking-widest transition-all ${
                      passwordError 
                        ? "border-red-500/50 focus:border-red-500" 
                        : "border-white/10 focus:border-red-500/50"
                    }`}
                    disabled={resetLoading}
                    autoFocus
                  />
                  {passwordError && (
                    <p className="mt-2 text-sm text-red-400 text-center flex items-center justify-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Incorrect password
                    </p>
                  )}
                </div>

                {resetError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    disabled={resetLoading || !resetPassword.trim()}
                    className="flex-1 py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      "Confirm Purge"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowResetConfirm(false);
                      setResetPassword("");
                      setResetError(null);
                      setPasswordError(false);
                    }}
                    disabled={resetLoading}
                    className="p-4 bg-white/5 text-gray-400 rounded-2xl hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Cancel"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}