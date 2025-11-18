import StartScreen from '../StartScreen';

export default function StartScreenExample() {
  return (
    <StartScreen
      onStart={(difficulty) => console.log(`Starting game with ${difficulty} difficulty`)}
    />
  );
}
