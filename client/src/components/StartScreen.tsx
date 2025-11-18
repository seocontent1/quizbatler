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
            Quiz Battle Arena
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="text-subtitle">
            Test your knowledge and defeat your opponent!
          </p>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Select Difficulty</h2>
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
                <div className="font-semibold">Easy</div>
                <div className="text-sm text-muted-foreground">5 lives, basic questions</div>
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
                <div className="font-semibold">Medium</div>
                <div className="text-sm text-muted-foreground">3 lives, moderate challenge</div>
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
                <div className="font-semibold">Hard</div>
                <div className="text-sm text-muted-foreground">3 lives, expert questions</div>
              </div>
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-3">How to Play</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Answer questions correctly to attack your opponent</li>
            <li>• Wrong answers let your opponent attack you</li>
            <li>• Defeat your opponent by depleting all their lives</li>
            <li>• Build streaks for bonus points</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
