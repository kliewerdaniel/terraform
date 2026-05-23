"use client";

import { motion } from "framer-motion";

export default function Splash({ onBegin }: { onBegin: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-center"
      >
        <motion.h1
          className="font-display text-6xl md:text-8xl tracking-[0.3em] text-white/90 mb-6 text-glow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          TERRAFORM
        </motion.h1>
        <motion.p
          className="text-zinc-500 text-sm md:text-base tracking-widest font-mono mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          LIVING DESIGN INTELLIGENCE · CENTRAL TEXAS
        </motion.p>
        <motion.p
          className="text-zinc-600 text-xs md:text-sm max-w-md mx-auto mb-16 leading-relaxed font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          A multi-agent ecological intelligence system for designing
          emotionally resonant outdoor spaces. Conversational, recursive,
          generative.
        </motion.p>
        <motion.button
          onClick={onBegin}
          className="px-10 py-3 border border-ember-500/30 text-ember-400/80 
                     text-sm tracking-widest font-mono rounded-none
                     hover:bg-ember-500/10 hover:border-ember-500/50 
                     transition-all duration-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          INITIALIZE
        </motion.button>
      </motion.div>

      <motion.div
        className="absolute bottom-12 text-zinc-800 text-[10px] font-mono tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
      >
        LOCAL AI · MULTI-AGENT · RECURSIVE MEMORY
      </motion.div>
    </motion.div>
  );
}
