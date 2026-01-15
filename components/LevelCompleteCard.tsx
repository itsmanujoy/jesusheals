"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { getRankStats } from "@/utils/leaderboard";
import { RankDisplay } from "@/components/RankDisplay";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Trophy } from "lucide-react";

interface LevelCompleteProps {
  levelNumber: number;
  nextLevel: number;
}

export function LevelCompleteCard({
  levelNumber,
  nextLevel,
}: LevelCompleteProps) {
  const router = useRouter();
  const { getFinalScore, currentRank, previousRank, setRank } = useGameStore();
  const [rankStats, setRankStats] = useState<{
    rank: number;
    totalPlayers: number;
    percentile: number;
  } | null>(null);
  const [showContinue, setShowContinue] = useState(false);

  const currentScore = getFinalScore();

  useEffect(() => {
    // Fetch rank stats based on current score
    const fetchRankStats = async () => {
      const stats = await getRankStats(currentScore);
      setRankStats(stats);
      setRank(stats.rank);
    };

    fetchRankStats();

    // Show continue button after animations complete
    const timer = setTimeout(() => setShowContinue(true), 2000);
    return () => clearTimeout(timer);
  }, [currentScore, setRank]);

  const handleContinue = () => {
    if (nextLevel > 5) {
      router.push("/verify");
    } else {
      router.push(`/level/${nextLevel}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-2xl"
      >
        <div className="glass-effect rounded-[2.5rem] border border-white/10 bg-black/95 backdrop-blur-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Trophy className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Level {levelNumber} Complete!
              </h2>
            </div>
            <p className="text-gray-400 text-sm uppercase tracking-widest font-medium">
              Current Score: {currentScore}
            </p>
          </motion.div>

          {/* Rank Display */}
          {rankStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-6"
            >
              <RankDisplay
                currentRank={rankStats.rank}
                previousRank={previousRank}
                totalPlayers={rankStats.totalPlayers}
                percentile={rankStats.percentile}
                animate={false}
              />
            </motion.div>
          )}

          {/* Continue Button */}
          <AnimatePresence>
            {showContinue && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-3 group"
              >
                Continue to Level {nextLevel}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LevelCompletePage() {
  const router = useRouter();
  const levelParam = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get(
    "level"
  );
  const levelNumber = levelParam ? parseInt(levelParam) : 0;

  if (!levelNumber || ![1, 2, 3, 4, 5].includes(levelNumber)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <LevelCompleteCard levelNumber={levelNumber} nextLevel={levelNumber + 1} />
    </div>
  );
}
