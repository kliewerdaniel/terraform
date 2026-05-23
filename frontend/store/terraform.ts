import { create } from "zustand";
import type {
  KnowledgeGraph,
  DeliberationRound,
  DesignSynthesis,
  ConversationMessage,
  AgentThought,
} from "@/types";

export interface TerraformState {
  phase: "splash" | "interview" | "conversing" | "synthesis";
  conversationId: string | null;
  messages: ConversationMessage[];
  graph: KnowledgeGraph | null;
  deliberation: DeliberationRound | null;
  synthesis: DesignSynthesis | null;
  isStreaming: boolean;
  streamingText: string;
  interviewAnswered: number;
  interviewTotal: number;
  currentQuestion: string | null;
  profile: string | null;
  agentLogs: AgentThought[];

  setPhase: (phase: TerraformState["phase"]) => void;
  setConversationId: (id: string) => void;
  addMessage: (msg: ConversationMessage) => void;
  setGraph: (graph: KnowledgeGraph) => void;
  setDeliberation: (d: DeliberationRound) => void;
  setSynthesis: (s: DesignSynthesis) => void;
  setIsStreaming: (v: boolean) => void;
  appendStreamingText: (text: string) => void;
  setStreamingText: (text: string) => void;
  setInterviewProgress: (answered: number, total: number) => void;
  setCurrentQuestion: (q: string | null) => void;
  setProfile: (p: string | null) => void;
  addAgentLog: (thought: AgentThought) => void;
  reset: () => void;
}

const initialState = {
  phase: "splash" as const,
  conversationId: null,
  messages: [],
  graph: null,
  deliberation: null,
  synthesis: null,
  isStreaming: false,
  streamingText: "",
  interviewAnswered: 0,
  interviewTotal: 14,
  currentQuestion: null,
  profile: null,
  agentLogs: [],
};

export const useTerraformStore = create<TerraformState>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),
  setConversationId: (conversationId) => set({ conversationId }),
  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),
  setGraph: (graph) => set({ graph }),
  setDeliberation: (deliberation) => set({ deliberation }),
  setSynthesis: (synthesis) => set({ synthesis }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  appendStreamingText: (text) =>
    set((s) => ({ streamingText: s.streamingText + text })),
  setStreamingText: (streamingText) => set({ streamingText }),
  setInterviewProgress: (answered, interviewTotal) =>
    set({ interviewAnswered: answered, interviewTotal }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  setProfile: (profile) => set({ profile }),
  addAgentLog: (thought) =>
    set((s) => ({ agentLogs: [...s.agentLogs, thought] })),
  reset: () => set(initialState),
}));
