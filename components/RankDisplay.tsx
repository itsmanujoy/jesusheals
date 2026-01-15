"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Users } from "lucide-react";

interface RankDisplayProps {
  currentRank: number;
  previousRank: number | null;
  totalPlayers: number;
  percentile: number;
  animate?: boolean;
}

export function RankDisplay({
  currentRank,
  previousRank,
  totalPlayers,
  percentile,
  animate = true,
}: RankDisplayProps) {
  const rankChanged = previousRank !== null && previousRank !== currentRank;
  const rankImproved = previousRank !== null && currentRank < previousRank;

  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.9, y: 20 } : { opacity: 1, scale: 1, y: 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-effect rounded-2xl border border-white/10 p-6 overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Trophy className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">
              Leaderboard Rank
            </p>
            <h3 className="text-white font-bold">Your Position</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Current Rank */}
        <motion.div
          initial={animate ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative"
        >
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <motion.div
              initial={animate ? { scale: 0 } : { scale: 1 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 10,
                delay: 0.4,
              }}
              className="text-3xl md:text-4xl font-black text-blue-400 mb-1"
            >
              #{currentRank}
            </motion.div>
            <p className="text-gray-500 text-xs uppercase tracking-widest">
              Your Rank
            </p>
          </div>

          {/* Rank Change Animation */}
          {rankChanged && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className={`absolute -top-3 -right-3 p-2 rounded-full border-2 ${
                rankImproved
                  ? "bg-green-500/20 border-green-500/50 text-green-400"
                  : "bg-red-500/20 border-red-500/50 text-red-400"
              }`}
            >
              {rankImproved ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Percentile */}
        <motion.div
          initial={animate ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-center p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <motion.div
            initial={animate ? { scale: 0 } : { scale: 1 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 10,
              delay: 0.45,
            }}
            className="text-3xl md:text-4xl font-black text-purple-400 mb-1"
          >
            {percentile}%
          </motion.div>
          <p className="text-gray-500 text-xs uppercase tracking-widest">
            Percentile
          </p>
        </motion.div>

        {/* Total Players */}
        <motion.div
          initial={animate ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <motion.div
            initial={animate ? { scale: 0 } : { scale: 1 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 10,
              delay: 0.5,
            }}
            className="text-3xl md:text-4xl font-black text-amber-400 mb-1 flex items-center justify-center gap-1"
          >
            <Users className="w-6 h-6" />
            {totalPlayers}
          </motion.div>
          <p className="text-gray-500 text-xs uppercase tracking-widest">
            Total Players
          </p>
        </motion.div>
      </div>

      {/* Rank Change Message */}
      {rankChanged && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className={`mt-4 p-3 rounded-lg text-sm font-medium text-center ${
            rankImproved
              ? "bg-green-500/10 border border-green-500/30 text-green-300"
              : "bg-blue-500/10 border border-blue-500/30 text-blue-300"
          }`}
        >
          {rankImproved
            ? `🎉 Great job! You jumped ${previousRank! - currentRank} positions!`
            : `Your rank is now #${currentRank}`}
        </motion.div>
      )}
    </motion.div>
  );
}
