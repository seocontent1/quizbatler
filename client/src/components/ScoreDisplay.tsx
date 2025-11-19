import { Card } from "@/components/ui/card";

interface ScoreDisplayProps {
  correctAnswers: number;
  currentStreak: number;
  totalScore: number;
}

export default function ScoreDisplay({ correctAnswers, currentStreak, totalScore }: ScoreDisplayProps) {
  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-card-border mb-6" data-testid="card-score">
      <div className="flex items-center justify-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Corretas:</span>
          <span className="font-mono font-semibold" data-testid="text-correct">{correctAnswers}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Erradas:</span>
          <span className="font-mono font-semibold text-primary" data-testid="text-streak">{currentStreak}</span>
        </div>
        <div className="flex items-center gap-2 border-l border-border pl-6">
          <span className="text-sm font-semibold">Ponto:</span>
          <span className="font-mono font-bold text-lg" data-testid="text-score">{totalScore}</span>
        </div>
      </div>
    </Card>
  );
}
