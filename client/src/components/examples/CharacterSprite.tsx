import CharacterSprite from '../CharacterSprite';
import playerImage from '@assets/generated_images/Player_hero_character_sprite_45d74b4e.png';

export default function CharacterSpriteExample() {
  return (
    <div className="flex gap-8 items-center justify-center">
      <CharacterSprite type="player" animationState="idle" imageSrc={playerImage} />
    </div>
  );
}
