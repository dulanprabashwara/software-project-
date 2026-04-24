"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

export default function FloatingConfetti() {
  const items = useMemo(
    () =>
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 6 + Math.random() * 3,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ y: -100, opacity: 0, rotate: -20 }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, 1, 1, 0], rotate: [-20, 20] }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute text-3xl"
          style={{ left: `${item.left}%` }}
        >
          🎉
        </motion.div>
      ))}
    </div>
  );
}