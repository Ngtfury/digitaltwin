'use client';

import React from 'react';
import { 
  Play, SkipForward, RotateCcw, ShieldCheck, Lock, Activity, 
  Layers, Terminal, CheckCircle2, AlertOctagon, Flame, Check
} from 'lucide-react';
import { SimulationStepResult } from '../types';

interface SimulationControlsProps {
  scenarios: any[];
  selectedScenario: string;
  onSelectScenario: (scenarioId: string) => void;
  onStepSimulation: () => void;
  onRunFullSimulation: () => void;
  onResetSimulation: () => void;
  onApplyMitigation: (action: string) => void;
  latestStep: SimulationStepResult | null;
  isLoading: boolean;
}

export default function SimulationControls({
  scenarios,
  selectedScenario,
  onSelectScenario,
  onStepSimulation,
  onRunFullSimulation,
  onResetSimulation,
  onApplyMitigation,
  latestStep,
  isLoading
}: SimulationControlsProps) {
  const isCompleted = latestStep?.status === 'COMPLETED';
  const complianceImpact = latestStep?.compliance_impact || [];

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 shadow-xl">
      {/* Top Header & Scenario Selection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              Threat Simulation Orchestrator
            </h3>
            <p className="text-xs text-slate-400">
              Inject adversarial what-if attack chains into the virtual cyber digital twin
            </p>
          </div>
        </div>

        {/* Scenario Select Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Active Scenario:</label>
          <select
            value={selectedScenario}
            onChange={(e) => onSelectScenario(e.target.value)}
            disabled={isLoading}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-cyan-500 w-full sm:w-80"
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Control Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={onStepSimulation}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-cyan-950/60 transition"
        >
          <SkipForward className="h-4 w-4" />
          <span>Step Next</span>
        </button>

        <button
          onClick={onRunFullSimulation}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-rose-950/60 transition"
        >
          <Play className="h-4 w-4" />
          <span>Run Full Attack</span>
        </button>

        <button
          onClick={() => onApplyMitigation('ISOLATE_NODE')}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-sky-900/80 hover:bg-sky-800 border border-sky-500/40 text-sky-200 font-medium text-xs transition"
        >
          <Lock className="h-4 w-4" />
          <span>Quarantine Breached</span>
        </button>

        <button
          onClick={() => onApplyMitigation('PATCH_VULNERABILITY')}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-500/40 text-emerald-200 font-medium text-xs transition"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Patch & Remediate</span>
        </button>

        <button
          onClick={onResetSimulation}
          disabled={isLoading}
          className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-xs transition"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset Baseline</span>
        </button>
      </div>

      {/* Latest Step Details Box */}
      {latestStep ? (
        <div className={`rounded-xl border p-4 space-y-3 ${
          isCompleted 
            ? 'border-emerald-500/40 bg-emerald-950/20' 
            : 'border-rose-500/30 bg-rose-950/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${
                isCompleted 
                  ? 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40' 
                  : 'bg-rose-900/80 text-rose-300 border-rose-500/40'
              }`}>
                {isCompleted ? 'COMPLETED' : `Step ${latestStep.step_number || 1}`}
              </span>
              <h4 className="font-semibold text-slate-100 text-sm">
                {latestStep.title || 'Adversarial Threat Propagation'}
              </h4>
            </div>
            {latestStep.compromised_node && (
              <span className="text-[11px] font-mono text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-950 border border-rose-500/40">
                COMPROMISED: {latestStep.compromised_node}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 font-mono bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <strong>MITRE ATT&CK:</strong> {latestStep.technique || 'Lateral movement and credential exploit.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-1 font-semibold">Attack Path:</span>
              <span className="text-slate-200 font-mono">
                {latestStep.attacker_node || 'Threat Source'} <strong className="text-rose-400">⟶</strong> {latestStep.target_node || 'Target Asset'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-1 font-semibold">Compliance Impact:</span>
              <div className="flex flex-wrap gap-1">
                {complianceImpact.length > 0 ? (
                  complianceImpact.map((ci) => (
                    <span key={ci} className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-mono border border-rose-800/60">
                      {ci}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-[11px] font-mono">
                    NIST CSF DE.AE-1 / ISO 27001 A.12.4
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
          No simulation currently in progress. Click <strong>Step Next</strong> or <strong>Run Full Attack</strong> to simulate adversarial propagation.
        </div>
      )}
    </div>
  );
}
