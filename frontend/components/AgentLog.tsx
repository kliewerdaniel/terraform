"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTerraformStore } from "@/store/terraform";

const AGENT_COLORS: Record<string, string> = {
  ecology: "text-emerald-400",
  climate: "text-sky-400",
  landscape_architect: "text-amber-400",
  water_conservation: "text-cyan-400",
  lifestyle: "text-rose-400",
  native_plants: "text-green-400",
  budget: "text-zinc-400",
};

export default function AgentLog() {
  const agentLogs = useTerraformStore((s) => s.agentLogs);

  return (
    <div className="h-full overflow-y-auto px-3 py-3 space-y-2">
      <div className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-3">
        Agent Deliberations
      </div>
      <AnimatePresence>
        {agentLogs.map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="border-l border-white/[0.06] pl-3 py-1"
          >
            <div className={`text-[10px] font-mono font-medium ${AGENT_COLORS[log.agent] || "text-zinc-400"}`}>
              [{log.agent}]
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed line-clamp-3">
              {log.thought}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {agentLogs.length === 0 && (
        <div className="text-[11px] text-zinc-700 font-mono">
          Awaiting agent responses...
        </div>
      )}
    </div>
  );
}
