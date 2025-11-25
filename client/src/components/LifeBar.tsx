import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface LifeBarProps {
  characterName: string;
  currentLife: number;
  maxLife: number;
  type: "player" | "opponent";
}

export default function LifeBar({ characterName, currentLife, maxLife }: LifeBarProps) {
  const percentage = (currentLife / maxLife) * 100;
  const isLow = percentage <= 30;

  return (
    <div
      className="flex flex-col gap-1 w-full max-w-[150px] sm:max-w-[200px] min-w-0"
      data-testid={`lifebar`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between text-xs font-semibold min-w-0">

        {/* NOME — precisa truncar para não empurrar a vida */}
        <span className="uppercase tracking-wide truncate min-w-0">
          {characterName}
        </span>

        {/* VIDA — não deve crescer demais */}
        <span className="text-xs font-mono text-muted-foreground ml-2 shrink-0">
          {currentLife}/{maxLife}
        </span>
      </div>

      {/* PROGRESS BAR */}
      <Progress
        value={percentage}
        className={cn(
          "h-3 w-full overflow-hidden",
          isLow && "[&>div]:bg-destructive"
        )}
        data-testid={`progress-life`}
      />
    </div>
  );
}
