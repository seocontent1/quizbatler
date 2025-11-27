// src/components/RevealLightEffect.tsx
import { motion } from "framer-motion";

interface Props {
  startX: number;
  startY: number;
  onFinish: () => void;
}

export default function RevealLightEffect({ startX, startY, onFinish }: Props) {
  return (
    <>
      {/* Raio de luz principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0, 1.5, 1.5, 0],
        }}
        transition={{
          duration: 0.8,
          times: [0, 0.2, 0.7, 1],
          ease: "easeOut"
        }}
        onAnimationComplete={onFinish}
        style={{
          position: "absolute",
          left: `${startX}px`,
          top: `${startY}px`,
          width: "120px",
          height: "120px",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 100,
        }}
      >
        {/* Círculo de luz dourada */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,223,0,0.9) 0%, rgba(255,193,7,0.6) 40%, rgba(255,152,0,0.3) 70%, transparent 100%)",
            boxShadow: "0 0 40px rgba(255,223,0,0.8), 0 0 80px rgba(255,193,7,0.5)",
          }}
        />
      </motion.div>

      {/* Raios de luz emanando */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scaleY: [0, 1.5, 0],
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.05,
            ease: "easeOut"
          }}
          style={{
            position: "absolute",
            left: `${startX}px`,
            top: `${startY}px`,
            width: "4px",
            height: "60px",
            background: "linear-gradient(to bottom, rgba(255,223,0,0.9), transparent)",
            transformOrigin: "top center",
            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
            pointerEvents: "none",
            zIndex: 99,
          }}
        />
      ))}

      {/* Partículas de luz flutuando */}
      {Array.from({ length: 12 }).map((_, i) => {
        const randomAngle = (i * 30) + Math.random() * 20;
        const randomDistance = 40 + Math.random() * 60;
        const randomX = Math.cos(randomAngle * Math.PI / 180) * randomDistance;
        const randomY = Math.sin(randomAngle * Math.PI / 180) * randomDistance;

        return (
          <motion.div
            key={`particle-${i}`}
            initial={{
              opacity: 0,
              x: 0,
              y: 0,
              scale: 0
            }}
            animate={{
              opacity: [0, 1, 0],
              x: randomX,
              y: randomY,
              scale: [0, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.03,
              ease: "easeOut"
            }}
            style={{
              position: "absolute",
              left: `${startX}px`,
              top: `${startY}px`,
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,223,0,1), rgba(255,193,7,0.5))",
              boxShadow: "0 0 8px rgba(255,223,0,0.8)",
              pointerEvents: "none",
              zIndex: 101,
            }}
          />
        );
      })}

      {/* Brilho pulsante de fundo */}
      // Sugestão de ajuste no RevealLightEffect.tsx para parecer que vem do céu

      <motion.div
        initial={{ opacity: 0, scaleY: 0, y: -200 }} // Começa esticado zero e deslocado para cima
        animate={{
          opacity: [0, 1, 1, 0],
          scaleY: [0, 1.5, 1.5, 2], // Cresce verticalmente
          y: 0, // Desce para a posição do player
        }}
        transition={{
          duration: 0.8,
          times: [0, 0.2, 0.7, 1],
          ease: "easeOut"
        }}
        onAnimationComplete={onFinish}
        style={{
          position: "absolute",
          left: `${startX}px`,
          top: `${startY}px`,
          width: "120px",
          height: "400px", // Aumentamos a altura para ser um pilar de luz
          transformOrigin: "bottom center", // Cresce a partir de baixo ou ajuste para "top center" se preferir que caia
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 100,
        }}
      >
        {/* Gradiente linear vertical para parecer um feixe */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(to bottom, rgba(255,255,200,0) 0%, rgba(255,223,0,0.6) 50%, rgba(255,193,7,0.8) 100%)",
            boxShadow: "0 0 60px rgba(255,223,0,0.5)",
          }}
        />
      </motion.div>
    </>
  );
}