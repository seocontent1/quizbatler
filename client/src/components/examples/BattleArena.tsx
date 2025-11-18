import BattleArena from '../BattleArena';

export default function BattleArenaExample() {
  return (
    <BattleArena
      playerLives={3}
      opponentLives={2}
      maxLives={5}
      playerAnimation="idle"
      opponentAnimation="idle"
    />
  );
}
