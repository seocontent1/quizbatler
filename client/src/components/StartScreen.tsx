import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, Zap, Flame } from "lucide-react";

interface StartScreenProps {
  onStart: (difficulty: "easy" | "medium" | "hard") => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight" data-testid="text-title">
            Quiz Jesus Battle
          </h1>
          <h4 className="text-xl text-muted-foreground" data-testid="text-subtitle">
            Vamos ajudar Jesus a derrotar Satanas!
          </h4>
          <p className="text-xl text-muted-foreground" data-testid="text-subtitle">
            Não use ferramentas online para responder. Use a Bíblia! Leia a Bíblia!
          </p>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Selecione a dificuldade</h2>
          <div className="grid gap-4">
            <Button
              onClick={() => onStart("easy")}
              size="lg"
              variant="outline"
              className="h-16 text-lg justify-start gap-4"
              data-testid="button-difficulty-easy"
            >
              <Swords className="w-6 h-6 text-primary" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Fácil</div>
                <div className="text-sm text-muted-foreground">Parece fácil!</div>
              </div>
            </Button>

            <Button
              onClick={() => onStart("medium")}
              size="lg"
              variant="outline"
              className="h-16 text-lg justify-start gap-4"
              data-testid="button-difficulty-medium"
            >
              <Zap className="w-6 h-6 text-primary" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Médio</div>
                <div className="text-sm text-muted-foreground">Hum...Será que você é capaz?</div>
              </div>
            </Button>

            <Button
              onClick={() => onStart("hard")}
              size="lg"
              variant="outline"
              className="h-16 text-lg justify-start gap-4"
              data-testid="button-difficulty-hard"
            >
              <Flame className="w-6 h-6 text-destructive" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Díficil</div>
                <div className="text-sm text-muted-foreground">Mostre que você ler a Bíblia!</div>
              </div>
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-3">Como Jogar</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• O tempo também é seu inimigo. Seja rápido ou perderemos!</li>
            <li>• Se você é leitor fiel da Bíblia ajudará Jesus nessa luta!</li>
            <li>• Responda às perguntas corretamente para acabar com satanas!</li>
            <li>• Não erre, ou satanas poderá vencer a batalha!</li>
            <li>• Quanto mais rápido você responder mais vida você tira dele!</li>
            <li>• Vamos salvar o mundo dos laços de Satanas!</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
