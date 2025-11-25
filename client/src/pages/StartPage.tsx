import StartScreen from "@/components/StartScreen";
import { useLocation } from "wouter";

export default function StartPage() {
  const [, setLocation] = useLocation();

  return (
    <StartScreen
      onStart={(difficulty) => {
        // opcional: salvar dificuldade
        localStorage.setItem("difficulty", difficulty);

        // navega para o jogo
        setLocation("/play");
      }}
    />
  );
}
