import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnswerButtonProps {
  text: string;
  onClick: () => void;
  state: "default" | "selected" | "correct" | "incorrect";
  disabled?: boolean;
  index: number;
}

export default function AnswerButton({ text, onClick, state, disabled, index }: AnswerButtonProps) {
  const stateStyles = {
    default: "",
    selected: "",
    correct: "bg-[#57cc99] text-black border-0",
    incorrect: "bg-[#ff6b6b] text-black border-0",
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={state === "default" || state === "selected" ? "outline" : "default"}
      className={cn(
        "text-base sm:text-lg font-medium justify-start relative overflow-hidden",
        "py-2 sm:py-4",
        "min-h-12 sm:min-h-16",
        "disabled:opacity-100",
        stateStyles[state]
      )}
      data-testid={`button-answer-${index}`}
    >
      <span className="flex items-center gap-2 w-full">
        <span className="text-black font-semibold">{String.fromCharCode(65 + index)}.</span>
        <span className="flex-1 text-left">{text}</span>
        {state === "correct" && <Check className="w-5 h-2" />}
        {state === "incorrect" && <X className="w-5 h-2" />}
      </span>
    </Button>
  );
}
