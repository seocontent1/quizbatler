import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthBarProps {
  characterName: string;
  currentLives: number;
  maxLives: number;
  type: "player" | "opponent";
}

export default function HealthBar({ characterName, currentLives, maxLives, type }: HealthBarProps) {
  return (
    <div className={cn("flex flex-col gap-2", type === "opponent" ? "items-end" : "items-start")} data-testid={`healthbar-${type}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold uppercase tracking-wide" data-testid={`text-${type}-name`}>
          {characterName}
        </span>
        <span className="text-xs font-mono text-muted-foreground" data-testid={`text-${type}-lives`}>
          {currentLives}/{maxLives}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: maxLives }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "transition-all duration-600",
              index < currentLives ? "opacity-100 scale-100" : "opacity-0 scale-0"
            )}
          >
            <Heart
              className={cn(
                "w-6 h-6",
                index < currentLives ? "fill-destructive text-destructive" : "fill-muted text-muted"
              )}
              data-testid={`heart-${type}-${index}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
