"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useLevelSync, pollLevelUnlockStatus } from "@/utils/levelSync";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Info, Zap } from "lucide-react";

export default function CountdownPage() {
  const router = useRouter();
  const { generateSecurityCode, levelsUnlocked, isLevelAccessible, setLevelsUnlocked } = useGameStore();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [displayCode, setDisplayCode] = useState<string | null>(null);
  const [progress, setProgress] = useState(100);
  const [isNavigating, setIsNavigating] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useLevelSync();

  useEffect(() => {
    // Start countdown immediately - skip security code
    setCountdown(5);
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      // Don't use setInterval - instead watch for level unlock directly
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Separate effect to watch for level 1 unlock when countdown is finished
  useEffect(() => {
    if (countdown !== 0 || isNavigating) {
      // Clear polling if countdown is still running
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Start polling for level unlock when countdown reaches 0
    if (!pollingIntervalRef.current) {
      const pollForLevelUnlock = async () => {
        const levels = await pollLevelUnlockStatus();
        if (levels && levels[1]) {
          setLevelsUnlocked(levels);
        }
      };

      // Poll immediately
      pollForLevelUnlock();

      // Then poll every 500ms (twice per second for responsiveness)
      pollingIntervalRef.current = setInterval(pollForLevelUnlock, 500);
    }

    // Check if level is already unlocked
    if (isLevelAccessible(1)) {
      setIsNavigating(true);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setTimeout(() => {
        router.push("/level/1");
      }, 800);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [countdown, isLevelAccessible, router, isNavigating, levelsUnlocked, setLevelsUnlocked]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0a0a0c] text-white">
      
      {/* --- Atmospheric Background --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 transition-colors duration-1000 ${countdown !== null ? 'bg-blue-600/5' : 'bg-amber-600/5'}`} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <AnimatePresence mode="wait">
          {/* PHASE 1: NUMERIC COUNTDOWN */}
          {countdown !== null && (
            <motion.div
              key="countdown-phase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center"
            >
              <AnimatePresence mode="popLayout">
                {countdown > 0 ? (
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative"
                  >
                    {/* Pulsing ring around number */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-blue-500/30 rounded-full animate-ping" />
                    
                    <span className="text-[12rem] md:text-[15rem] font-black leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                      {countdown}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="go"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="p-6 bg-blue-500 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.6)]">
                      <Zap className="w-16 h-16 text-white fill-white" />
                    </div>
                    <h1 className="text-7xl font-black italic tracking-tighter text-white">
                      {levelsUnlocked[1] ? "GO!" : "WAIT"}
                    </h1>
                    {levelsUnlocked[1] ? (
                      <p className="text-gray-300 text-lg mt-4">Level 1 is open, loading...</p>
                    ) : (
                      <p className="text-gray-400 text-lg mt-4">Waiting for host to open Level 1</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- UI Labels --- */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center">
        <p className="text-gray-500 text-sm font-medium tracking-[0.3em] uppercase">
          {levelsUnlocked[1] ? "Starting Level 1" : "Awaiting Host"}
        </p>
      </div>
    </div>
  );
}