"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Delete, RefreshCcw, ShieldAlert, ChevronRight } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const { securityCode } = useGameStore();
  const [enteredCode, setEnteredCode] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleNumberClick = (num: string) => {
    if (enteredCode.length < 6) {
      setEnteredCode(enteredCode + num);
      setError("");
    }
  };

  const handleBackspace = () => {
    setEnteredCode(enteredCode.slice(0, -1));
    setError("");
  };

  const handleClear = () => {
    setEnteredCode("");
    setError("");
  };

  const handleSubmit = () => {
    if (enteredCode.length !== 6) {
      setError("Please enter a 6-digit code");
      triggerShake();
      return;
    }

    if (enteredCode === securityCode) {
      router.push("/final-score");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      triggerShake();

      if (newAttempts >= 2) {
        router.push("/punishment");
      } else {
        setError(`Access Denied. ${2 - newAttempts} attempt remaining.`);
        setEnteredCode("");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0a0a0c] text-white">
      
      {/* --- Atmospheric Background --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl relative z-10"
      >
        {/* Decorative Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-to-b from-blue-500/20 to-purple-600/20 rounded-[2.5rem] blur-xl opacity-50" />

        <div className="relative glass-effect rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
          
          {/* Top Decorative Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <Lock className={`w-8 h-8 ${error ? 'text-red-500' : 'text-blue-400'} transition-colors duration-300`} />
            </div>
          </div>

          <div className="text-center space-y-2 mb-6">
            <h1 className="text-3xl font-black tracking-tight text-white">Security Check</h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Enter the 6-Digit Cipher</p>
          </div>

          {/* Code Display Area */}
          <div className="space-y-5">
            <div className="flex justify-center gap-2 md:gap-3">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className={`w-11 h-14 md:w-12 md:h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all duration-200 
                    ${enteredCode[idx] 
                      ? 'border-blue-500/50 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                      : 'border-white/10 bg-white/5 text-gray-700'}`}
                >
                  <AnimatePresence mode="wait">
                    {enteredCode[idx] ? (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key="digit"
                      >
                        {enteredCode[idx]}
                      </motion.span>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        key="placeholder" 
                        className="w-1.5 h-1.5 rounded-full bg-white/10" 
                      />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 text-red-400 font-bold text-sm bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-md mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <KeypadButton key={num} onClick={() => handleNumberClick(num.toString())}>
                  {num}
                </KeypadButton>
              ))}
              <KeypadButton onClick={handleClear} variant="secondary">
                <RefreshCcw className="w-5 h-5" />
              </KeypadButton>
              <KeypadButton onClick={() => handleNumberClick("0")}>
                0
              </KeypadButton>
              <KeypadButton onClick={handleBackspace} variant="secondary">
                <Delete className="w-6 h-6" />
              </KeypadButton>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              <button
                onClick={handleSubmit}
                disabled={enteredCode.length !== 6}
                className="group relative w-full py-4 bg-white text-black rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 disabled:bg-white/10 disabled:text-gray-600 disabled:cursor-not-allowed transition-all overflow-hidden"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  Verify Identity <ChevronRight className="w-5 h-5" />
                </div>
                {enteredCode.length === 6 && (
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shine" />
                )}
              </button>

              <button
                onClick={() => router.push("/punishment")}
                className="w-full py-2 text-gray-500 text-sm font-bold uppercase tracking-widest hover:text-red-400 transition-colors"
              >
                Forgot Security Code?
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Sub-component for Keypad Buttons to keep code clean
function KeypadButton({ children, onClick, variant = "primary" }: { children: React.ReactNode, onClick: () => void, variant?: "primary" | "secondary" }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`py-4 rounded-2xl text-2xl font-bold transition-all border
        ${variant === "primary" 
          ? "bg-white/5 border-white/5 text-white hover:bg-white/10 hover:border-white/20" 
          : "bg-white/[0.02] border-transparent text-gray-500 hover:text-white"}`}
    >
      {children}
    </motion.button>
  );
}