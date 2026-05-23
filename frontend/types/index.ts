export interface GraphNode {
  id: string;
  label: string;
  type: string;
  confidence: number;
  active: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
  strength: number;
  label?: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AgentThought {
  agent: string;
  thought: string;
  confidence: number;
}

export interface DeliberationRound {
  round: number;
  contributions: AgentThought[];
}

export interface DesignSynthesis {
  narrative: string;
  ecology_analysis: string;
  plant_palette: string[];
  terrain_strategy: string;
  sustainability: string[];
  experiential_story: string;
  emotional_qualities: string[];
  estimated_budget_range?: string;
}

export interface ConversationMessage {
  role: "user" | "assistant" | "agent";
  content: string;
  agent?: string;
}

export type SSEEventType =
  | "token"
  | "graph"
  | "deliberation"
  | "synthesis"
  | "meta"
  | "done"
  | "error";
