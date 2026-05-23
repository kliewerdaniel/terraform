from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class AgentRole(str, Enum):
    ECOLOGY = "ecology"
    CLIMATE = "climate"
    LANDSCAPE_ARCHITECT = "landscape_architect"
    WATER_CONSERVATION = "water_conservation"
    LIFESTYLE = "lifestyle"
    NATIVE_PLANTS = "native_plants"
    BUDGET = "budget"


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    AGENT = "agent"


class Message(BaseModel):
    role: MessageRole
    content: str
    agent: Optional[AgentRole] = None


class ConversationRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    stream: bool = True


class ConversationResponse(BaseModel):
    conversation_id: str
    message: str
    agents: list[str] = []


class AgentThought(BaseModel):
    agent: AgentRole
    thought: str
    confidence: float = Field(ge=0.0, le=1.0)


class DeliberationRound(BaseModel):
    round: int
    contributions: list[AgentThought]


class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    confidence: float = 0.5
    active: bool = True


class GraphEdge(BaseModel):
    source: str
    target: str
    strength: float = Field(ge=0.0, le=1.0)
    label: Optional[str] = None


class KnowledgeGraph(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class DesignSynthesis(BaseModel):
    narrative: str
    ecology_analysis: str
    plant_palette: list[str]
    terrain_strategy: str
    sustainability: list[str]
    experiential_story: str
    emotional_qualities: list[str]
    estimated_budget_range: Optional[str] = None


class MemoryEntry(BaseModel):
    id: Optional[str] = None
    type: str
    content: str
    context: dict = {}
    embedding: Optional[list[float]] = None


class SSEEvent(BaseModel):
    event: str
    data: str
