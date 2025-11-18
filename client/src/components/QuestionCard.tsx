import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuestionCardProps {
  question: string;
  roundNumber: number;
  totalRounds: number;
  isVisible: boolean;
}

export default function QuestionCard({ question, roundNumber, totalRounds, isVisible }: QuestionCardProps) {
  return (
    <Card
      className={cn(
        "p-8 max-w-2xl mx-auto transition-all duration-300",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}
      data-testid="card-question"
    >
      <div className="flex justify-between items-start gap-4 mb-6">
        <h2 className="text-2xl font-semibold leading-relaxed flex-1" data-testid="text-question">
          {question}
        </h2>
        <Badge variant="secondary" className="shrink-0" data-testid="badge-round">
          Round {roundNumber}/{totalRounds}
        </Badge>
      </div>
    </Card>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
