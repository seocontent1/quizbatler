import { Card } from "@/components/ui/card";

interface ScoreDisplayProps {
  correctAnswers: number;
  currentStreak: number;
  totalScore: number;
  boostsLeft: number;
}

export default function ScoreDisplay({ correctAnswers, currentStreak, totalScore, boostsLeft }: ScoreDisplayProps) {
  return (
    <Card className="w-full px-3 py-2" data-testid="card-score">
      <div
        className="
          flex flex-wrap
          gap-2 sm:gap-8
          justify-center
          text-center
        "
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Corretas:</span>
          <span className="font-mono font-semibold">{correctAnswers}</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Erradas:</span>
          <span className="font-mono font-semibold text-primary">{currentStreak}</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 border-l sm:border-border pl-3 sm:pl-6">
          <span className="text-xs sm:text-sm font-semibold">Ponto:</span>
          <span className="font-mono font-bold text-base sm:text-lg">{totalScore}</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 border-l sm:border-border pl-3 sm:pl-6">
          <span className="text-xs sm:text-sm font-semibold">⚡ Booster:</span>
          <span className="font-mono font-bold text-base sm:text-lg">{boostsLeft}</span>
        </div>
      </div>
    </Card>

  );
}
