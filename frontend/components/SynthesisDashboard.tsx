"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTerraformStore } from "@/store/terraform";

export default function SynthesisDashboard() {
  const synthesis = useTerraformStore((s) => s.synthesis);

  if (!synthesis) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full overflow-y-auto p-6"
      >
        <div className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-6">
          Design Synthesis
        </div>

        <Section title="Narrative" delay={0.1}>
          <p className="text-sm text-zinc-300 leading-relaxed">{synthesis.narrative}</p>
        </Section>

        <Section title="Ecology Analysis" delay={0.2}>
          <p className="text-sm text-zinc-300 leading-relaxed">{synthesis.ecology_analysis}</p>
        </Section>

        <Section title="Native Plant Palette" delay={0.3}>
          <div className="flex flex-wrap gap-2">
            {synthesis.plant_palette.map((plant, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs bg-sage-500/10 border border-sage-500/20 text-sage-300 font-mono"
              >
                {plant}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Terrain Strategy" delay={0.4}>
          <p className="text-sm text-zinc-300 leading-relaxed">{synthesis.terrain_strategy}</p>
        </Section>

        <Section title="Emotional Qualities" delay={0.5}>
          <div className="flex flex-wrap gap-2">
            {synthesis.emotional_qualities.map((q, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs bg-ember-500/10 border border-ember-500/20 text-ember-300 font-mono"
              >
                {q}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Experiential Story" delay={0.6}>
          <p className="text-sm text-zinc-300 leading-relaxed italic">
            &ldquo;{synthesis.experiential_story}&rdquo;
          </p>
        </Section>

        <Section title="Sustainability" delay={0.7}>
          <ul className="space-y-1">
            {synthesis.sustainability.map((s, i) => (
              <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                <span className="text-ember-400/60 mt-0.5">→</span>
                {s}
              </li>
            ))}
          </ul>
        </Section>

        {synthesis.estimated_budget_range && (
          <Section title="Estimated Budget" delay={0.8}>
            <p className="text-sm text-zinc-300 font-mono">{synthesis.estimated_budget_range}</p>
          </Section>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function Section({
  title,
  delay,
  children,
}: {
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="mb-6"
    >
      <div className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-2">
        {title}
      </div>
      {children}
    </motion.div>
  );
}
