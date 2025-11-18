import BattleArena from '../BattleArena';

export default function BattleArenaExample() {
  return (
    <BattleArena
      playerLife={45}
      opponentLife={68}
      maxLife={100}
      playerAnimation="idle"
      opponentAnimation="idle"
    />
  );
}
