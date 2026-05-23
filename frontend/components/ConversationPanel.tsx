"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTerraformStore } from "@/store/terraform";
import { useSSE } from "@/hooks/useSSE";

export default function ConversationPanel() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    streamingText,
    isStreaming,
    phase,
  } = useTerraformStore();
  const { sendMessage } = useSSE();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, streamingText]);

  useEffect(() => {
    if (!isStreaming && phase === "conversing") {
      inputRef.current?.focus();
    }
  }, [isStreaming, phase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4" ref={scrollRef}>
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-white/5 border border-white/[0.06] text-white/90"
                    : "text-zinc-300"
                } px-4 py-3 text-sm leading-relaxed`}
              >
                {msg.role === "agent" && (
                  <span className="text-ember-400/60 text-[10px] font-mono tracking-wider block mb-1 uppercase">
                    [{msg.agent}]
                  </span>
                )}
                {msg.content}
              </div>
            </motion.div>
          ))}

          {isStreaming && streamingText && (
            <motion.div
              key="streaming"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="text-zinc-300 px-4 py-3 text-sm leading-relaxed">
                <span className="typing-cursor">{streamingText}</span>
              </div>
            </motion.div>
          )}

          {isStreaming && !streamingText && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="text-zinc-500 px-4 py-3 text-sm font-mono">
                <span className="inline-flex gap-1">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse animation-delay-200">●</span>
                  <span className="animate-pulse animation-delay-400">●</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-white/[0.06] p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your land, your life, your vision..."
            disabled={isStreaming}
            className="flex-1 bg-white/[0.03] border border-white/[0.08] px-4 py-3 
                       text-sm text-white/90 placeholder-zinc-600 rounded-none
                       focus:outline-none focus:border-ember-500/30 focus:bg-white/[0.05]
                       transition-all duration-300 disabled:opacity-30 font-mono"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="px-6 py-3 border border-ember-500/30 text-ember-400/80 
                       text-xs tracking-widest font-mono
                       hover:bg-ember-500/10 hover:border-ember-500/50 
                       disabled:opacity-20 disabled:cursor-not-allowed
                       transition-all duration-300"
          >
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}
