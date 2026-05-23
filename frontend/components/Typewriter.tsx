"use client";

import { motion } from "framer-motion";

interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
}

export default function Typewriter({ text, className = "", speed = 0.03 }: TypewriterProps) {
  return (
    <span className={className}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * speed, duration: 0 }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
