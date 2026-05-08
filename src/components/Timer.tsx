"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  startTime: number;
  durationMinutes: number;
  onTimeUp?: () => void;
}

export default function Timer({ startTime, durationMinutes, onTimeUp }: TimerProps) {
  const [remaining, setRemaining] = useState<number>(durationMinutes * 60 * 1000);

  useEffect(() => {
    function tick() {
      const left = Math.max(0, startTime + durationMinutes * 60 * 1000 - Date.now());
      setRemaining(left);
      if (left === 0) {
        onTimeUp?.();
      }
    }
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startTime, durationMinutes, onTimeUp]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const isLow = totalSeconds < 600;

  return (
    <div
      className={`font-mono text-lg font-semibold ${isLow ? "text-th-error" : "text-th-text-secondary"}`}
    >
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </div>
  );
}
