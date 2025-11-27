// src/components/AttackEffect.tsx
import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface Props {
  image: string;
  startX: number;
  startY: number;
  distX: number;
  onFinish: () => void;
}

export default function AttackEffect({ image, startX, startY, distX, onFinish }: Props) {
  const controls = useAnimation();
  const size = 80;

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      await controls.set({ x: 0, opacity: 1 });
      await new Promise(r => setTimeout(r, 16)); // wait paint
      if (!mounted) return;
      await controls.start({ x: distX, transition: { duration: 0.45, ease: "linear" } });
      if (!mounted) return;
      onFinish();
    };
    run();
    return () => { mounted = false; controls.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startX, startY, distX]);

  return (
    <motion.img
      src={image}
      alt="attack"
      initial={{ opacity: 0 }}
      animate={controls}
      style={{
        position: "absolute",
        left: `${startX - size/2}px`,
        top: `${startY - size/2}px`,
        width: `${size}px`,
        height: `${size}px`,
        pointerEvents: "none",
        zIndex: 50
      }}
    />
  );
}
