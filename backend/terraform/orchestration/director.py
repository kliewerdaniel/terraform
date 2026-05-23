import asyncio
from typing import AsyncGenerator
from terraform.models.schemas import AgentRole, AgentThought, DeliberationRound, ConversationRequest, MemoryEntry
from terraform.models.llm_client import LLMClient
from terraform.memory.store import MemoryStore
from terraform.orchestration.graph import KnowledgeGraphBuilder
from terraform.agents.ecology import EcologyAgent
from terraform.agents.climate import ClimateAgent
from terraform.agents.landscape_architect import LandscapeArchitectAgent
from terraform.agents.water_conservation import WaterConservationAgent
from terraform.agents.lifestyle import LifestyleAgent
from terraform.agents.native_plants import NativePlantAgent
from terraform.agents.budget import BudgetAgent
from terraform.config import settings


class OrchestrationDirector:
    def __init__(self):
        self.llm = LLMClient()
        self.memory = MemoryStore()
        self.graph = KnowledgeGraphBuilder()
        self.conversation_id: str | None = None
        self.conversation_history: list[dict] = []
        self.user_profile: dict = {}

        self.agents = {
            AgentRole.ECOLOGY: EcologyAgent(self.llm),
            AgentRole.CLIMATE: ClimateAgent(self.llm),
            AgentRole.LANDSCAPE_ARCHITECT: LandscapeArchitectAgent(self.llm),
            AgentRole.WATER_CONSERVATION: WaterConservationAgent(self.llm),
            AgentRole.LIFESTYLE: LifestyleAgent(self.llm),
            AgentRole.NATIVE_PLANTS: NativePlantAgent(self.llm),
            AgentRole.BUDGET: BudgetAgent(self.llm),
        }

    def _update_graph_from_conversation(self, message: str):
        keyword_map = {
            "terrain": ["slope", "hill", "topography", "grade", "terrain", "flat", "steep", "elevation"],
            "climate": ["sun", "shade", "wind", "temperature", "climate", "heat", "cold", "sunny"],
            "ecology": ["ecology", "nature", "wildlife", "birds", "butterflies", "pollinator", "habitat", "ecosystem"],
            "emotional_tone": ["peaceful", "energetic", "calm", "serene", "dramatic", "cozy", "inspiring", "mood", "feel"],
            "entertaining": ["party", "gather", "cook", "dine", "host", "entertain", "guests", "bbq"],
            "water": ["water", "rain", "drought", "irrigation", "cistern", "rainwater", "conservation"],
            "native_species": ["native", "plant", "tree", "garden", "flower", "shrub", "grass", "perennial"],
            "privacy": ["privacy", "neighbor", "screen", "fence", "view", "hidden", "secluded"],
            "lighting": ["light", "moon", "evening", "night", "ambient", "lantern", "path"],
            "architecture": ["house", "patio", "deck", "structure", "pergola", "outdoor kitchen", "pavilion"],
            "lifestyle": ["morning", "evening", "weekend", "routine", "morning", "walk", "dog", "kids", "family"],
            "soil": ["soil", "clay", "limestone", "rock", "sand", "drainage", "compost"],
            "maintenance": ["maintenance", "care", "upkeep", "watering", "weeding", "pruning", "low maintenance"],
            "budget": ["budget", "cost", "expensive", "affordable", "phase", "invest"],
            "views": ["view", "sunset", "vista", "hill country", "overlook", "horizon"],
        }
        ml = message.lower()
        for node_id, keywords in keyword_map.items():
            if any(kw in ml for kw in keywords):
                self.graph.activate_node(node_id)

    async def process_conversation(self, request: ConversationRequest) -> AsyncGenerator[str, None]:
        self.conversation_id = request.conversation_id or f"conv_{id(self)}"

        self._update_graph_from_conversation(request.message)

        context = self.memory.get_context(request.message)

        yield f"event: graph\ndata: {self.graph.to_serializable()}\n\n"

        yield f"event: meta\ndata: {{\"conversation_id\": \"{self.conversation_id}\"}}\n\n"

        deliberation, graph_updates = await self._deliberate(request.message, context)
        for _ in graph_updates:
            yield f"event: graph\ndata: {self.graph.to_serializable()}\n\n"
        yield f"event: deliberation\ndata: {deliberation.model_dump_json()}\n\n"

        synthesis = await self._synthesize(request.message, context, deliberation)
        yield f"event: synthesis\ndata: {synthesis}\n\n"

        response_text = await self._generate_response(request.message, context, deliberation)
        yield f"event: token\ndata: {response_text}\n\n"

        yield f"event: graph\ndata: {self.graph.to_serializable()}\n\n"
        yield "event: done\ndata: {}\n\n"

        self.memory.store(
            MemoryEntry(
                type="conversation",
                content=f"User: {request.message}",
                context={"conversation_id": self.conversation_id},
            )
        )
        self.conversation_history.append({"role": "user", "content": request.message})

    async def _deliberate(self, message: str, context: str) -> tuple[DeliberationRound, list[int]]:
        agent_thoughts = []
        active_roles = self._select_agents(message)
        graph_updates = []

        for role in active_roles:
            agent = self.agents.get(role)
            if not agent:
                continue
            thought = await agent.think(context, message)
            agent_thoughts.append(AgentThought(agent=role, thought=thought, confidence=0.7))

            node_map = {
                AgentRole.ECOLOGY: "ecology",
                AgentRole.CLIMATE: "climate",
                AgentRole.LANDSCAPE_ARCHITECT: "architecture",
                AgentRole.WATER_CONSERVATION: "water",
                AgentRole.LIFESTYLE: "lifestyle",
                AgentRole.NATIVE_PLANTS: "native_species",
                AgentRole.BUDGET: "budget",
            }
            if role in node_map:
                self.graph.activate_node(node_map[role])
                graph_updates.append(1)

        return DeliberationRound(round=1, contributions=agent_thoughts), graph_updates

    def _select_agents(self, message: str) -> list[AgentRole]:
        ml = message.lower()
        active = []
        if any(k in ml for k in ["plant", "tree", "garden", "native", "wildlife", "bird", "ecology"]):
            active.extend([AgentRole.ECOLOGY, AgentRole.NATIVE_PLANTS])
        if any(k in ml for k in ["sun", "shade", "climate", "wind", "heat", "weather"]):
            active.append(AgentRole.CLIMATE)
        if any(k in ml for k in ["design", "layout", "look", "style", "patio", "deck", "path", "outdoor"]):
            active.append(AgentRole.LANDSCAPE_ARCHITECT)
        if any(k in ml for k in ["water", "drought", "rain", "irrigation", "cistern"]):
            active.append(AgentRole.WATER_CONSERVATION)
        if any(k in ml for k in ["entertain", "gather", "cook", "family", "feel", "lifestyle"]):
            active.append(AgentRole.LIFESTYLE)
        if any(k in ml for k in ["budget", "cost", "afford", "price", "phase"]):
            active.append(AgentRole.BUDGET)
        if not active:
            active = [AgentRole.LIFESTYLE, AgentRole.LANDSCAPE_ARCHITECT, AgentRole.ECOLOGY]
        return active[:4]

    async def _synthesize(self, message: str, context: str, deliberation: DeliberationRound) -> str:
        thoughts_text = "\n".join(
            f"[{t.agent.value}] {t.thought}" for t in deliberation.contributions
        )
        prompt = f"""Based on the user's message and agent deliberations, provide a design synthesis in JSON:

User: {message}

Agent Deliberations:
{thoughts_text}

Return JSON with keys: narrative (brief), ecology_analysis, plant_palette (array), terrain_strategy, sustainability (array), experiential_story, emotional_qualities (array), estimated_budget_range"""
        return await self.llm.generate(
            system_prompt="You are the TERRAFORM design synthesis engine. Synthesize multiple agent perspectives into a cohesive landscape design concept. Return valid JSON only.",
            user_prompt=prompt,
            temperature=0.4,
        )

    async def _generate_response(self, message: str, context: str, deliberation: DeliberationRound) -> str:
        thoughts_text = "\n".join(
            f"[{t.agent.value}] {t.thought}" for t in deliberation.contributions
        )
        prompt = f"""User: {message}

Agent Analysis:
{thoughts_text}

Provide an emotionally resonant, insightful response that synthesizes their perspectives into a cohesive vision for the landscape. Speak in the voice of a design intelligence. Be evocative, specific, and grounded in Texas ecology."""
        return await self.llm.generate(
            system_prompt="You are TERRAFORM — a living design intelligence system for Central Texas landscapes. Your voice is architectural, ecological, poetic, and precise.",
            user_prompt=prompt,
            temperature=0.8,
        )
