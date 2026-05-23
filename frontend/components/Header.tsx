"use client";

import { motion } from "framer-motion";
import { useTerraformStore } from "@/store/terraform";

export default function Header() {
  const { phase, isStreaming, interviewAnswered, interviewTotal } = useTerraformStore();

  const isActive = phase !== "splash";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -20 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-ember-500/40 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-ember-500/60 animate-pulse-slow" />
          </div>
          <span className="font-display text-lg tracking-widest text-white/80">
            T E R R A F O R M
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs text-zinc-500 font-mono">
          {isStreaming && (
            <span className="text-ember-400 animate-pulse">● reasoning</span>
          )}
          {phase === "interview" && (
            <span>
              {interviewAnswered}/{interviewTotal} responses
            </span>
          )}
          <span className="hidden sm:inline">v0.1.0</span>
        </div>
      </div>
    </motion.header>
  );
}
