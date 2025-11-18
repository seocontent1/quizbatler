import LifeBar from '../LifeBar';

export default function LifeBarExample() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <LifeBar characterName="Hero" currentLife={45} maxLife={100} type="player" />
      <LifeBar characterName="Dark Lord" currentLife={25} maxLife={100} type="opponent" />
    </div>
  );
}
