"use client";

import { useEffect, useState } from "react";
import { getRankStats } from "@/utils/leaderboard";
import { RankDisplay } from "@/components/RankDisplay";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Trophy } from "lucide-react";

interface LevelRankModalProps {
  isVisible: boolean;
  levelNumber: number;
  currentScore: number;
  previousRank: number | null;
  onContinue: () => void;
}

export function LevelRankModal({
  isVisible,
  levelNumber,
  currentScore,
  previousRank,
  onContinue,
}: LevelRankModalProps) {
  const [rankStats, setRankStats] = useState<{
    rank: number;
    totalPlayers: number;
    percentile: number;
  } | null>(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setShowButton(false);
      return;
    }

    // Fetch rank stats
    const fetchRankStats = async () => {
      const stats = await getRankStats(currentScore);
      setRankStats(stats);
    };

    fetchRankStats();

    // Show button after animations
    const timer = setTimeout(() => setShowButton(true), 1800);
    return () => clearTimeout(timer);
  }, [isVisible, currentScore]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 flex items-center justify-center p-4"
          onClick={onContinue}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-effect rounded-[2.5rem] border border-white/10 bg-black/95 backdrop-blur-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center mb-6"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Trophy className="w-6 h-6 text-amber-500 animate-pulse" />
                  <h2 className="text-2xl md:text-3xl font-black text-white">
                    Level {levelNumber} Complete!
                  </h2>
                </div>
                <p className="text-gray-400 text-sm uppercase tracking-widest font-medium">
                  Score: {currentScore}
                </p>
              </motion.div>

              {/* Rank Display */}
              {rankStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
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

              {/* Continue Button */}
              <AnimatePresence>
                {showButton && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onContinue}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-3 group"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
