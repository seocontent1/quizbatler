import HealthBar from '../HealthBar';

export default function HealthBarExample() {
  return (
    <div className="flex flex-col gap-6">
      <HealthBar characterName="Hero" currentLives={3} maxLives={5} type="player" />
      <HealthBar characterName="Dark Lord" currentLives={2} maxLives={5} type="opponent" />
    </div>
  );
}
