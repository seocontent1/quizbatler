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
        "mt-8 p-4 mx-auto",
        isVisible ? "scale-100" : "scale-95"
      )}
      data-testid="card-question"
    >
      <div className="flex justify-between items-start gap-6 w-full">

        {/* ESQUERDA */}
        <div className="flex-1 min-w-0">
          <h2
            className="text-lg sm:text-xl md:text-2xl font-semibold break-words"
            data-testid="text-question"
          >
            {question}
          </h2>
        </div>

        {/* DIREITA */}
        <div className="flex flex-col items-end gap-3 shrink-0 w-fit">
          <Badge
            variant="secondary"
            className="whitespace-nowrap text-sm font-semibold"
            data-testid="badge-round"
          >
            {roundNumber} de {totalRounds}
          </Badge>
        </div>

      </div>
    </Card>


  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
