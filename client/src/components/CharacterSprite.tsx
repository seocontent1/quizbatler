import { cn } from "@/lib/utils";

interface CharacterSpriteProps {
  type: "player" | "opponent";
  animationState: "idle" | "attack" | "hit" | "victory";
  imageSrc: string;
}

export default function CharacterSprite({ type, animationState, imageSrc }: CharacterSpriteProps) {
  const animationClasses = {
    idle: "animate-[breathe_3s_ease-in-out_infinite]",
    attack: "animate-[attack_0.4s_ease-out]",
    hit: "animate-[shake_0.3s_ease-in-out]",
    victory: "animate-[bounce_0.8s_ease-in-out]",
  };

  return (
    <div
      className={cn(
        "w-48 h-48 flex items-center justify-center transition-transform duration-300",
        animationClasses[animationState]
      )}
      data-testid={`sprite-${type}`}
    >
      <img
        src={imageSrc}
        alt={`${type} character`}
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </div>
  );
}
