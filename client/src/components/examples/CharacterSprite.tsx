import CharacterSprite from '../CharacterSprite';
import playerImage from '@assets/generated_images/Jesus_Christ_hero_character_18feb63e.png';

export default function CharacterSpriteExample() {
  return (
    <div className="flex gap-8 items-center justify-center">
      <CharacterSprite type="player" animationState="idle" imageSrc={playerImage} />
    </div>
  );
}
