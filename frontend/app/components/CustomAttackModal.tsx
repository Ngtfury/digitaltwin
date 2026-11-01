'use client';

import React, { useState } from 'react';
import { Zap, X, ShieldAlert, Flame } from 'lucide-react';
import { NetworkNode } from '../types';

interface CustomAttackModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: { data: NetworkNode }[];
  onExecuteAttack: (attackData: any) => void;
  isLoading: boolean;
}

export default function CustomAttackModal({
  isOpen,
  onClose,
  nodes,
  onExecuteAttack,
  isLoading
}: CustomAttackModalProps) {
  const [sourceNode, setSourceNode] = useState(nodes[0]?.data.id || 'ext_attacker');
  const [targetNode, setTargetNode] = useState(nodes[1]?.data.id || '');
  const [attackType, setAttackType] = useState('LATERAL_MOVEMENT');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceNode || !targetNode || sourceNode === targetNode) return;

    onExecuteAttack({
      source_node: sourceNode,
      target_node: targetNode,
      attack_type: attackType
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-rose-400">
          <Flame className="h-5 w-5 animate-pulse" />
          <h3 className="font-bold text-slate-100 text-base">
            Custom Threat Propagation Simulator
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Inject an adversarial attack path between any two nodes. The digital twin computes shortest propagation hops and AI evaluates the telemetry with SHAP explainability.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Attacker / Ingress Node</label>
            <select
              value={sourceNode}
              onChange={(e) => setSourceNode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-rose-500"
            >
              {nodes.map(({ data }) => (
                <option key={data.id} value={data.id}>
                  {data.label} ({data.ip}) - {data.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Target / Victim Asset</label>
            <select
              value={targetNode}
              onChange={(e) => setTargetNode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-rose-500"
            >
              {nodes.map(({ data }) => (
                <option key={data.id} value={data.id}>
                  {data.label} ({data.ip}) - {data.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Adversarial Attack Vector</label>
            <select
              value={attackType}
              onChange={(e) => setAttackType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono outline-none focus:border-rose-500"
            >
              <option value="LATERAL_MOVEMENT">LATERAL MOVEMENT (SMB / WinRM / SSH Pivot)</option>
              <option value="BRUTE_FORCE">BRUTE FORCE (SSH / Kerberos / RDP Credential Spray)</option>
              <option value="RANSOMWARE_BEACON">RANSOMWARE PROPAGATION (Encryption & C2 Beacon)</option>
              <option value="DATA_EXFILTRATION">DATA EXFILTRATION (Outbound Database Dump)</option>
              <option value="DOS_DDOS">DOS / DDOS FLOOD (SYN Flood & Resource Exhaustion)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading || sourceNode === targetNode}
            className="w-full py-2.5 mt-2 rounded-lg bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold text-xs transition shadow-lg shadow-rose-950/60 flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4" />
            <span>Launch Dynamic Threat Simulation</span>
          </button>
        </form>
      </div>
    </div>
  );
}

