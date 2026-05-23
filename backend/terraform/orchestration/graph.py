import networkx as nx
from typing import Any
from terraform.models.schemas import GraphNode, GraphEdge, KnowledgeGraph

NODE_TEMPLATES = {
    "terrain": {"label": "Terrain", "type": "site"},
    "ecology": {"label": "Ecology", "type": "analysis"},
    "emotional_tone": {"label": "Emotional Tone", "type": "experience"},
    "architecture": {"label": "Architecture", "type": "built"},
    "climate": {"label": "Climate", "type": "environment"},
    "drainage": {"label": "Drainage", "type": "engineering"},
    "native_species": {"label": "Native Species", "type": "ecology"},
    "privacy": {"label": "Privacy", "type": "experience"},
    "lighting": {"label": "Lighting", "type": "design"},
    "entertaining": {"label": "Entertaining", "type": "lifestyle"},
    "water": {"label": "Water", "type": "conservation"},
    "lifestyle": {"label": "Lifestyle", "type": "human"},
    "budget": {"label": "Budget", "type": "constraint"},
    "soil": {"label": "Soil", "type": "site"},
    "views": {"label": "Views", "type": "experience"},
    "microclimate": {"label": "Microclimate", "type": "environment"},
    "access": {"label": "Access & Circulation", "type": "design"},
    "maintenance": {"label": "Maintenance", "type": "constraint"},
    "wildlife": {"label": "Wildlife", "type": "ecology"},
    "atmosphere": {"label": "Atmosphere", "type": "experience"},
}

EDGE_PATTERNS = [
    ("terrain", "drainage", "determines"),
    ("terrain", "soil", "shapes"),
    ("climate", "microclimate", "influences"),
    ("climate", "water", "constrains"),
    ("ecology", "native_species", "supports"),
    ("ecology", "wildlife", "supports"),
    ("emotional_tone", "atmosphere", "defines"),
    ("emotional_tone", "lifestyle", "reflects"),
    ("architecture", "entertaining", "enables"),
    ("lifestyle", "entertaining", "requires"),
    ("lifestyle", "maintenance", "determines"),
    ("water", "drainage", "integrates"),
    ("privacy", "views", "balances"),
    ("lighting", "atmosphere", "shapes"),
    ("native_species", "ecology", "enhances"),
    ("budget", "maintenance", "constrains"),
    ("budget", "architecture", "limits"),
    ("soil", "native_species", "nourishes"),
    ("access", "architecture", "connects"),
    ("microclimate", "native_species", "selects"),
]


class KnowledgeGraphBuilder:
    def __init__(self):
        self.graph = nx.Graph()
        self._init_nodes()
        self._init_edges()

    def _init_nodes(self):
        for node_id, props in NODE_TEMPLATES.items():
            self.graph.add_node(node_id, **props, confidence=0.3, active=False)

    def _init_edges(self):
        for source, target, label in EDGE_PATTERNS:
            if self.graph.has_node(source) and self.graph.has_node(target):
                self.graph.add_edge(source, target, strength=0.2, label=label)

    def activate_node(self, node_id: str, confidence: float = 0.5):
        if self.graph.has_node(node_id):
            self.graph.nodes[node_id]["active"] = True
            self.graph.nodes[node_id]["confidence"] = min(1.0, self.graph.nodes[node_id].get("confidence", 0) + confidence)
            for neighbor in self.graph.neighbors(node_id):
                edge_data = self.graph.get_edge_data(node_id, neighbor)
                if edge_data:
                    edge_data["strength"] = min(1.0, edge_data.get("strength", 0.2) + 0.1)

    def get_state(self) -> KnowledgeGraph:
        nodes = []
        for nid, data in self.graph.nodes(data=True):
            nodes.append(GraphNode(
                id=nid,
                label=data.get("label", nid),
                type=data.get("type", "unknown"),
                confidence=data.get("confidence", 0.5),
                active=data.get("active", False),
            ))
        edges = []
        for s, t, data in self.graph.edges(data=True):
            edges.append(GraphEdge(
                source=s,
                target=t,
                strength=data.get("strength", 0.2),
                label=data.get("label"),
            ))
        return KnowledgeGraph(nodes=nodes, edges=edges)

    def to_serializable(self) -> dict:
        kg = self.get_state()
        return kg.model_dump()
