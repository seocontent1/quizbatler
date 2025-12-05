import { useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  duration: number;
  extraTimeEvent?: number;
  extraTimeAmount?: number;
  onTimeout: () => void;
  isPaused: boolean;
  reset: boolean;
}

export default function Timer({
  duration,
  extraTimeEvent,
  extraTimeAmount = 0,
  onTimeout,
  isPaused,
  reset,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [maxTime, setMaxTime] = useState(duration);

  // ✅ controla o tempo real
  const endTimeRef = useRef<number>(Date.now() + duration * 1000);

  // ✅ reinicia quando reset ou duration mudarem
  useEffect(() => {
    const newEnd = Date.now() + duration * 1000;
    endTimeRef.current = newEnd;

    setTimeLeft(duration);
    setMaxTime(duration);
  }, [reset, duration]);

  // ✅ adicionar tempo extra de forma precisa
  useEffect(() => {
    if (!extraTimeAmount) return;

    endTimeRef.current += extraTimeAmount * 1000;
    setMaxTime((prev) => prev + extraTimeAmount);
  }, [extraTimeEvent]);

  // ✅ loop baseado no relógio real
  useEffect(() => {
    if (isPaused) return;

    let animationId: number;

    const tick = () => {
      const remaining = (endTimeRef.current - Date.now()) / 1000;

      if (remaining <= 0) {
        setTimeLeft(0);
        onTimeout(); // ✅ dispara só uma vez
        return;
      }

      setTimeLeft(remaining);
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, onTimeout]);

  const percentage = (timeLeft / maxTime) * 100;
  const isLowTime = timeLeft <= 3;

  return (
    <div className="items-center">
      <Clock
        className={cn(
          "w-5 h-5",
          isLowTime && "text-destructive text-center animate-pulse"
        )}
      />

      <div className="flex-1">
        <Progress
          value={percentage}
          className={cn("h-3", isLowTime && "bg-destructive/20")}
          data-testid="progress-timer"
        />
      </div>

      <span
        className={cn(
          "font-mono font-bold text-lg min-w-[3ch]",
          isLowTime && "text-destructive animate-pulse"
        )}
        data-testid="text-timer"
      >
        {Math.ceil(timeLeft)}
      </span>
    </div>
  );
}
