import CharacterSprite from "./CharacterSprite";
import LifeBar from "./LifeBar";
import playerImage from '@assets/generated_images/Jesus_Christ_hero_character_18feb63e.png';
import opponentImage from '@assets/generated_images/Opponent_enemy_character_sprite_e0e7f37c.png';

interface BattleArenaProps {
  playerLife: number;
  opponentLife: number;
  maxLife: number;
  playerAnimation: "idle" | "attack" | "hit" | "victory";
  opponentAnimation: "idle" | "attack" | "hit" | "victory";
}

export default function BattleArena({
  playerLife,
  opponentLife,
  maxLife,
  playerAnimation,
  opponentAnimation,
}: BattleArenaProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col items-center gap-4">
          <div className="scale-x-[-1]">
            <CharacterSprite
              type="opponent"
              animationState={opponentAnimation}
              imageSrc={opponentImage}
            />
          </div>
          <LifeBar
            characterName="Dark Lord"
            currentLife={opponentLife}
            maxLife={maxLife}
            type="opponent"
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="scale-x-[-1]">
            <CharacterSprite
              type="player"
              animationState={playerAnimation}
              imageSrc={playerImage}
            />
          </div>
          <LifeBar
            characterName="Hero"
            currentLife={playerLife}
            maxLife={maxLife}
            type="player"
          />
        </div>
      </div>
    </div>
  );
}
