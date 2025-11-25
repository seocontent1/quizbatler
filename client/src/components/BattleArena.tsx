import CharacterSprite from "./CharacterSprite";
import LifeBar from "./LifeBar";

interface BattleArenaProps {
  playerLife: number;
  opponentLife: number;
  maxLife: number;
  playerAnimation: "idle" | "attack" | "hit" | "victory";
  opponentAnimation: "idle" | "attack" | "hit" | "victory";
  playerImage: string;
  opponentImage: string;
  impactParticles: number;
  playerImgKey: number;
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
  playerImgKey,
}: BattleArenaProps) {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 480;
    const particleSize = isMobile ? 20 : 40;       // tamanho da imagem
    const spread = isMobile ? 100 : 150;            // raio de espalhamento

    // 📌 Criação das partículas (agora responsivas)
    const particleElements = Array.from({ length: impactParticles * 50 }).map((_, i) => (
      <div
        key={i}
        className="
          absolute
          animate-impact
          pointer-events-none
        "
        style={{
          width: `${particleSize}px`,
          height: `${particleSize}px`,
          top: isMobile ? "40%" : "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translate(${(Math.random() - 0.5) * spread}px, ${(Math.random() - 0.5) * spread}px)`,
          zIndex: 9999,
        }}
      >
        <img
          src="/character_sprites/efect.png"
          className="w-full h-full"
        />
      </div>
    ));

  return (
   <div className="relative w-full max-w-md sm:max-w-4xl mx-auto overflow-hidden mt-4 sm:mt-6 mb-4 sm:mb-6">

     <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:justify-center sm:gap-40 items-start">

       {/* BLOCO DO OPONENTE */}
       <div className="flex flex-col items-center gap-2 relative min-w-0 mt-4">

         {/* partículas */}
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]">
           {particleElements}
         </div>
         {/* sprite com glow */}
         <div className="xs:w-28 xs:h-28 sm:w-40 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]">
           <CharacterSprite
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

       {/* BLOCO DO PLAYER */}
       <div className="flex flex-col items-center gap-2 relative min-w-0 mt-4">
         <div className="xs:w-28 xs:h-28 sm:w-40 drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]">
           <CharacterSprite
             type="player"
             animationState={playerAnimation}
             imageSrc={playerImage}
           />
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
