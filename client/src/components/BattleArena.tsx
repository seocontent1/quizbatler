import CharacterSprite from "./CharacterSprite";
import HealthBar from "./HealthBar";
import playerImage from '@assets/generated_images/Player_hero_character_sprite_45d74b4e.png';
import opponentImage from '@assets/generated_images/Opponent_enemy_character_sprite_e0e7f37c.png';

interface BattleArenaProps {
  playerLives: number;
  opponentLives: number;
  maxLives: number;
  playerAnimation: "idle" | "attack" | "hit" | "victory";
  opponentAnimation: "idle" | "attack" | "hit" | "victory";
}

export default function BattleArena({
  playerLives,
  opponentLives,
  maxLives,
  playerAnimation,
  opponentAnimation,
}: BattleArenaProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col items-center gap-4">
          <HealthBar
            characterName="Dark Lord"
            currentLives={opponentLives}
            maxLives={maxLives}
            type="opponent"
          />
          <CharacterSprite
            type="opponent"
            animationState={opponentAnimation}
            imageSrc={opponentImage}
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <HealthBar
            characterName="Hero"
            currentLives={playerLives}
            maxLives={maxLives}
            type="player"
          />
          <CharacterSprite
            type="player"
            animationState={playerAnimation}
            imageSrc={playerImage}
          />
        </div>
      </div>
    </div>
  );
}
