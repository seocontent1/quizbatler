import BattleArena from '../BattleArena';

export default function BattleArenaExample() {
  return (
    <div className="p-8">
      <BattleArena
        playerLives={3}
        opponentLives={2}
        maxLives={5}
        playerAnimation="idle"
        opponentAnimation="idle"
      />
    </div>
  );
}
