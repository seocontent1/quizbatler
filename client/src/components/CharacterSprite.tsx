import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CharacterSpriteProps {
  type: "player" | "opponent";
  animationState: "idle" | "attack" | "hit" | "victory";
  imageSrc: string;
}

const CharacterSprite = forwardRef<HTMLImageElement, CharacterSpriteProps>(
  ({ type, animationState, imageSrc }, ref) => {
    const animationClasses = {
      idle: "animate-[breathe_3s_ease-in-out_infinite]",
      attack: "animate-[attack_0.4s_ease-out_forwards]",
      hit: "animate-[shake_0.3s_ease-in-out]",
      victory: "animate-[bounce_0.8s_ease-in-out]",
    };

    return (
      <div
        className={cn(
          "sm:w-36 sm:h-36 md:w-48 md:h-48 flex items-center justify-center transition-transform duration-300",
          animationClasses[animationState],
        )}
      >
        <img
          ref={ref}   // AGORA O REF APONTA PARA A IMAGEM REAL!
          key={imageSrc}
          src={imageSrc}
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>
    );
  }
);

export default CharacterSprite;
