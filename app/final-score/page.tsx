"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { getScoreBreakdown } from "@/utils/scoring";
import { getRankStats } from "@/utils/leaderboard";
import { supabase, PlayerRecord } from "@/lib/supabase";
import { RankDisplay } from "@/components/RankDisplay";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trophy, LayoutDashboard, RotateCcw, MapPin } from "lucide-react";
import confetti from "canvas-confetti";

export default function FinalScorePage() {
  const router = useRouter();
  const {
    playerData,
    levelScores,
    getFinalScore,
    resetGame,
    securityCode,
    currentRank,
    previousRank,
    setRank,
  } = useGameStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [rankStats, setRankStats] = useState<{ rank: number; totalPlayers: number; percentile: number } | null>(null);
  const hasSubmittedRef = useRef(false); // Prevent duplicate submissions

  const finalScore = getFinalScore();
  const breakdown = getScoreBreakdown(levelScores);

  useEffect(() => {
    setShowContent(true);
    
    // Fetch rank statistics
    const fetchRankStats = async () => {
      const stats = await getRankStats(finalScore);
      setRankStats(stats);
      setRank(stats.rank);
    };
    
    fetchRankStats();
    
    // Fabulous Multi-burst Confetti Sequence
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#fbbf24', '#ffffff']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#fbbf24', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [finalScore, setRank]);

  useEffect(() => {
    const submitScore = async () => {
      // Prevent duplicate submissions
      if (!playerData || hasSubmittedRef.current) return;
      
      hasSubmittedRef.current = true;
      setIsSubmitting(true);
      
      try {
        const playerRecord: Omit<PlayerRecord, "id" | "created_at"> = {
          name: playerData.name,
          region: playerData.region,
          security_code: securityCode || undefined,
          final_score: finalScore,
          intro_score: breakdown.intro,
          mcq_score: breakdown.mcq,
          image_score: breakdown.image,
          easy_score: breakdown.easy,
          medium2_score: breakdown.medium2,
          medium_score: breakdown.medium,
          image2_score: breakdown.image2,
        };

        const { error } = await supabase.from("players").insert(playerRecord);
        
        if (error) {
          console.error("Error submitting score:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
          // Reset flag on error so user can retry if needed
          hasSubmittedRef.current = false;
        } else {
          console.log("Score submitted successfully!");
        }
      } catch (error) {
        console.error("Error submitting score:", {
          message: error instanceof Error ? error.message : String(error),
          error: error,
        });
        // Reset flag on error so user can retry if needed
        hasSubmittedRef.current = false;
      } finally {
        setIsSubmitting(false);
      }
    };
    
    submitScore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - dependencies removed to prevent re-submission

  const handlePlayAgain = () => {
    resetGame();
    router.push("/");
    router.refresh();
  };

  const handleViewLeaderboard = () => {
    router.push("/score");
  };

  if (!playerData) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="rounded-full h-12 w-12 border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-[#0a0a0c] text-white">
      
      {/* --- Visual Backdrop --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-amber-500/10 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence>
        {showContent && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md relative z-10"
          >
            {/* Main Card */}
            <div className="relative glass-effect rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-6 shadow-2xl">
              
              {/* Trophy Icon */}
              <div className="flex justify-center mb-4">
                <motion.div 
                  initial={{ y: -20, scale: 0 }} 
                  animate={{ y: 0, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="p-4 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30"
                >
                  <Trophy className="w-12 h-12 text-amber-400" />
                </motion.div>
              </div>

              {/* Game Complete Text */}
              <h1 className="text-2xl font-black text-center text-white uppercase tracking-wide mb-1">
                Game Complete!
              </h1>
              
              {/* Player Info */}
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6">
                <span className="font-semibold text-blue-400">{playerData.name}</span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {playerData.region}
                </span>
              </div>

              {/* Score Display */}
              <motion.div 
                initial={{ scale: 0.8 }} 
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative mb-6"
              >
                <div className="absolute -inset-2 bg-blue-500/20 blur-2xl rounded-full opacity-50" />
                <div className="relative py-8 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400 mb-3">Your Score</p>
                  <span className="text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                    {finalScore}
                  </span>
                </div>
              </motion.div>

              {/* Rank Display */}
              {rankStats && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
                  <RankDisplay
                    currentRank={rankStats.rank}
                    previousRank={previousRank}
                    totalPlayers={rankStats.totalPlayers}
                    percentile={rankStats.percentile}
                    animate={true}
                  />
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleViewLeaderboard}
                  className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg transition-all duration-200 active:scale-[0.98] shadow-lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    <LayoutDashboard className="w-5 h-5" />
                    View Leaderboard
                  </span>
                </button>

                <button
                  onClick={handlePlayAgain}
                  className="w-full py-3 rounded-xl border border-white/10 bg-white/5 font-medium text-gray-300 active:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
              </div>

              {isSubmitting && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="mt-4 flex items-center justify-center gap-2 text-blue-400 text-xs font-medium"
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-3 w-3 border-t border-blue-400 rounded-full" />
                  Saving score...
                </motion.div>
              )}

              {/* Developer Credits */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-6 pt-4 border-t border-white/5 flex flex-col items-center gap-2"
              >
                <p className="text-gray-600 text-[9px] font-bold uppercase tracking-widest">Developed by</p>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://dariogeorge.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5"
                  >
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20">
                      <Image
                        src="/images/developers/dario.jpg"
                        alt="Dario George"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-gray-500 text-xs">Dario</span>
                  </a>
                  <div className="w-px h-4 bg-white/10"></div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20">
                      <Image
                        src="/images/developers/joshna.jpg"
                        alt="Joshna Jojo"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-gray-500 text-xs">Joshna</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ScoreBox component removed - no longer needed