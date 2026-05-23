"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTerraformStore } from "@/store/terraform";
import Splash from "@/components/Splash";
import Header from "@/components/Header";
import InterviewPanel from "@/components/InterviewPanel";
import ConversationPanel from "@/components/ConversationPanel";
import ContextGraph from "@/components/ContextGraph";
import AgentLog from "@/components/AgentLog";
import SynthesisDashboard from "@/components/SynthesisDashboard";

export default function Home() {
  const { phase, setPhase } = useTerraformStore();
  const [showUI, setShowUI] = useState(false);

  const handleBegin = () => {
    setPhase("interview");
    setShowUI(true);
  };

  useEffect(() => {
    if (phase !== "splash") setShowUI(true);
  }, [phase]);

  return (
    <>
      <AnimatePresence>
        {phase === "splash" && <Splash onBegin={handleBegin} />}
      </AnimatePresence>

      <AnimatePresence>
        {showUI && phase !== "splash" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="h-screen w-screen flex flex-col"
          >
            <Header />

            <main className="flex-1 flex pt-16 overflow-hidden">
              {/* Left panel: Interview or Conversation */}
              <motion.div
                className="w-[420px] min-w-[420px] border-r border-white/[0.06] flex flex-col"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {phase === "interview" && <InterviewPanel />}
                {phase === "conversing" && <ConversationPanel />}
              </motion.div>

              {/* Center: Context Graph */}
              <motion.div
                className="flex-1 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="absolute inset-0">
                  <ContextGraph />
                </div>

                <div className="absolute bottom-4 left-4 text-[10px] font-mono text-zinc-800 tracking-widest">
                  KNOWLEDGE GRAPH · REAL-TIME
                </div>
              </motion.div>

              {/* Right panel: Agent Log or Synthesis */}
              <motion.div
                className="w-[360px] min-w-[360px] border-l border-white/[0.06] flex flex-col"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {phase === "interview" && <AgentLog />}
                {phase === "conversing" && (
                  <>
                    <div className="flex border-b border-white/[0.06]">
                      <TabButton active={true} label="Agents" />
                      <TabButton active={false} label="Synthesis" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <SynthesisDashboard />
                    </div>
                  </>
                )}
              </motion.div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function TabButton({ active, label }: { active: boolean; label: string }) {
  return (
    <button
      className={`flex-1 py-3 text-xs font-mono tracking-wider transition-all duration-300 ${
        active
          ? "text-ember-400/80 border-b border-ember-500/30 bg-white/[0.02]"
          : "text-zinc-600 hover:text-zinc-400"
      }`}
    >
      {label}
    </button>
  );
}
