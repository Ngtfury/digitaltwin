'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Server, Shield, Database, Radio, Key, Cloud, AlertTriangle, 
  CheckCircle2, Lock, Unlock, Eye, Sparkles, AlertOctagon, Terminal,
  PlusCircle, Link2, Zap, Trash2, Layers, Move
} from 'lucide-react';
import { NetworkNode, NetworkEdge, TopologyData } from '../types';

interface DigitalTwinCanvasProps {
  topology: TopologyData;
  onIsolateNode: (nodeId: string) => void;
  onPatchNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onLoadTemplate: (templateName: string) => void;
  onOpenAddNode: () => void;
  onOpenConnectEdge: () => void;
  onOpenCustomAttack: () => void;
  onDirectAttackNode?: (targetNodeId: string, attackType: string) => void;
  activeCompromisedNode?: string | null;
}

const DEFAULT_COORDINATES: Record<string, { x: number; y: number }> = {
  ext_attacker: { x: 450, y: 50 },
  fw_perimeter: { x: 300, y: 150 },
  cloud_gateway: { x: 600, y: 150 },
  dmz_web: { x: 450, y: 260 },
  internal_app: { x: 300, y: 380 },
  iot_controller: { x: 600, y: 380 },
  iot_sensors: { x: 750, y: 480 },
  iam_directory: { x: 150, y: 480 },
  db_core: { x: 300, y: 520 },
  cloud_s3_storage: { x: 500, y: 580 }
};

