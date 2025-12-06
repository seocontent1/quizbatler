import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX } from "lucide-react"; // Importar ícones

interface QuestionCardProps {
  question: string;
  roundNumber: number;
  totalRounds: number;
  isVisible: boolean;
  isAudioEnabled: boolean;       // Nova prop
  onToggleAudio: () => void;     // Nova prop
}

export default function QuestionCard({
  question,
  roundNumber,
  totalRounds,
  isVisible,
  isAudioEnabled,
  onToggleAudio
}: QuestionCardProps) {
  return (
    <Card
      className={cn(
        "p-4 mx-auto relative transition-all duration-300",
        isVisible ? "scale-100 opacity-100" : "scale-95 opacity-90"
      )}
      data-testid="card-question"
    >
      <div className="flex justify-between items-start gap-4 w-full">

        {/* ESQUERDA - Texto da Pergunta */}
        <div className="flex-1 min-w-0 py-1">
          <h2
            className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 leading-tight break-words"
            data-testid="text-question"
          >
            {question}
          </h2>
        </div>

        {/* DIREITA - Badge e Áudio */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <Badge
            variant="secondary"
            className="whitespace-nowrap text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
            data-testid="badge-round"
          >
            {roundNumber} / {totalRounds}
          </Badge>

          {/* Botão de Áudio */}
          <button
            onClick={onToggleAudio}
            className={cn(
              "p-2 rounded-full transition-all duration-200 shadow-sm border",
              isAudioEnabled
                ? "bg-green-200 text-green-600 border-green-200 hover:bg-green-200"
                : "bg-red-100 text-[#ff4d6d] border-red-200 hover:bg-red-200"
            )}
            title={isAudioEnabled ? "Desativar Narração" : "Ativar Narração"}
          >
            {isAudioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>

      </div>
    </Card>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}