import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  duration: number;
  onTimeout: () => void;
  isPaused: boolean;
  reset: boolean;
}

export default function Timer({ duration, onTimeout, isPaused, reset }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [reset, duration]);

  useEffect(() => {
    if (isPaused) return;

    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 0.1));
    }, 100);

    return () => clearInterval(interval);
  }, [timeLeft, isPaused, onTimeout]);

  const percentage = (timeLeft / duration) * 100;
  const isLowTime = timeLeft <= 3;

  return (
    <div className="flex items-center gap-3">
      <Clock className={cn("w-5 h-5", isLowTime && "text-destructive animate-pulse")} />
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