export default function DigitalTwinCanvas({
  topology,
  onIsolateNode,
  onPatchNode,
  onDeleteNode,
  onLoadTemplate,
  onOpenAddNode,
  onOpenConnectEdge,
  onOpenCustomAttack,
  onDirectAttackNode,
  activeCompromisedNode
}: DigitalTwinCanvasProps) {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [activeTemplate, setActiveTemplate] = useState('ieee_base');
  
  // Interactive Real-Time Dragging State
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Initialize and synchronize node coordinates
  useEffect(() => {
    setNodePositions((prev) => {
      const next = { ...prev };
      topology.nodes.forEach(({ data }, index) => {
        if (!next[data.id]) {
          if (data.x && data.y) {
            next[data.id] = { x: data.x, y: data.y };
          } else if (DEFAULT_COORDINATES[data.id]) {
            next[data.id] = DEFAULT_COORDINATES[data.id];
          } else {
            const col = index % 4;
            const row = Math.floor(index / 4);
            next[data.id] = { x: 200 + col * 180, y: 160 + row * 130 };
          }
        }
      });
      return next;
    });
  }, [topology.nodes]);

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    const clicked = topology.nodes.find(n => n.data.id === nodeId)?.data;
    if (clicked) setSelectedNode(clicked);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(40, Math.min(910, e.clientX - rect.left));
    const y = Math.max(40, Math.min(620, e.clientY - rect.top));

    setNodePositions((prev) => ({
      ...prev,
      [draggingNodeId]: { x, y }
    }));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'EXTERNAL': return AlertOctagon;
      case 'SECURITY_GATEWAY': return Shield;
      case 'GATEWAY': return Cloud;
      case 'SERVER': return Server;
      case 'IOT_DEVICE': return Radio;
      case 'IDENTITY': return Key;
      case 'DATABASE': return Database;
      case 'STORAGE': return Cloud;
      default: return Server;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPROMISED':
        return {
          bg: 'bg-rose-950/80',
          border: 'border-rose-500',
          text: 'text-rose-400',
          badge: 'bg-rose-900/60 text-rose-300 border-rose-500/50'
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-amber-950/80',
          border: 'border-amber-500',
          text: 'text-amber-400',
          badge: 'bg-amber-900/60 text-amber-300 border-amber-500/50'
        };
      case 'ISOLATED':
        return {
          bg: 'bg-sky-950/80',
          border: 'border-sky-500',
          text: 'text-sky-400',
          badge: 'bg-sky-900/60 text-sky-300 border-sky-500/50'
        };
      case 'ATTACKING':
        return {
          bg: 'bg-purple-950/80',
          border: 'border-purple-500',
          text: 'text-purple-400',
          badge: 'bg-purple-900/60 text-purple-300 border-purple-500/50'
        };
      default:
        return {
          bg: 'bg-slate-900/90',
          border: 'border-emerald-500/50',
          text: 'text-emerald-400',
          badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
        };
    }
  };

  const handleTemplateChange = (tmpl: string) => {
    setActiveTemplate(tmpl);
    setNodePositions({});
    onLoadTemplate(tmpl);
    setSelectedNode(null);
  };

  return (
    <div className="relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Canvas Top Bar with Interactive Builder Buttons */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Template Selector */}
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300">Architecture:</span>
          <select
            value={activeTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 outline-none focus:border-cyan-500 font-medium"
          >
            <option value="ieee_base">IEEE Base Paper Enterprise (10 Nodes)</option>
            <option value="fintech_banking">FinTech Cloud Banking (PCI-DSS & SOC 2)</option>
            <option value="healthcare_iot">Healthcare Smart Hospital (HIPAA & Medical IoT)</option>
            <option value="blank">Blank Canvas (Build Your Own Network)</option>
          </select>

          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono ml-2 border border-slate-800 px-2 py-0.5 rounded bg-slate-900">
            <Move className="h-3 w-3 text-cyan-400" /> Drag nodes to rearrange
          </span>
        </div>

        {/* Center / Right: Interactive Builder Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddNode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-700/80 hover:bg-cyan-600 text-cyan-100 font-semibold text-xs border border-cyan-500/50 shadow transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>+ Add Asset</span>
          </button>

          <button
            onClick={onOpenConnectEdge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 shadow transition"
          >
            <Link2 className="h-3.5 w-3.5" />
            <span>+ Connect Link</span>
          </button>

          <button
            onClick={onOpenCustomAttack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700/80 hover:bg-rose-600 text-rose-100 font-semibold text-xs border border-rose-500/50 shadow transition"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>⚡ Custom Attack</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area with Real-Time Dragging */}
      <div 
        className="relative w-full h-[660px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] overflow-auto select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <svg ref={svgRef} className="w-[950px] h-[660px] mx-auto block">
          <defs>
            <marker
              id="arrow-normal"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
            </marker>
            <marker
              id="arrow-attack"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
            </marker>
          </defs>

          {/* Render Graph Edges (Dynamically anchor to node positions) */}
          {topology.edges.map(({ data }) => {
            const srcCoord = nodePositions[data.source] || { x: 450, y: 300 };
            const dstCoord = nodePositions[data.target] || { x: 450, y: 300 };
            const isAttack = data.active || data.attack_vector;

            const midX = (srcCoord.x + dstCoord.x) / 2;
            const midY = (srcCoord.y + dstCoord.y) / 2;

            return (
              <g key={data.id}>
                <line
                  x1={srcCoord.x}
                  y1={srcCoord.y}
                  x2={dstCoord.x}
                  y2={dstCoord.y}
                  stroke={isAttack ? '#f43f5e' : '#334155'}
                  strokeWidth={isAttack ? 3 : 1.5}
                  strokeDasharray={isAttack ? '6 4' : 'none'}
                  markerEnd={isAttack ? 'url(#arrow-attack)' : 'url(#arrow-normal)'}
                  className={isAttack ? 'animate-pulse' : ''}
                />
                <rect
                  x={midX - 35}
                  y={midY - 10}
                  width="70"
                  height="16"
                  rx="3"
                  fill="#090d16"
                  stroke={isAttack ? '#f43f5e' : '#1e293b'}
                  strokeWidth="0.8"
                />
                <text
                  x={midX}
                  y={midY + 2}
                  textAnchor="middle"
                  fill={isAttack ? '#fda4af' : '#64748b'}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {data.protocol}
                </text>
              </g>
            );
          })}

          {/* Render Graph Nodes with Click & Drag handlers */}
          {topology.nodes.map(({ data }) => {
            const coord = nodePositions[data.id] || { x: 450, y: 300 };
            const Icon = getNodeIcon(data.type);
            const style = getStatusColor(data.status);
            const isSelected = selectedNode?.id === data.id;
            const isDragging = draggingNodeId === data.id;

            return (
              <g
                key={data.id}
                transform={`translate(${coord.x}, ${coord.y})`}
                onMouseDown={(e) => handleMouseDown(data.id, e)}
                className="cursor-grab active:cursor-grabbing group"
              >
                {/* Outer Glow / Halo for compromised/attacking */}
                <circle
                  r={isSelected ? 36 : 28}
                  fill="transparent"
                  stroke={isSelected ? '#38bdf8' : 'transparent'}
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  className={data.status === 'COMPROMISED' ? 'animate-spin' : ''}
                />

                {/* Node Body */}
                <circle
                  r="24"
                  className={`${style.bg} transition-all duration-200 ${isSelected ? 'scale-110' : ''}`}
                  stroke={data.status === 'COMPROMISED' ? '#f43f5e' : (data.status === 'ISOLATED' ? '#0ea5e9' : '#10b981')}
                  strokeWidth={data.status === 'COMPROMISED' ? '3' : '1.5'}
                />

                {/* Node Icon */}
                <foreignObject x="-12" y="-12" width="24" height="24">
                  <div className="flex items-center justify-center h-full w-full pointer-events-none">
                    <Icon className={`h-4 w-4 ${style.text}`} />
                  </div>
                </foreignObject>

                {/* Node Label & IP */}
                <text
                  x="0"
                  y="38"
                  textAnchor="middle"
                  className="fill-slate-200 text-[11px] font-semibold drop-shadow pointer-events-none"
                >
                  {data.label}
                </text>
                <text
                  x="0"
                  y="50"
                  textAnchor="middle"
                  className="fill-slate-400 text-[9px] font-mono pointer-events-none"
                >
                  {data.ip}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-84 bg-slate-900/95 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-semibold text-slate-100 text-sm flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-cyan-400" />
                  {selectedNode.label}
                </h4>
                <p className="text-xs text-slate-400 font-mono">{selectedNode.ip}</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 bg-slate-800 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 my-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Node Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusColor(selectedNode.status).badge}`}>
                  {selectedNode.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Operating System:</span>
                <span className="text-slate-300 font-mono">{selectedNode.os}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Criticality:</span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                  selectedNode.criticality === 'CRITICAL' ? 'bg-red-950 text-red-300' : 'bg-slate-800 text-slate-300'
                }`}>
                  {selectedNode.criticality}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Vulnerability Posture:</span>
                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-amber-300 font-mono text-[11px]">
                  {selectedNode.vulnerability || 'No known vulnerabilities'}
                </div>
              </div>
            </div>

            {/* Defense & Direct Action Buttons */}
            {selectedNode.id !== 'ext_attacker' && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                {/* Direct Attack Launch Button */}
                {onDirectAttackNode && (
                  <button
                    onClick={() => {
                      onDirectAttackNode(selectedNode.id, 'AUTO');
                    }}
                    className="w-full py-1.5 px-2 bg-rose-800/80 hover:bg-rose-700 text-rose-100 border border-rose-500/50 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>⚡ Attack This Asset (Auto-Vector)</span>
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => onIsolateNode(selectedNode.id)}
                    disabled={selectedNode.status === 'ISOLATED'}
                    className="flex-1 py-1.5 px-2 bg-sky-900/60 hover:bg-sky-800 text-sky-200 border border-sky-500/40 rounded text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-40 transition"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Quarantine
                  </button>
                  <button
                    onClick={() => onPatchNode(selectedNode.id)}
                    className="flex-1 py-1.5 px-2 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/40 rounded text-xs font-medium flex items-center justify-center gap-1 transition"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    Remediate
                  </button>
                </div>

                <button
                  onClick={() => {
                    onDeleteNode(selectedNode.id);
                    setSelectedNode(null);
                  }}
                  className="w-full py-1 px-2 bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-900 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove Asset from Digital Twin
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
