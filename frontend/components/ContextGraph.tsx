"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { useTerraformStore } from "@/store/terraform";
import clsx from "clsx";

const TYPE_COLORS: Record<string, string> = {
  analysis: "node-ecology",
  environment: "node-climate",
  design: "node-design",
  site: "node-site",
  experience: "node-experience",
  human: "node-human",
  conservation: "node-conservation",
  engineering: "node-engineering",
  constraint: "node-constraint",
  built: "node-built",
  ecology: "node-ecology",
  lifestyle: "node-human",
};

function TerraformNode({ data }: NodeProps) {
  const colorClass = TYPE_COLORS[data.nodeType] || "node-site";
  const confidence = data.confidence || 0.5;
  const isActive = data.active;

  return (
    <div
      className={clsx(
        "px-4 py-2 rounded border text-xs font-mono tracking-wider transition-all duration-500",
        "backdrop-blur-md",
        isActive
          ? "bg-white/[0.06] border-white/[0.15] text-white/90 shadow-lg"
          : "bg-white/[0.02] border-white/[0.04] text-zinc-600",
      )}
      style={{
        opacity: isActive ? 0.6 + confidence * 0.4 : 0.3,
        borderColor: isActive
          ? `rgba(228, 147, 65, ${0.2 + confidence * 0.4})`
          : "rgba(255,255,255,0.04)",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-ember-500/40 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <span
          className={clsx(
            "w-1.5 h-1.5 rounded-full transition-all",
            isActive ? "bg-ember-400 animate-pulse-slow" : "bg-zinc-700"
          )}
        />
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-ember-500/40 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { terraform: TerraformNode };

export default function ContextGraph() {
  const graph = useTerraformStore((s) => s.graph);

  const initialNodes: Node[] = useMemo(
    () =>
      graph?.nodes.map((n) => ({
        id: n.id,
        type: "terraform",
        position: POSITIONS[n.id] || { x: 0, y: 0 },
        data: {
          label: n.label,
          nodeType: n.type,
          confidence: n.confidence,
          active: n.active,
        },
      })) || [],
    [graph]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      graph?.edges.map((e) => ({
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        label: e.label,
        style: {
          stroke: `rgba(228, 147, 65, ${0.1 + e.strength * 0.3})`,
          strokeWidth: 0.5 + e.strength * 1.5,
        },
        labelStyle: {
          fill: "rgba(148, 148, 145, 0.4)",
          fontSize: 8,
          fontFamily: "JetBrains Mono, monospace",
        },
        animated: e.strength > 0.4,
      })) || [],
    [graph]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync when graph changes
  if (JSON.stringify(nodes.map((n) => n.id).sort()) !== JSON.stringify(initialNodes.map((n) => n.id).sort())) {
    // Use effect-like sync
    setTimeout(() => {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }, 0);
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={2}
        className="bg-transparent"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.03)" gap={24} />
        <Controls
          className="!bg-black/60 !border !border-white/[0.06] !rounded !backdrop-blur-md"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}

const POSITIONS: Record<string, { x: number; y: number }> = {
  terrain: { x: 0, y: 0 },
  ecology: { x: 250, y: -100 },
  emotional_tone: { x: -250, y: -100 },
  architecture: { x: 250, y: 100 },
  climate: { x: -250, y: 100 },
  drainage: { x: 150, y: -200 },
  native_species: { x: 400, y: -50 },
  privacy: { x: -400, y: -50 },
  lighting: { x: -150, y: -200 },
  entertaining: { x: 400, y: 50 },
  water: { x: 150, y: 200 },
  lifestyle: { x: -150, y: 200 },
  budget: { x: 400, y: 200 },
  soil: { x: -400, y: 200 },
  views: { x: -400, y: -200 },
  microclimate: { x: 0, y: -250 },
  access: { x: 0, y: 250 },
  maintenance: { x: -250, y: 300 },
  wildlife: { x: 250, y: -250 },
  atmosphere: { x: -250, y: -250 },
};
