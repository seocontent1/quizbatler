import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw } from "lucide-react";

interface GameOverModalProps {
  isOpen: boolean;
  isVictory: boolean;
  finalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  onRestart: () => void;
}

export default function GameOverModal({
  isOpen,
  isVictory,
  finalScore,
  correctAnswers,
  totalQuestions,
  onRestart,
}: GameOverModalProps) {
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md" data-testid="modal-gameover">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {isVictory ? (
              <Trophy className="w-20 h-20 text-primary" data-testid="icon-victory" />
            ) : (
              <RotateCcw className="w-20 h-20 text-muted-foreground" data-testid="icon-defeat" />
            )}
          </div>
          <DialogTitle className="text-3xl text-center" data-testid="text-result">
            {isVictory ? "Victory!" : "Game Over"}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {isVictory
              ? "You defeated your opponent!"
              : "Your opponent was too strong this time."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center p-4 bg-muted rounded-md">
            <span className="font-semibold">Final Score</span>
            <span className="text-2xl font-bold font-mono" data-testid="text-final-score">{finalScore}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-3 bg-card rounded-md border border-card-border">
              <span className="text-sm text-muted-foreground">Correct</span>
              <span className="text-xl font-bold font-mono" data-testid="text-correct-answers">
                {correctAnswers}/{totalQuestions}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 bg-card rounded-md border border-card-border">
              <span className="text-sm text-muted-foreground">Accuracy</span>
              <span className="text-xl font-bold font-mono" data-testid="text-accuracy">{accuracy}%</span>
            </div>
          </div>

          <Button onClick={onRestart} size="lg" className="w-full" data-testid="button-restart">
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
