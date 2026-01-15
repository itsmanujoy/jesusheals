"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { motion, AnimatePresence } from "framer-motion";
import { User, Keyboard, X } from "lucide-react";

export default function InputPage() {
  const router = useRouter();
  const { setPlayerData, resetGame } = useGameStore();
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [showOnScreenKeyboard, setShowOnScreenKeyboard] = useState(false);

  const handleInputFocus = () => {
    setShowOnScreenKeyboard(true);
  };

  const handleInputClick = () => {
    setShowOnScreenKeyboard(true);
  };

  const handleKeyboardKeyPress = (key: string) => {
    if (key === 'backspace') {
      setName(prev => prev.slice(0, -1));
    } else if (key === 'space') {
      setName(prev => prev + ' ');
    } else if (key === 'clear') {
      setName('');
    } else {
      setName(prev => prev + key);
    }
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleKeyboardDone = () => {
    setShowOnScreenKeyboard(false);
  };

  const handleStart = () => {
    const newErrors: { name?: string } = {};
    if (!name || name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    resetGame();
    setPlayerData({ name: name.trim(), region: "" });
    router.push("/countdown");
  };

  const isFormValid = name.trim().length >= 2;

  return (
    <div className="min-h-screen flex items-center justify-center p-3 md:p-4 relative overflow-hidden bg-[#0a0a0c] text-white">
       {/* --- Visual Backdrop Elements (Consistent with Landing) --- */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-700/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-700/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTQgNDhVNjBINTJVNDhINDVWNDZINTVWMzRINTRWMzZINjZWMzZINTVWNDhaIiBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuNCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-5xl"
      >
        {/* Decorative glowing border */}
        <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-500/30 to-purple-600/30 rounded-[2.5rem] blur-md opacity-50"></div>

        <div className="relative glass-effect rounded-[2rem] border border-white/10 bg-black/95 backdrop-blur-2xl p-4 md:p-8 space-y-5 md:space-y-6 shadow-2xl overflow-hidden">
           {/* Top Shine */}
           <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

          <div className="text-center space-y-2 mb-3 md:mb-4">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              What should we call you?
            </h1>
            <p className="text-sm md:text-base text-gray-400 flex items-center justify-center gap-2">
              Prepare for the challenge!
            </p>
          </div>

          <div className="space-y-4">
            {/* Name Input Group */}
            <div className="space-y-2 mb-3">
              <label htmlFor="name" className="block text-xs md:text-sm font-medium text-gray-300 ml-1">
                Player Name
              </label>
              <div className="relative flex items-center group rounded-2xl transition-all duration-300 ring-2 ring-purple-500/30">
                <User className="absolute left-4 h-4 md:h-5 w-4 md:w-5 text-blue-400 transition-colors" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  readOnly
                  onFocus={handleInputFocus}
                  onClick={handleInputClick}
                  className="w-full pl-12 pr-12 py-3 md:py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:bg-white/10 transition-all outline-none text-base md:text-lg font-medium cursor-pointer"
                  placeholder="Tap to open keyboard..."
                  maxLength={50}
                />

                {/* Keyboard Indicator Button */}
                <button
                  type="button"
                  onClick={() => setShowOnScreenKeyboard(true)}
                  className="absolute right-2 p-2 md:p-3 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-white transition-all duration-300 backdrop-blur-md touch-target"
                  title="Open keyboard"
                >
                  <Keyboard className="h-4 md:h-5 w-4 md:w-5" />
                </button>
              </div>

              {/* Error Messages */}
              <AnimatePresence mode="wait">
                {errors.name ? (
                  <motion.p key="error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs md:text-sm text-red-400 ml-1">
                    {errors.name}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={!isFormValid}
              className={`relative w-full group py-3 md:py-4 rounded-xl font-bold text-base md:text-lg overflow-hidden transition-all duration-300 touch-target
                ${isFormValid 
                    ? 'bg-white text-black hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isFormValid && (
                 <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shine"></div>
              )}
              Start Game
            </button>
          </div>
        </div>
      </motion.div>

      {/* On-Screen Keyboard Modal */}
      <AnimatePresence>
        {showOnScreenKeyboard && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOnScreenKeyboard(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4"
            >
              <div className="glass-effect rounded-t-3xl border-t border-white/10 bg-black/95 backdrop-blur-2xl p-4 md:p-6 max-w-5xl mx-auto max-h-[60vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-bold text-white">On-Screen Keyboard</h3>
                  <button
                    onClick={() => setShowOnScreenKeyboard(false)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors touch-target"
                  >
                    <X className="h-4 md:h-5 w-4 md:w-5 text-gray-400" />
                  </button>
                </div>
                <OnScreenKeyboard
                  onKeyPress={handleKeyboardKeyPress}
                  currentText={name}
                  onDone={handleKeyboardDone}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// On-Screen Keyboard Component
function OnScreenKeyboard({
  onKeyPress,
  currentText,
  onDone
}: {
  onKeyPress: (key: string) => void;
  currentText: string;
  onDone: () => void;
}) {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Text Preview Area */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
      >
        <p className="text-xs text-gray-400 mb-2">Current Input:</p>
        <p className="text-base md:text-xl font-bold text-white min-h-[2rem] break-words">
          {currentText || <span className="text-gray-500">Start typing...</span>}
        </p>
      </motion.div>

      {/* Keyboard Keys */}
      <div className="space-y-1 md:space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 md:gap-2">
            {row.map((key) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onKeyPress(key.toLowerCase())}
                className="px-2 md:px-4 py-2 md:py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs md:text-lg hover:bg-white/10 hover:border-white/20 transition-all touch-target"
              >
                {key}
              </motion.button>
            ))}
          </div>
        ))}

        {/* Control Buttons */}
        <div className="flex justify-center gap-1 md:gap-2 mt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeyPress('space')}
            className="flex-1 max-w-md py-2 md:py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs md:text-sm hover:bg-white/10 hover:border-white/20 transition-all touch-target"
          >
            Space
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeyPress('backspace')}
            className="px-4 md:px-6 py-2 md:py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm md:text-base hover:bg-red-500/20 hover:text-red-300 transition-all touch-target"
          >
            ⌫
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeyPress('clear')}
            className="px-3 md:px-4 py-2 md:py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs md:text-sm hover:bg-white/10 hover:border-white/20 transition-all touch-target"
          >
            Clear
          </motion.button>
        </div>

        {/* Done Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDone}
          className="w-full py-2 md:py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-sm md:text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all touch-target mt-2"
        >
          Done
        </motion.button>
      </div>
    </div>
  );
}