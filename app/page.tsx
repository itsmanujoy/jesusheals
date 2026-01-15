"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { BookOpen, Timer, Trophy, ChevronRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/input");
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 md:p-6 relative overflow-hidden bg-[#0a0a0c] text-white">
      
      {/* --- Visual Backdrop Elements --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Glossy Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        
        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54 48L54 60L52 60L52 48L40 48L40 46L52 46L52 34L54 34L54 46L66 46L66 48L54 48Z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` }}>
        </div>
      </div>

      <motion.div 
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-5xl flex flex-col items-center"
      >
        {/* --- Logo Section --- */}
        <motion.div 
          variants={fadeInUp}
          className="mb-4 md:mb-8 flex justify-center"
        >
          <div className="relative w-40 h-20 md:w-64 md:h-32">
            <Image
              src="/jaago2.png"
              alt="Jaago Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 160px, 256px"
            />
          </div>
        </motion.div>

        {/* --- Header Section --- */}
        <motion.div variants={fadeInUp} className="text-center mb-8 md:mb-12 px-2">
          <span className="px-3 py-1 rounded-full border border-black/10 bg-white/5 text-xs font-medium tracking-widest uppercase text-blue-400 mb-3 inline-block backdrop-blur-md">
            Jesus Youth Trivandrum Professional Ministry
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-9xl font-extrabold tracking-tighter mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
            Words of Healing
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-gray-400 font-light max-w-4xl mx-auto">
            Bring clarity to the Word. Arrange scrambled fragments into perfect harmony.
          </p>
        </motion.div>

        {/* --- Main Glassmorphic Card --- */}
        <motion.div 
          variants={fadeInUp}
          className="relative group w-full max-w-6xl px-2 md:px-0"
        >
          {/* Subtle Glow behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          
          <div className="relative glass-effect rounded-3xl border border-white/10 bg-black/95 backdrop-blur-2xl p-4 md:p-8 overflow-hidden">
            {/* Top Shine Effect */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
              <FeatureItem 
                icon={<BookOpen className="w-6 h-6 text-blue-400" />} 
                title="3 Levels" 
                desc="From seeker to scholar" 
              />
              <FeatureItem 
                icon={<Timer className="w-6 h-6 text-purple-400" />} 
                title="45 Seconds" 
                desc="Race against the clock" 
              />
              <FeatureItem 
                icon={<Trophy className="w-6 h-6 text-amber-400" />} 
                title="Leaderboard" 
                desc="Compete for glory" 
              />
            </motion.div>
          </div>
        </motion.div>

        {/* --- CTA Button --- */}
        <motion.div variants={fadeInUp} className="mt-8 md:mt-12 group">  
          <button
            onClick={handleGetStarted}
            className="relative flex items-center justify-center gap-2 px-6 md:px-10 py-4 md:py-5 bg-white text-black rounded-2xl font-bold text-base md:text-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95 overflow-hidden touch-target"
          >
            {/* Glossy overlay on button */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shine"></div>
            
            Get Started
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </motion.div>

        {/* --- Footer Info --- */}
        <motion.p 
          variants={fadeInUp}
          className="text-xs md:text-sm text-gray-500 mt-8 md:mt-12 tracking-wide uppercase px-2 text-center"
        >
          Master the Scripture • Build your Legacy
        </motion.p>
      </motion.div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-2xl transition-colors hover:bg-white/5">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-white text-lg tracking-tight">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}