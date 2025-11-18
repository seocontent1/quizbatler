import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface LifeBarProps {
  characterName: string;
  currentLife: number;
  maxLife: number;
  type: "player" | "opponent";
}

export default function LifeBar({ characterName, currentLife, maxLife, type }: LifeBarProps) {
  const percentage = (currentLife / maxLife) * 100;
  const isLow = percentage <= 30;
  
  return (
    <div className={cn("flex flex-col gap-2 w-48", type === "opponent" ? "items-center" : "items-center")} data-testid={`lifebar-${type}`}>
      <div className="flex items-center gap-2 w-full justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide" data-testid={`text-${type}-name`}>
          {characterName}
        </span>
        <span className="text-xs font-mono text-muted-foreground" data-testid={`text-${type}-life`}>
          {currentLife}/{maxLife}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={cn(
          "h-3 w-full",
          isLow && "[&>div]:bg-destructive"
        )}
        data-testid={`progress-${type}-life`}
      />
    </div>
  );
}
