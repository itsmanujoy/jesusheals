
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, Cross, ChevronRight } from "lucide-react";

export default function PunishmentPage() {
  const router = useRouter();
  const [checked, setChecked] = useState([false, false, false, false, false]);

  const handleCheck = (index: number) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    setChecked(newChecked);
  };

  const completedCount = checked.filter((c) => c).length;
  const allChecked = completedCount === 5;
  const progressPercentage = (completedCount / 5) * 100;

  const handleContinue = () => {
    if (allChecked) {
      router.push("/final-score");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0a0a0c] text-white">
      
      {/* --- Visual Backdrop --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-900/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="relative glass-effect rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
          
          {/* Header Section */}
          <div className="text-center space-y-3 mb-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                <Flame className="w-8 h-8 text-red-500 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Verification Failed</h1>
              <p className="text-gray-400 text-sm font-medium mt-1">Recite 5 Hail Marys to gain absolution</p>
            </div>
          </div>

          {/* Progress Bar Area */}
          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
              <span>Penance Progress</span>
              <span className={allChecked ? "text-green-400" : "text-blue-400"}>
                {completedCount} / 5
              </span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-600 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              />
            </div>
          </div>

          {/* List of Tasks */}
          <div className="space-y-3 mb-6">
            {checked.map((isChecked, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleCheck(idx)}
                className={`group cursor-pointer flex items-center p-4 rounded-2xl border transition-all duration-300 
                  ${isChecked 
                    ? "bg-blue-500/10 border-blue-500/50" 
                    : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.07]"}`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300
                  ${isChecked 
                    ? "bg-blue-500 border-blue-500 text-white" 
                    : "border-white/20 text-transparent"}`}
                >
                  <Check className="w-4 h-4" strokeWidth={4} />
                </div>
                
                <span className={`ml-4 text-lg font-bold transition-all duration-300 
                  ${isChecked ? "text-white line-through opacity-50" : "text-gray-300 group-hover:text-white"}`}
                >
                  Hail Mary {idx + 1}
                </span>

                <AnimatePresence>
                  {isChecked && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="ml-auto"
                    >
                      <Cross className="w-4 h-4 text-blue-400/50" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Submit Action */}
          <button
            onClick={handleContinue}
            disabled={!allChecked}
            className={`group relative w-full py-4 rounded-2xl font-black text-xl transition-all duration-300 transform
              ${allChecked 
                ? "bg-white text-black hover:scale-[1.02] shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95" 
                : "bg-white/5 text-gray-600 cursor-not-allowed"}`}
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {allChecked ? "Continue to Results" : "Complete your Penance"}
              <ChevronRight className={`w-6 h-6 transition-transform ${allChecked ? 'translate-x-0' : 'opacity-0'}`} />
            </div>
            
            {allChecked && (
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shine" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Footer hint */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <p className="text-gray-600 text-[10px] uppercase tracking-[0.4em] font-bold">
          Verification Required for Leaderboard Entry
        </p>
      </div>
    </div>
  );
}