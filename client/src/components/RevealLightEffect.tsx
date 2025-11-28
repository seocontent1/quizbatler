// src/components/RevealLightEffect.tsx
import { motion } from "framer-motion";

export default function RevealLightEffect() {
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0.2, y: -250 }}   // COMEÇA BEM NO ALTO
      animate={{ opacity: [0, 1, 0], scaleY: [0.2, 1, 0.6], y: 0 }} // DESCE ATÉ O PLAYER
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="absolute top-[0px] left-0 right-0 flex items-start justify-center"
      style={{
        zIndex: 50,
      }}
    >
      {/* Raio vindo de cima */}
      <div
        className="w-[160px] h-[280px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,150,0.9), rgba(255,255,150,0.9), transparent)",
          filter: "blur(9px)",
        }}
      />
    </motion.div>
  );
}
