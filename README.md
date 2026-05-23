# TERRAFORM

**Living Design Intelligence for Central Texas Landscapes**

TERRAFORM is an experimental, local-first AI system that designs emotionally resonant outdoor spaces through multi-agent orchestration, recursive memory, and graph-based reasoning. It is not a chatbot, not a SaaS CRUD app, and not a generic landscape tool. It is a living design intelligence — architectural, ecological, cinematic, and deliberately local.

The system interviews users conversationally, constructs a deep contextual model of their lifestyle and land, orchestrates specialized AI agents that deliberate collaboratively, and synthesizes evolving landscape concepts in real time — all running on local LLMs via Ollama.

---

## Core Concepts

### Multi-Agent Deliberation

Seven specialized agents contribute their expertise to every design conversation. Each agent operates with a tightly scoped system prompt grounded in Central Texas ecological reality:

| Agent | Role | Domain |
|-------|------|--------|
| Ecology Agent | Ecosystem analysis | Blackland Prairie, Edwards Plateau, wildlife corridors, soil regeneration |
| Texas Climate Agent | Climate resilience | 100°F summers, flash floods, drought cycles, hard freezes, microclimates |
| Landscape Architect Agent | Spatial design | Outdoor rooms, viewshed framing, material transitions, circulation |
| Water Conservation Agent | Hydrology | Rainwater harvesting, greywater, xeriscaping, permeable paving, Edwards Aquifer |
| Lifestyle Interpreter | Human factors | Entertaining styles, emotional goals, daily rituals, family dynamics |
| Native Plant Specialist | Botany | Keystone species, bloom succession, plant communities, Texas Superstars |
| Budget Agent | Economics | Phased implementation, Austin market costs, material tradeoffs, ROI |

Agents are selected dynamically based on the user's language — mention "drought" and the Water Conservation and Climate agents activate; mention "entertaining" and the Lifestyle Interpreter and Landscape Architect join.

### Live Knowledge Graph

As the conversation unfolds, a NetworkX graph animates in real time via ReactFlow. Nodes represent design dimensions (terrain, ecology, emotional tone, privacy, lighting, drainage, etc.). Edges represent relationships between them. When an agent contributes, relevant nodes activate, edges strengthen, and the graph evolves as a visible cognition map — you watch the system think.

### Recursive Memory

ChromaDB stores every accepted idea, rejected direction, user preference, and design decision. Future conversations are contextualized against this growing memory. The system adapts progressively, remembering what resonated and what didn't.

### SSE Streaming Architecture

Every reasoning step streams to the frontend as structured Server-Sent Events:

- `graph` — updated knowledge graph topology
- `deliberation` — agent thoughts and confidence scores
- `synthesis` — aggregated design synthesis as structured JSON
- `token` — streaming text for the conversational response
- `done` — signal completion

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)             │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Interview │  │  Context     │  │  Agent Log +   │ │
│  │ / Chat    │  │  Graph       │  │  Synthesis     │ │
│  │ Panel     │  │  (ReactFlow) │  │  Dashboard     │ │
│  └─────┬─────┘  └──────┬───────┘  └───────┬────────┘ │
│        └───────────────┼──────────────────┘          │
│                        │ SSE Stream                  │
└────────────────────────┼────────────────────────────┘
                         │ POST /api/converse
┌────────────────────────┼────────────────────────────┐
│              Backend (FastAPI + asyncio)              │
│  ┌─────────────────────┴──────────────────────────┐  │
│  │            Orchestration Director                │  │
│  │  ┌──────────┐  ┌───────────┐  ┌─────────────┐  │  │
│  │  │  Agent   │  │  Memory   │  │  Knowledge   │  │  │
│  │  │  Router  │  │  (Chroma) │  │  Graph (NX)  │  │  │
│  │  └────┬─────┘  └───────────┘  └─────────────┘  │  │
│  └───────┼─────────────────────────────────────────┘  │
│          │                                            │
│  ┌───────┴───────────────────────────────────────┐    │
│  │              LLM Client (Ollama)               │    │
│  │         ollama://localhost:11434               │    │
│  └───────────────────────────────────────────────┘    │
│                                                        │
│  Optional: ComfyUI / SDXL / Flux for image generation  │
└────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Next.js 14** App Router with TypeScript
- **Tailwind CSS** — custom amber-on-black design system
- **Framer Motion** — choreographed transitions, typewriter effects
- **ReactFlow** — interactive knowledge graph visualization
- **Zustand** — lightweight state machine for conversation phases

