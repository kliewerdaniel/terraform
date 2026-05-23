"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTerraformStore } from "@/store/terraform";
import Typewriter from "./Typewriter";

export default function InterviewPanel() {
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const { currentQuestion, setCurrentQuestion, setInterviewProgress, interviewAnswered, interviewTotal, setPhase, setProfile } = useTerraformStore();

  useEffect(() => {
    fetchNextQuestion();
  }, []);

  const fetchNextQuestion = async () => {
    try {
      const resp = await fetch("/api/interview/question");
      const data = await resp.json();
      setCurrentQuestion(data.question);
      setInterviewProgress(data.answered, data.total);
      setTimeout(() => setShowQuestion(true), 300);
    } catch (err) {
      setCurrentQuestion("How do you imagine spending time in your outdoor space?");
      setShowQuestion(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const resp = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion, answer }),
      });
      const data = await resp.json();
      setAnswer("");

      if (data.complete) {
        setProfile(data.profile);
        setPhase("conversing");
      } else {
        setCurrentQuestion(data.next_question);
        setInterviewProgress(data.answered, data.total);
        setShowQuestion(false);
        setTimeout(() => setShowQuestion(true), 400);
      }
    } catch (err) {
      console.error("Interview error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-center px-8 max-w-xl mx-auto">
      <div className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-8">
        Site Interview · {interviewAnswered}/{interviewTotal}
      </div>

      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0 }}
            animate={showQuestion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg md:text-xl font-display text-white/80 leading-relaxed mb-8">
              {showQuestion ? (
                <Typewriter text={currentQuestion} speed={0.015} />
              ) : (
                currentQuestion
              )}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                disabled={isLoading}
                className="w-full bg-white/[0.03] border border-white/[0.08] 
                           px-4 py-3 text-sm text-white/90 placeholder-zinc-600 rounded-none
                           focus:outline-none focus:border-ember-500/30 focus:bg-white/[0.05]
                           transition-all duration-300 disabled:opacity-30 font-mono resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || !answer.trim()}
                  className="px-6 py-2.5 border border-ember-500/30 text-ember-400/80 
                             text-xs tracking-widest font-mono
                             hover:bg-ember-500/10 hover:border-ember-500/50 
                             disabled:opacity-20 disabled:cursor-not-allowed
                             transition-all duration-300"
                >
                  {isLoading ? "..." : "CONTINUE"}
                </button>
              </div>
            </form>

            <div className="mt-8 w-full bg-white/[0.03] h-px">
              <motion.div
                className="h-full bg-ember-500/30"
                initial={{ width: "0%" }}
                animate={{ width: `${interviewTotal > 0 ? (interviewAnswered / interviewTotal) * 100 : 0}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
