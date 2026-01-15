"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGameStore, LevelType } from "@/store/gameStore";
import { useLevelSync, pollLevelUnlockStatus } from "@/utils/levelSync";
import {
  getFixedVerse,
  getRandomVerses,
  Verse,
  getFixedIncompleteVerse,
  getFixedMCQVerse,
  getFixedImageQuestion,
  getFixedImageQuestion2,
  getFixedMedium2Verse,
  IncompleteVerse,
  MCQVerse,
  ImageQuestion,
  shuffleArray,
} from "@/data/verses";
import {
  splitVerseIntoFragments,
  shuffleFragments,
  Fragment,
} from "@/utils/fragmentSplitter";
import { calculateLevelScore, getScoreBreakdown } from "@/utils/scoring";
import { getRankStats } from "@/utils/leaderboard";
import { supabase } from "@/lib/supabase";
import { FragmentDraggable } from "@/components/FragmentDraggable";
import { LevelTimer } from "@/components/LevelTimer";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Hash, Layers, CheckCircle2, AlertCircle, AlertTriangle, Lock } from "lucide-react";

// Timer durations for each level
const LEVEL_TIMES: Record<number, number> = {
  1: 45,  // Level 1: Complete-the-verse (45s)
  2: 30,  // Level 2: Multiple choice (30s)
  3: 30,  // Level 3: Image identification (30s)
  4: 45,  // Level 4: Easy fragment arrange
  5: 45,  // Level 5: Medium2 fragment arrange
  6: 45,  // Level 6: Medium fragment arrange
  7: 45,  // Level 7: Hard fragment + reference
};

// Map level number to difficulty type
const getLevelType = (level: number): LevelType => {
  switch (level) {
    case 1: return "intro";
    case 2: return "mcq";
    case 3: return "image";
    case 4: return "easy";
    case 5: return "medium2";
    case 6: return "medium";
    case 7: return "image2";
    default: return "easy";
  }
};

// Get level display info
const getLevelInfo = (level: number) => {
  switch (level) {
    case 1: return { name: "Intro", subtitle: "Complete the Verse" };
    case 2: return { name: "Quiz", subtitle: "Multiple Choice" };
    case 3: return { name: "Vision", subtitle: "Identify the Person" };
    case 4: return { name: "Beginner", subtitle: "Arrange Fragments" };
    case 5: return { name: "Apprentice", subtitle: "Arrange Fragments" };
    case 6: return { name: "Acolyte", subtitle: "Arrange Fragments" };
    case 7: return { name: "Scholar", subtitle: "Identify the Person" };
    default: return { name: "Unknown", subtitle: "" };
  }
};

