import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw } from "lucide-react";
import vicImage from "/salvo.jpg";
import defeatImage from "/fogo.jpg";

interface GameOverModalProps {
  isOpen: boolean;
  isVictory: boolean;
  finalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  onRestart: () => void;
  onClose: () => void;
}

export default function GameOverModal({
  isOpen,
  isVictory,
  finalScore,
  correctAnswers,
  totalQuestions,
  onRestart,
  onClose,
}: GameOverModalProps) {
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[22rem] !p-3 rounded-lg" data-testid="modal-gameover">
        <DialogHeader>
          <div className="overflow-hidden mx-auto">
            {isVictory ? (
              <img
                    src={vicImage}
                    alt="Vitoria em Cristo!"
                    className="w-full h-full object-cover rounded-lg"
                    data-testid="icon-victory"
                  />
            ) : (
              <div className="overflow-hidden mx-auto">
                    <img
                      src={defeatImage}
                      alt="Derrota!"
                      className="w-full h-full object-cover"
                      data-testid="icon-defeat"
                    />
                  </div>
            )}
          </div>
          <DialogTitle className="text-3xl text-center" data-testid="text-result">
            {isVictory ? "Vitoria! Glória a Deus!" : "Game Over"}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {isVictory
              ? "Estamos salvo! Você derrotou Satanas!"
              : "Satanas venceu! Você precisa estudar mais a Bíblia?"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center p-4 bg-muted rounded-md">
            <span className="font-semibold">Pontuação</span>
            <span className="text-2xl font-bold font-mono" data-testid="text-final-score">{finalScore}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-3 bg-card rounded-md border border-card-border">
              <span className="text-sm text-muted-foreground">Corretas</span>
              <span className="text-xl font-bold font-mono" data-testid="text-correct-answers">
                {correctAnswers}/{totalQuestions}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 bg-card rounded-md border border-card-border">
              <span className="text-sm text-muted-foreground">Precisão</span>
              <span className="text-xl font-bold font-mono" data-testid="text-accuracy">{accuracy}%</span>
            </div>
          </div>

          <Button onClick={onRestart} size="lg" className="w-full" data-testid="button-restart">
            <RotateCcw className="w-5 h-5 mr-2" />
            Jogar Novamente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
