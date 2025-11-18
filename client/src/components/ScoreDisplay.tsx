import { Card } from "@/components/ui/card";

interface ScoreDisplayProps {
  correctAnswers: number;
  currentStreak: number;
  totalScore: number;
}

export default function ScoreDisplay({ correctAnswers, currentStreak, totalScore }: ScoreDisplayProps) {
  return (
    <Card className="fixed top-4 left-4 p-4 bg-card/80 backdrop-blur-sm border-card-border z-10" data-testid="card-score">
      <div className="flex flex-col gap-2 min-w-[140px]">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Correct:</span>
          <span className="font-mono font-semibold" data-testid="text-correct">{correctAnswers}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Streak:</span>
          <span className="font-mono font-semibold text-primary" data-testid="text-streak">{currentStreak}</span>
        </div>
        <div className="flex justify-between items-center border-t border-border pt-2">
          <span className="text-sm font-semibold">Score:</span>
          <span className="font-mono font-bold text-lg" data-testid="text-score">{totalScore}</span>
        </div>
      </div>
    </Card>
  );
}
