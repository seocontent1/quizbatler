import CharacterSprite from "./CharacterSprite";
import LifeBar from "./LifeBar";
import AttackEffect from "@/components/AttackEffect";
import { useRef, useState, useCallback, useEffect } from "react";
import RevealLightEffect from "@/components/RevealLightEffect";

// 🚀 IMPORT DAS IMAGENS PARA PRELOAD
import EFFECT_IMAGE from "/character_sprites/efect.svg";
import POW_IMAGE from "/character_sprites/pow.svg";

interface BattleArenaProps {
  showHolyBlast: boolean;
  setShowHolyBlast: (value: boolean) => void;
  playerLife: number;
  opponentLife: number;
  maxLife: number;
  playerAnimation: "idle" | "attack" | "hit" | "victory";
  opponentAnimation: "idle" | "attack" | "hit" | "victory";
  playerImage: string;
  opponentImage: string;
  impactParticles: number;
  setImpactParticles: React.Dispatch<React.SetStateAction<number>>;
  playerImgKey: number;
  showRevealEffect?: boolean;
  revealEffectData: { startX: number; startY: number } | null;
  setShowRevealEffect: (value: boolean) => void;
}

export default function BattleArena({
  playerImage,
  opponentImage,
  playerLife,
  opponentLife,
  maxLife,
  playerAnimation,
  opponentAnimation,
  impactParticles,
  setImpactParticles,
  playerImgKey,
  showHolyBlast,
  setShowHolyBlast,
}: BattleArenaProps) {

  // 🚀 PRELOAD DAS IMAGENS DE EFEITOS
  useEffect(() => {
    [EFFECT_IMAGE, POW_IMAGE].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // === REFS ===
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const enemyRef = useRef<HTMLDivElement | null>(null);

  // Dados do poder (posição medida)
  const [holyBlastData, setHolyBlastData] = useState<null | {
    startX: number;
    startY: number;
    distX: number;
  }>(null);

  const triggerHolyBlast = useCallback(() => {
    if (!arenaRef.current || !playerRef.current || !enemyRef.current) {
      console.warn("missing refs", { arena: !!arenaRef.current, player: !!playerRef.current, enemy: !!enemyRef.current });
      return;
    }

    const arenaRect = arenaRef.current.getBoundingClientRect();
    const pRect = playerRef.current.getBoundingClientRect();
    const eRect = enemyRef.current.getBoundingClientRect();

    // AJUSTE: Ponto de saída do poder (mão direita do personagem)
    const startX = pRect.left - arenaRect.left + pRect.width * 0.35;
    const startY = pRect.top - arenaRect.top + pRect.height * 0.30;

    const endX = eRect.left - arenaRect.left + eRect.width * 0.5;
    const deltaX = endX - startX;

    setHolyBlastData({ startX, startY, distX: deltaX });
  }, [arenaRef, playerRef, enemyRef]);

  // Quando o QuizGame solicitar o HolyBlast
  if (showHolyBlast && !holyBlastData) {
    triggerHolyBlast();
  }

  // === Impact Particles ===
  const isMobile = typeof window !== "undefined" && window.innerWidth < 480;
  const particleSize = 40;
  const spread = 100;

  const particleElements = Array.from({ length: impactParticles * 35 }).map((_, i) => (
    <div
      key={i}
      className="absolute animate-impact pointer-events-none"
      style={{
        width: `${particleSize}px`,
        height: `${particleSize}px`,
        top: isMobile ? "40%" : "50%",
        left: "50%",
        transform: `translate(-50%, -50%) translate(${(Math.random() - 0.5) * spread}px, ${(Math.random() - 0.5) * spread}px)`,
        zIndex: 9999,
      }}
    >
      {/* 🚀 USANDO A IMAGEM IMPORTADA */}
      <img src={EFFECT_IMAGE} className="w-full h-full" alt="effect" />
    </div>
  ));

  return (
    <div ref={arenaRef} data-id="arena-root" className="relative w-full h-full">

      {/* RENDERIZA O ATAQUE AQUI, FORA DOS PERSONAGENS */}
      {holyBlastData && (
        <AttackEffect
          image={POW_IMAGE} // 🚀 USANDO A IMAGEM IMPORTADA
          startX={holyBlastData.startX}
          startY={holyBlastData.startY}
          distX={holyBlastData.distX}
          onFinish={() => {
            setHolyBlastData(null);
            setShowHolyBlast(false);
            setImpactParticles(prev => prev + 1);
          }}
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:justify-center sm:gap-40 items-start">

        {/* OPONENTE */}
        <div className="flex flex-col items-center gap-2 relative min-w-0 mt-4">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]">
            {particleElements}
          </div>

          <div className="drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
            <CharacterSprite
              ref={enemyRef}
              type="opponent"
              animationState={opponentAnimation}
              imageSrc={opponentImage}
            />
          </div>

          <div className="w-full max-w-[150px] sm:max-w-[200px] min-w-0">
            <LifeBar
              characterName="Dark Lord"
              currentLife={opponentLife}
              maxLife={maxLife}
              type="opponent"
            />
          </div>
        </div>

        {/* PLAYER */}
        <div className="flex flex-col items-center gap-2 relative min-w-0 mt-4">

          <div className="drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]">
            <CharacterSprite
              ref={playerRef}
              type="player"
              animationState={playerAnimation}
              imageSrc={playerImage}
            />
            {playerAnimation === "reveal" && <RevealLightEffect />}
          </div>

          <div className="w-full max-w-[150px] sm:max-w-[200px] min-w-0">
            <LifeBar
              characterName="Jesus"
              currentLife={playerLife}
              maxLife={maxLife}
              type="player"
            />
          </div>
        </div>
      </div>
    </div>
  );
}