export default function LevelPage() {
  const router = useRouter();
  const params = useParams();
  const levelNumber = parseInt(params.levelNumber as string, 10);
  const {
    setCurrentLevel,
    setCurrentVerse,
    addLevelScore,
    setGameCompleted,
    playerData,
    securityCode,
    getFinalScore,
    setRank,
    levelScores,
    generateSecurityCode,
    isLevelAccessible,
  } = useGameStore();

  // Common state
  const [timeRemaining, setTimeRemaining] = useState(LEVEL_TIMES[levelNumber] || 45);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [showLockScreen, setShowLockScreen] = useState(true);
  const [showWaitingScreen, setShowWaitingScreen] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Level 1 (intro) state: Complete-the-verse
  const [incompleteVerse, setIncompleteVerse] = useState<IncompleteVerse | null>(null);
  const [introFragments, setIntroFragments] = useState<Fragment[]>([]);
  const [selectedIntroOrder, setSelectedIntroOrder] = useState<Fragment[]>([]);

  // Level 2 (mcq) state: Multiple choice
  const [mcqVerse, setMcqVerse] = useState<MCQVerse | null>(null);
  const [mcqOptions, setMcqOptions] = useState<string[]>([]);
  const [selectedMcqOption, setSelectedMcqOption] = useState<string>("");

  // Level 3 (image) state: Image identification
  const [imageQuestion, setImageQuestion] = useState<ImageQuestion | null>(null);
  const [imageOptions, setImageOptions] = useState<string[]>([]);
  const [selectedImageOption, setSelectedImageOption] = useState<string>("");

  // Level 7 (image2) state: Image identification (second set)
  const [image2Question, setImage2Question] = useState<ImageQuestion | null>(null);
  const [image2Options, setImage2Options] = useState<string[]>([]);
  const [selectedImage2Option, setSelectedImage2Option] = useState<string>("");

  // Level 4-6 state (fragment arrange)
  const [verse, setVerse] = useState<Verse | null>(null);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Fragment[]>([]);
  const [showFullReference, setShowFullReference] = useState(true);
  const [referenceOptions, setReferenceOptions] = useState<string[]>([]);
  const [selectedReference, setSelectedReference] = useState<string>("");

  // Set up real-time level sync
  useLevelSync();

  useEffect(() => {
    // Validate level number
    if (![1, 2, 3, 4, 5, 6, 7].includes(levelNumber)) {
      router.push("/");
      return;
    }

    // Check if level is accessible
    const accessible = isLevelAccessible(levelNumber as 1 | 2 | 3 | 4 | 5 | 6 | 7);
    setIsLocked(!accessible);

    if (!accessible) {
      setShowLockScreen(true);
      // Listen for level unlock and auto-load when it becomes accessible
      const checkInterval = setInterval(() => {
        const isNowAccessible = isLevelAccessible(levelNumber as 1 | 2 | 3 | 4 | 5 | 6 | 7);
        if (isNowAccessible) {
          setShowLockScreen(false);
          setIsLocked(false);
          setCurrentLevel(levelNumber as 1 | 2 | 3 | 4 | 5 | 6 | 7);
          setTimeRemaining(LEVEL_TIMES[levelNumber] || 45);
          clearInterval(checkInterval);
        }
      }, 100); // Check every 100ms for immediate response
      return () => clearInterval(checkInterval);
    }

    setShowLockScreen(false);
    setCurrentLevel(levelNumber as 1 | 2 | 3 | 4 | 5 | 6 | 7);
    setTimeRemaining(LEVEL_TIMES[levelNumber] || 45);

    // Content will be loaded by the separate useEffect below
  }, [levelNumber, setCurrentLevel, router, isLevelAccessible]);

  // Effect to load level content when lock screen is dismissed
  useEffect(() => {
    if (showLockScreen) return; // Don't load if still locked

    // Level 1: Complete-the-verse
    if (levelNumber === 1) {
      const selected = getFixedIncompleteVerse();
      setIncompleteVerse(selected);
      // Create fragments from the missing pieces
      const frags: Fragment[] = selected.missingFragments.map((text, idx) => ({
        id: `intro-frag-${idx}`,
        text,
        originalIndex: idx,
      }));
      setIntroFragments(shuffleFragments(frags));
      return;
    }

    // Level 2: Multiple choice
    if (levelNumber === 2) {
      const selected = getFixedMCQVerse();
      setMcqVerse(selected);
      // Shuffle all options (correct + wrong)
      const allOptions = shuffleArray([selected.correctEnding, ...selected.wrongOptions]);
      setMcqOptions(allOptions);
      return;
    }

    // Level 3: Image identification
    if (levelNumber === 3) {
      const selected = getFixedImageQuestion();
      setImageQuestion(selected);
      // Shuffle all options (correct + wrong)
      const allOptions = shuffleArray([selected.correctAnswer, ...selected.wrongOptions]);
      setImageOptions(allOptions);
      return;
    }

    // Level 5: Medium2 fragment arrange
    if (levelNumber === 5) {
      const selectedVerse = getFixedMedium2Verse();
      setVerse(selectedVerse);
      setCurrentVerse(selectedVerse);
      const verseFragments = splitVerseIntoFragments(selectedVerse.text);
      const shuffled = shuffleFragments(verseFragments);
      setFragments(shuffled);
      return;
    }

    // Level 7: Image identification (second set)
    if (levelNumber === 7) {
      const selected = getFixedImageQuestion2();
      setImage2Question(selected);
      // Shuffle all options (correct + wrong)
      const allOptions = shuffleArray([selected.correctAnswer, ...selected.wrongOptions]);
      setImage2Options(allOptions);
      return;
    }

    // Levels 4, 6: Fragment arrange (original functionality)
    const difficulty = levelNumber === 4 ? "easy" : "medium";
    const selectedVerse = getFixedVerse(difficulty);
    setVerse(selectedVerse);
    setCurrentVerse(selectedVerse);

    const verseFragments = splitVerseIntoFragments(selectedVerse.text);
    const shuffled = shuffleFragments(verseFragments);
    setFragments(shuffled);

    // Level 6: Show partial reference initially
    if (levelNumber === 6) {
      setShowFullReference(false);
      const timer = setTimeout(() => setShowFullReference(true), 15000);
      return () => clearTimeout(timer);
    }
  }, [showLockScreen, levelNumber, setCurrentVerse]);

  // Effect to handle waiting screen with polling for next level
  useEffect(() => {
    if (!showWaitingScreen || levelNumber === 7) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const nextLevel = (levelNumber + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;

    // Function to poll for next level unlock
    const pollForNextLevel = async () => {
      const levels = await pollLevelUnlockStatus();
      if (levels && levels[nextLevel]) {
        // Next level is unlocked, redirect directly to next level
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setTimeout(() => {
          router.push(`/level/${nextLevel}`);
        }, 500);
      }
    };

    // Poll immediately
    pollForNextLevel();

    // Then poll every 500ms
    pollingIntervalRef.current = setInterval(pollForNextLevel, 500);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [showWaitingScreen, levelNumber, router]);

  const proceedToNext = () => {
    if (levelNumber === 7) {
      setGameCompleted(true);
      router.push("/final-score");
    } else {
      // Show waiting screen instead of redirecting immediately
      setShowWaitingScreen(true);
    }
  };

  const handleTimeout = () => {
    if (isSubmitted) return;
    // Check if we have any content to score
    const hasContent = levelNumber === 1 ? incompleteVerse : levelNumber === 2 ? mcqVerse : levelNumber === 3 ? imageQuestion : levelNumber === 7 ? image2Question : verse;
    if (!hasContent) return;

    setIsSubmitted(true);
    const levelType = getLevelType(levelNumber);
    const score = calculateLevelScore(0, levelType, false);
    addLevelScore({
      level: levelType,
      score,
      timeRemaining: 0,
      correct: false,
    });
    // push intermediate score to leaderboard so remote viewers see progress
    (async () => {
      try {
        if (!playerData) return;
        const sc = securityCode || generateSecurityCode();
        const currentLevelScores = [...levelScores, { level: levelType, score, timeRemaining: 0, correct: false }];
        const breakdown = getScoreBreakdown(currentLevelScores);
        const playerRecord = {
          name: playerData.name,
          region: playerData.region,
          security_code: sc,
          final_score: breakdown.total,
          intro_score: breakdown.intro,
          mcq_score: breakdown.mcq,
          image_score: breakdown.image,
          easy_score: breakdown.easy,
          medium2_score: breakdown.medium2,
          medium_score: breakdown.medium,
          image2_score: breakdown.image2,
        } as any;
        await supabase.from("players").upsert(playerRecord, { onConflict: "security_code" });
        const stats = await getRankStats(breakdown.total);
        setRank(stats.rank);
      } catch (e) {
        console.error("Error upserting progress:", e);
      }
    })();
    setFeedback("incorrect");
    setTimeout(proceedToNext, 2500);
  };

  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0) return;
    const timer = setInterval(() => setTimeRemaining((prev: number) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, timeRemaining]);

  useEffect(() => {
    const hasContent = levelNumber === 1 ? incompleteVerse : levelNumber === 2 ? mcqVerse : levelNumber === 3 ? imageQuestion : levelNumber === 7 ? image2Question : verse;
    if (timeRemaining === 0 && !isSubmitted && hasContent) handleTimeout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, isSubmitted, incompleteVerse, mcqVerse, imageQuestion, image2Question, verse]);

  // Handle fragment click for Level 1 (intro)
  const handleIntroFragmentClick = (fragment: Fragment) => {
    if (isSubmitted) return;
    if (selectedIntroOrder.some((f) => f.id === fragment.id)) {
      setSelectedIntroOrder(selectedIntroOrder.filter((f) => f.id !== fragment.id));
    } else {
      setSelectedIntroOrder([...selectedIntroOrder, fragment]);
    }
  };

  // Handle fragment click for Levels 4-7
  const handleFragmentClick = (fragment: Fragment) => {
    if (isSubmitted) return;
    if (selectedOrder.some((f) => f.id === fragment.id)) {
      setSelectedOrder(selectedOrder.filter((f) => f.id !== fragment.id));
    } else {
      setSelectedOrder([...selectedOrder, fragment]);
    }
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    const levelType = getLevelType(levelNumber);

    // Level 1: Complete-the-verse
    if (levelNumber === 1 && incompleteVerse) {
      const correctOrder = incompleteVerse.missingFragments;
      const isCorrect = selectedIntroOrder.length === correctOrder.length &&
        selectedIntroOrder.every((f, idx) => f.text === correctOrder[idx]);

      setIsSubmitted(true);
      const score = calculateLevelScore(timeRemaining, levelType, isCorrect);
      addLevelScore({ level: levelType, score, timeRemaining, correct: isCorrect });
      (async () => {
        try {
          if (!playerData) return;
          const sc = securityCode || generateSecurityCode();
          const currentLevelScores = [...levelScores, { level: levelType, score, timeRemaining, correct: isCorrect }];
          const breakdown = getScoreBreakdown(currentLevelScores);
          const playerRecord = {
            name: playerData.name,
            region: playerData.region,
            security_code: sc,
            final_score: breakdown.total,
            intro_score: breakdown.intro,
            mcq_score: breakdown.mcq,
            image_score: breakdown.image,
            easy_score: breakdown.easy,
            medium2_score: breakdown.medium2,
            medium_score: breakdown.medium,
            image2_score: breakdown.image2,
          } as any;
          await supabase.from("players").upsert(playerRecord, { onConflict: "security_code" });
          const stats = await getRankStats(breakdown.total);
          setRank(stats.rank);
        } catch (e) {
          console.error("Error upserting progress:", e);
        }
      })();
      setFeedback(isCorrect ? "correct" : "incorrect");
      setTimeout(proceedToNext, 2500);
      return;
    }

    // Level 2: Multiple choice
    if (levelNumber === 2 && mcqVerse) {
      const isCorrect = selectedMcqOption === mcqVerse.correctEnding;

      setIsSubmitted(true);
      const score = calculateLevelScore(timeRemaining, levelType, isCorrect);
      addLevelScore({ level: levelType, score, timeRemaining, correct: isCorrect });
      (async () => {
        try {
          if (!playerData) return;
          const sc = securityCode || generateSecurityCode();
          const currentLevelScores = [...levelScores, { level: levelType, score, timeRemaining, correct: isCorrect }];
          const breakdown = getScoreBreakdown(currentLevelScores);
          const playerRecord = {
            name: playerData.name,
            region: playerData.region,
            security_code: sc,
            final_score: breakdown.total,
            intro_score: breakdown.intro,
            mcq_score: breakdown.mcq,
            image_score: breakdown.image,
            easy_score: breakdown.easy,
            medium2_score: breakdown.medium2,
            medium_score: breakdown.medium,
            image2_score: breakdown.image2,
          } as any;
          await supabase.from("players").upsert(playerRecord, { onConflict: "security_code" });
          const stats = await getRankStats(breakdown.total);
          setRank(stats.rank);
        } catch (e) {
          console.error("Error upserting progress:", e);
        }
      })();
      setFeedback(isCorrect ? "correct" : "incorrect");
      setTimeout(proceedToNext, 2500);
      return;
    }

    // Level 3: Image identification
    if (levelNumber === 3 && imageQuestion) {
      const isCorrect = selectedImageOption === imageQuestion.correctAnswer;

      setIsSubmitted(true);
      const score = calculateLevelScore(timeRemaining, levelType, isCorrect);
      addLevelScore({ level: levelType, score, timeRemaining, correct: isCorrect });
      (async () => {
        try {
          if (!playerData) return;
          const sc = securityCode || generateSecurityCode();
          const currentLevelScores = [...levelScores, { level: levelType, score, timeRemaining, correct: isCorrect }];
          const breakdown = getScoreBreakdown(currentLevelScores);
          const playerRecord = {
            name: playerData.name,
            region: playerData.region,
            security_code: sc,
            final_score: breakdown.total,
            intro_score: breakdown.intro,
            mcq_score: breakdown.mcq,
            image_score: breakdown.image,
            easy_score: breakdown.easy,
            medium2_score: breakdown.medium2,
            medium_score: breakdown.medium,
            image2_score: breakdown.image2,
          } as any;
          await supabase.from("players").upsert(playerRecord, { onConflict: "security_code" });
          const stats = await getRankStats(breakdown.total);
          setRank(stats.rank);
        } catch (e) {
          console.error("Error upserting progress:", e);
        }
      })();
      setFeedback(isCorrect ? "correct" : "incorrect");
      setTimeout(proceedToNext, 2500);
      return;
    }

    // Level 7: Image identification (second set)
    if (levelNumber === 7 && image2Question) {
      const isCorrect = selectedImage2Option === image2Question.correctAnswer;

      setIsSubmitted(true);
      const score = calculateLevelScore(timeRemaining, levelType, isCorrect);
      addLevelScore({ level: levelType, score, timeRemaining, correct: isCorrect });
      (async () => {
        try {
          if (!playerData) return;
          const sc = securityCode || generateSecurityCode();
          const currentLevelScores = [...levelScores, { level: levelType, score, timeRemaining, correct: isCorrect }];
          const breakdown = getScoreBreakdown(currentLevelScores);
          const playerRecord = {
            name: playerData.name,
            region: playerData.region,
            security_code: sc,
            final_score: breakdown.total,
            intro_score: breakdown.intro,
            mcq_score: breakdown.mcq,
            image_score: breakdown.image,
            easy_score: breakdown.easy,
            medium2_score: breakdown.medium2,
            medium_score: breakdown.medium,
            image2_score: breakdown.image2,
          } as any;
          await supabase.from("players").upsert(playerRecord, { onConflict: "security_code" });
          const stats = await getRankStats(breakdown.total);
          setRank(stats.rank);
        } catch (e) {
          console.error("Error upserting progress:", e);
        }
      })();
      setFeedback(isCorrect ? "correct" : "incorrect");
      setTimeout(proceedToNext, 2500);
      return;
    }

    // Levels 4-6: Fragment arrange
    if (!verse) return;

    const correctOrder = fragments.slice().sort((a, b) => a.originalIndex - b.originalIndex);
    const isCorrect = selectedOrder.length === correctOrder.length &&
                      selectedOrder.every((f, idx) => f.originalIndex === correctOrder[idx].originalIndex);

    setIsSubmitted(true);
    const score = calculateLevelScore(timeRemaining, levelType, isCorrect);
    addLevelScore({ level: levelType, score, timeRemaining, correct: isCorrect });
    (async () => {
      try {
        if (!playerData) return;
        const currentScore = getFinalScore();
        const playerRecord = {
          name: playerData.name,
          region: playerData.region,
          security_code: securityCode || undefined,
          final_score: currentScore,
        } as any;
        await supabase.from("players").upsert(playerRecord, { onConflict: "security_code" });
        const stats = await getRankStats(currentScore);
        setRank(stats.rank);
      } catch (e) {
        console.error("Error upserting progress:", e);
      }
    })();
    setFeedback(isCorrect ? "correct" : "incorrect");
    setTimeout(proceedToNext, 2500);
  };

  const getDisplayReference = () => {
    // Level 1: Show incomplete verse reference
    if (levelNumber === 1 && incompleteVerse) return incompleteVerse.reference;
    // Level 2: Show MCQ verse reference
    if (levelNumber === 2 && mcqVerse) return mcqVerse.reference;
    // Level 3: No reference for image identification
    if (levelNumber === 3) return "";
    // Level 4: Full reference
    if (levelNumber === 4 && verse) return verse.reference;
    // Level 5: Full reference for Medium2
    if (levelNumber === 5 && verse) return verse.reference;
    // Level 6: Partial then full reference
    if (levelNumber === 6 && verse) return showFullReference ? verse.reference : verse.reference.split(" ")[0];
    // Level 7: Image identification - no reference shown
    return "";
  };

  // Check if we have content to display
  const isLoading = levelNumber === 1 ? !incompleteVerse : levelNumber === 2 ? !mcqVerse : levelNumber === 3 ? !imageQuestion : levelNumber === 7 ? !image2Question : !verse;
  if (isLoading && !showLockScreen) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white">Loading...</div>;

  const levelInfo = getLevelInfo(levelNumber);

  // Show lock screen if level is not accessible
  if (showLockScreen || isLocked) {
    return (
      <div className="min-h-screen p-3 md:p-8 relative overflow-hidden bg-[#0a0a0c] flex items-center justify-center">
        {/* --- Backdrop --- */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-700/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-700/15 rounded-full blur-[120px]"></div>
        </div>

        {/* Lock Screen Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center max-w-md"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8"
          >
            <AlertTriangle className="w-20 h-20 mx-auto text-yellow-500" strokeWidth={1.5} />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">Level Locked</h1>
          <p className="text-gray-400 text-lg mb-8">
            The host hasn't opened this level yet. Please wait for {getLevelInfo(levelNumber).name} to begin.
          </p>

          <div className="glass-effect rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl p-8 space-y-4 mb-8">
            <div className="flex items-center justify-center gap-3">
              <Lock className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold">{getLevelInfo(levelNumber).name}</span>
              <Lock className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-sm text-gray-500">Check back when the host opens this level</p>
          </div>

          <button
            onClick={() => router.push("/countdown")}
            className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  // Show waiting screen if submitted and waiting for next level
  if (showWaitingScreen && levelNumber !== 7) {
    const nextLevel = levelNumber + 1;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0a0a0c] text-white">
        {/* --- Visual Backdrop --- */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-amber-500/10 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative z-10 text-center max-w-2xl"
        >
          <div className="mb-8">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-block"
            >
              <div className="w-32 h-32 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-24 h-24 rounded-full border-4 border-blue-400 border-t-amber-400"
                />
              </div>
            </motion.div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 text-white tracking-tight">
            Awaiting Next Level
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-6">
            Great job! You completed <span className="text-blue-400 font-bold">Level {levelNumber}</span>
          </p>

          <div className="space-y-4 mb-8">
            <p className="text-gray-400 text-base">
              The host is preparing the next challenge...
            </p>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-amber-400 font-bold text-lg"
            >
              Get ready for Level {nextLevel}
            </motion.p>
            <p className="text-gray-500 text-xs">
              Polling game status every 500ms...
            </p>
          </div>

          <div className="inline-block">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex gap-2 justify-center"
            >
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: dot * 0.2 }}
                  className="w-3 h-3 rounded-full bg-blue-400"
                />
              ))}
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute bottom-10 text-gray-600 text-[10px] font-black uppercase tracking-[0.5em]">
          Syncing • Awaiting Host
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-3 md:p-8 relative overflow-hidden transition-colors duration-500 bg-[#0a0a0c]`}>

      {/* Dynamic Background Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${feedback === 'correct' ? 'bg-green-500/10 opacity-100' : feedback === 'incorrect' ? 'bg-red-500/10 opacity-100' : 'opacity-0'}`} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-3 md:space-y-5 relative z-10">

        {/* --- Top Header Card --- */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-effect rounded-[2rem] border border-white/10 p-4 md:p-6 shadow-2xl overflow-hidden relative"
        >
          {/* Subtle Shine */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-5 mb-4 md:mb-5">
            <div className="space-y-1 w-full md:w-auto">
              <span className="text-blue-400 text-xs font-bold tracking-[0.2em] uppercase">Phase 0{levelNumber}</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white flex items-center gap-2 flex-wrap">
                Level {levelNumber}
                <span className="text-xs sm:text-sm font-medium px-2 md:px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                  {levelInfo.name}
                </span>
              </h1>
              <p className="text-gray-500 text-xs md:text-sm">{levelInfo.subtitle}</p>
            </div>

            <div className="text-right">
              <p className="text-gray-500 text-xs uppercase font-bold mb-1">Time Remaining</p>
              <LevelTimer seconds={timeRemaining} totalSeconds={LEVEL_TIMES[levelNumber]} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {getDisplayReference() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-2 md:py-3 px-4 md:px-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-center"
              >
                <p className="text-lg md:text-2xl font-bold text-blue-400 tracking-tight italic break-words">
                  "{getDisplayReference()}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ==================== LEVEL 1: Complete-the-verse ==================== */}
        {levelNumber === 1 && incompleteVerse && (
          <>
            {/* Visible verse text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-effect rounded-[2rem] border border-white/10 p-4 md:p-6"
            >
              <h2 className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-4 text-center">
                Complete this verse
              </h2>
              <p className="text-base md:text-2xl text-white text-center leading-relaxed break-words">
                "{incompleteVerse.visibleText} <span className="text-blue-400">___</span>"
              </p>
            </motion.div>

            {/* Target Zone for selected fragments */}
            <motion.div layout className="glass-effect rounded-[2rem] border-2 border-dashed border-white/10 p-4 md:p-5 min-h-[100px] bg-white/[0.02]">
              <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                <Layers className="w-3 md:w-4 h-3 md:h-4" /> Arrange the Missing Fragments
              </h2>
              <div className="flex flex-wrap gap-2 md:gap-3">
                <AnimatePresence>
                  {selectedIntroOrder.map((fragment) => (
                    <motion.div key={fragment.id} layoutId={fragment.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                      <FragmentDraggable
                        fragment={fragment}
                        isSelected={true}
                        onClick={() => handleIntroFragmentClick(fragment)}
                        isInOrder={false}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {selectedIntroOrder.length === 0 && (
                  <div className="w-full flex flex-col items-center justify-center py-4 md:py-6 text-gray-600">
                    <p className="text-xs md:text-sm font-medium">Select the 3 fragments in correct order</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Source fragments */}
            <motion.div layout className="p-1 md:p-2">
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                <AnimatePresence>
                  {introFragments.map((fragment) => {
                    const isSelected = selectedIntroOrder.some((f) => f.id === fragment.id);
                    if (isSelected) return null;
                    return (
                      <motion.div key={fragment.id} layoutId={fragment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <FragmentDraggable
                          fragment={fragment}
                          isSelected={false}
                          onClick={() => handleIntroFragmentClick(fragment)}
                          isInOrder={false}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}

        {/* ==================== LEVEL 2: Multiple Choice ==================== */}
        {levelNumber === 2 && mcqVerse && (
          <>
            {/* Incomplete verse text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-effect rounded-[2rem] border border-white/10 p-4 md:p-6"
            >
              <h2 className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-4 text-center">
                Complete the Quotation
              </h2>
              <p className="text-base md:text-2xl text-white text-center leading-relaxed break-words">
                "{mcqVerse.incompleteText} <span className="text-blue-400">___</span>"
              </p>
            </motion.div>

            {/* Multiple choice options */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-effect rounded-[2rem] border border-white/10 p-4 md:p-6"
            >
              <h2 className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-4 text-center flex items-center justify-center gap-2">
                <Hash className="w-3 md:w-4 h-3 md:h-4" /> Select the Correct Ending
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {mcqOptions.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMcqOption(option)}
                    disabled={isSubmitted}
                    className={`relative group px-4 md:px-6 py-3 md:py-4 rounded-2xl border-2 transition-all duration-300 text-sm md:text-lg font-medium text-left touch-target
                      ${selectedMcqOption === option
                        ? "border-blue-500 bg-blue-500/10 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                        : "border-white/5 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* ==================== LEVEL 3: Image Identification ==================== */}
        {levelNumber === 3 && imageQuestion && (
          <>
            {/* Image display */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-effect rounded-[2rem] border border-white/10 p-4 md:p-6"
            >
              <h2 className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-4 text-center">
                {imageQuestion.question}
              </h2>
              <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden border-2 border-white/10 bg-white/5">
                <Image
                  src={imageQuestion.imageUrl}
                  alt="Biblical figure"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* Multiple choice options */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-effect rounded-[2rem] border border-white/10 p-4 md:p-6"
            >
              <h2 className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-4 text-center flex items-center justify-center gap-2">
                <Hash className="w-3 md:w-4 h-3 md:h-4" /> Select Your Answer
              </h2>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {imageOptions.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageOption(option)}
                    disabled={isSubmitted}
                    className={`relative group px-4 md:px-6 py-3 md:py-4 rounded-2xl border-2 transition-all duration-300 text-sm md:text-lg font-medium text-center touch-target
                      ${selectedImageOption === option
                        ? "border-blue-500 bg-blue-500/10 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                        : "border-white/5 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              {/* Show explanation after submit */}
              <AnimatePresence>
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-3 md:p-4 rounded-xl border ${
                      feedback === "correct" 
                        ? "bg-green-500/10 border-green-500/30" 
                        : "bg-red-500/10 border-red-500/30"
                    }`}
                  >
                    <p className={`text-sm md:text-base ${feedback === "correct" ? "text-green-300" : "text-red-300"}`}>
                      <span className="font-bold">Correct Answer: </span>{imageQuestion.correctAnswer}
                    </p>
                    <p className="text-gray-400 text-xs md:text-sm mt-1">{imageQuestion.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}

        {/* ==================== LEVEL 7: Image Identification 2 ==================== */}
        {levelNumber === 7 && image2Question && (
          <>
            {/* Image display */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-effect rounded-[2rem] border border-white/10 p-4 md:p-6"
            >
              <h2 className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-4 text-center">
                {image2Question.question}
              </h2>
              <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden border-2 border-white/10 bg-white/5">
                <Image
                  src={image2Question.imageUrl}
                  alt="Biblical figure"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* Multiple choice options */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-effect rounded-[2rem] border border-white/10 p-4 md:p-6"
            >
              <h2 className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-4 text-center flex items-center justify-center gap-2">
                <Hash className="w-3 md:w-4 h-3 md:h-4" /> Select Your Answer
              </h2>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {image2Options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage2Option(option)}
                    disabled={isSubmitted}
                    className={`relative group px-4 md:px-6 py-3 md:py-4 rounded-2xl border-2 transition-all duration-300 text-sm md:text-lg font-medium text-center touch-target
                      ${selectedImage2Option === option
                        ? "border-blue-500 bg-blue-500/10 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                        : "border-white/5 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              {/* Show explanation after submit */}
              <AnimatePresence>
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-3 md:p-4 rounded-xl border ${
                      feedback === "correct" 
                        ? "bg-green-500/10 border-green-500/30" 
                        : "bg-red-500/10 border-red-500/30"
                    }`}
                  >
                    <p className={`text-sm md:text-base ${feedback === "correct" ? "text-green-300" : "text-red-300"}`}>
                      <span className="font-bold">Correct Answer: </span>{image2Question.correctAnswer}
                    </p>
                    <p className="text-gray-400 text-xs md:text-sm mt-1">{image2Question.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}

        {/* ==================== LEVELS 4-6: Fragment Arrange ==================== */}
        {levelNumber >= 4 && levelNumber <= 6 && verse && (
          <>
            {/* Main Fragment Interaction Area */}
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {/* Target Zone */}
              <motion.div layout className="glass-effect rounded-[2rem] border-2 border-dashed border-white/10 p-4 md:p-5 min-h-[140px] bg-white/[0.02]">
                <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                  <Layers className="w-3 md:w-4 h-3 md:h-4" /> Reconstructed Verse
                </h2>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <AnimatePresence>
                    {selectedOrder.map((fragment) => (
                      <motion.div key={fragment.id} layoutId={fragment.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                        <FragmentDraggable
                          fragment={fragment}
                          isSelected={true}
                          onClick={() => handleFragmentClick(fragment)}
                          isInOrder={false}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {selectedOrder.length === 0 && (
                    <div className="w-full flex flex-col items-center justify-center py-4 md:py-8 text-gray-600">
                      <p className="text-xs md:text-sm font-medium">Select fragments below to begin assembly</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Source Zone */}
              <motion.div layout className="p-1 md:p-2">
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                  <AnimatePresence>
                    {fragments.map((fragment) => {
                      const isSelected = selectedOrder.some((f) => f.id === fragment.id);
                      if (isSelected) return null;
                      return (
                        <motion.div key={fragment.id} layoutId={fragment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <FragmentDraggable
                            fragment={fragment}
                            isSelected={false}
                            onClick={() => handleFragmentClick(fragment)}
                            isInOrder={false}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* --- Submit Action --- */}
        <div className="pt-4 md:pt-6 flex flex-col items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitted ||
              (levelNumber === 1 && selectedIntroOrder.length === 0) ||
              (levelNumber === 2 && !selectedMcqOption) ||
              (levelNumber === 3 && !selectedImageOption) ||
              (levelNumber === 7 && !selectedImage2Option) ||
              (levelNumber >= 4 && levelNumber <= 6 && selectedOrder.length === 0)
            }
            className={`group relative px-8 md:px-12 py-3 md:py-4 rounded-2xl font-black text-base md:text-xl transition-all duration-300 transform touch-target
              ${isSubmitted ||
                (levelNumber === 1 && selectedIntroOrder.length === 0) ||
                (levelNumber === 2 && !selectedMcqOption) ||
                (levelNumber === 3 && !selectedImageOption) ||
                (levelNumber === 7 && !selectedImage2Option) ||
                (levelNumber >= 4 && levelNumber <= 6 && selectedOrder.length === 0)
                ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                : "bg-white text-black hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)]"}`}
          >
            {isSubmitted ? (
               <div className="flex items-center gap-2 md:gap-3">
                  {feedback === 'correct' ? <CheckCircle2 className="h-4 md:h-5 w-4 md:w-5 text-green-600" /> : <AlertCircle className="h-4 md:h-5 w-4 md:w-5 text-red-600" />}
                  <span className="text-xs md:text-base">{feedback === 'correct' ? "PERFECT" : "FAILED"}</span>
               </div>
            ) : levelNumber === 7 && !selectedReference && selectedOrder.length > 0 ? (
              <div className="flex items-center justify-center gap-1 md:gap-2">
                <AlertTriangle className="h-4 md:h-5 w-4 md:w-5 text-amber-400" />
                <span className="text-xs md:text-base">SELECT REFERENCE FIRST</span>
              </div>
            ) : "SUBMIT ANSWER"}
          </button>
        </div>
      </div>
    </div>
  );
}