### Backend
- **FastAPI** — async Python server with SSE streaming
- **NetworkX** — orchestration graph for agent coordination
- **ChromaDB** — persistent vector memory with embedding search
- **Ollama** — local LLM provider (Qwen, DeepSeek, Llama 3, Mistral, Gemma)

### Local Models (recommended)
- Qwen 2.5 (14B) — primary reasoning agent
- DeepSeek / Llama 3 / Mistral / Gemma — alternatives
- SDXL / Flux — optional local image generation via ComfyUI

---

## Quick Start

### Prerequisites

- [Ollama](https://ollama.ai) — `brew install ollama`
- Python 3.11+
- Node.js 18+

### Setup

```bash
# Clone and enter
git clone <repo> && cd land

# Pull a local model
ollama pull qwen2.5:14b

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m terraform.app
# → FastAPI running on http://localhost:8080

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
# → Next.js running on http://localhost:3000
```

Or use the automated script:

```bash
chmod +x setup.sh && ./setup.sh
```

---

## Usage Walkthrough

### 1. Splash Screen
The entry point is deliberately minimal. A single "INITIALIZE" button.

### 2. Adaptive Interview
TERRAFORM asks 14 questions about lifestyle, emotional goals, site conditions, entertaining habits, maintenance tolerance, and ecological priorities. Each answer is recorded into a user profile. The interview adapts — already-covered topics are skipped.

### 3. Free Conversation
Once the profile is established, users can describe their property and vision in natural language:
> *"We have 3 acres in Dripping Springs with a steep south-facing slope and lots of cedar. We want to create gathering spaces for dinner parties but also have quiet corners for morning coffee. Native plants are important to us, and we're on a well so water conservation matters."*

### 4. Agent Deliberation
The system selects relevant agents (Climate, Ecology, Lifestyle, Native Plants, Water), streams their reasoning to the right panel, and activates corresponding nodes in the knowledge graph. You watch the system think.

### 5. Design Synthesis
Agents' perspectives are aggregated into a cohesive design concept:
- Emotional design narrative
- Ecology analysis
- Native plant palette (species-level)
- Terrain strategy
- Sustainability recommendations
- Experiential storytelling
- Budget range estimate

---

## Configuration

Environment variables (or `.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `TERRAFORM_LLM_PROVIDER` | `ollama` | LLM backend |
| `TERRAFORM_OLLAMA_MODEL` | `qwen2.5:14b` | Model name |
| `TERRAFORM_OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama endpoint |
| `TERRAFORM_CHROMA_PERSIST_DIRECTORY` | `./terraform_memory` | Memory storage path |
| `TERRAFORM_COMFYUI_ENABLED` | `false` | Enable image generation |
| `TERRAFORM_COMFYUI_BASE_URL` | `http://localhost:8188` | ComfyUI endpoint |
| `TERRAFORM_MAX_AGENT_ROUNDS` | `3` | Deliberation depth |

---

## Design System

The interface aesthetic is deliberately architectural and cinematic:

- **Typography**: Fraunces (display), Inter (UI), JetBrains Mono (data)
- **Palette**: Black backgrounds, amber accents (`#e49341`), sage greens for ecology, dusk blues for climate
- **Materials**: Glass panels with backdrop blur, thin borders, amber glow effects
- **Motion**: Staggered fade-ins, character-by-character reveal, pulse animations on active graph nodes
- **Layout**: Three-panel structure — interview/conversation | graph | agent deliberation/synthesis

This is not a dashboard. It is a design intelligence studio.

---

## Extending

### Adding a New Agent

```python
# backend/terraform/agents/my_agent.py
from terraform.agents.base import BaseAgent
from terraform.models.schemas import AgentRole

class MyAgent(BaseAgent):
    role = AgentRole.MY_NEW_ROLE
    name = "My Custom Agent"
    system_prompt = """Your domain-specific prompt here..."""
```

Register in `AgentRole` enum and add to `OrchestrationDirector`.

### Custom Graph Nodes

Add entries to `NODE_TEMPLATES` and `EDGE_PATTERNS` in `orchestration/graph.py`, then map keywords in `_select_agents` and `_update_graph_from_conversation`.

---

## Why This Exists

TERRAFORM exists to demonstrate what's possible when you combine:
- Local AI models running at inference with recursive context
- Multi-agent orchestration as a visible, streaming process
- Graph cognition as a user-facing interface element
- Human-AI collaboration where the system adapts to the user, not the other way around

This is Daniel Kliewer's exploration of experimental AI systems — architectural, ecological, psychologically immersive, and running entirely on local hardware.

---

## License

MIT
