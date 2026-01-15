"use client";

interface LevelTimerProps {
  seconds: number;
  totalSeconds: number;
}

export function LevelTimer({ seconds, totalSeconds }: LevelTimerProps) {
  const percentage = (seconds / totalSeconds) * 100;
  const isLowTime = seconds <= 10;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-700">Time</span>
        <span
          className={`text-2xl font-bold ${
            isLowTime ? "text-red-600 animate-pulse" : "text-church-blue"
          }`}
        >
          {seconds}s
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isLowTime ? "bg-red-500" : "bg-church-blue"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

