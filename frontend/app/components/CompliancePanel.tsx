'use client';

import React from 'react';
import { 
  FileCheck2, ShieldAlert, Download, CheckCircle2, 
  AlertTriangle, XCircle, Hash, ExternalLink, Shield
} from 'lucide-react';
import { CompliancePosture } from '../types';

interface CompliancePanelProps {
  posture: CompliancePosture | null;
  onExportAuditPackage: () => void;
  isExporting: boolean;
}

export default function CompliancePanel({
  posture,
  onExportAuditPackage,
  isExporting
}: CompliancePanelProps) {
  if (!posture) {
    return (
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-12 text-center text-slate-500 text-sm">
        Loading compliance matrix and regulatory evidence...
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            COMPLIANT
          </span>
        );
      case 'AT_RISK':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            AT RISK
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse">
            <XCircle className="h-3.5 w-3.5 text-rose-400" />
            NON-COMPLIANT
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Scores & Action Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Overall Readiness
            </span>
            <div className="text-3xl font-extrabold font-mono text-slate-100">
              {posture.overall_readiness_score}%
            </div>
          </div>
          <div className="h-2 rounded-full bg-slate-900 overflow-hidden mt-3">
            <div
              className={`h-full ${
                posture.overall_readiness_score >= 80 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${posture.overall_readiness_score}%` }}
            ></div>
          </div>
        </div>

        {/* NIST CSF */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-xl">
          <span className="text-xs font-semibold text-cyan-400 font-mono block mb-1">
            NIST Cybersecurity Framework
          </span>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {posture.framework_scores['NIST CSF'] ?? 100}%
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            DE.AE (Detect), PR.AC (Protect), RS.MI (Respond)
          </span>
        </div>

        {/* ISO 27001 */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-xl">
          <span className="text-xs font-semibold text-cyan-400 font-mono block mb-1">
            ISO/IEC 27001:2022
          </span>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {posture.framework_scores['ISO 27001'] ?? 100}%
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Annex A.9 (Access), A.12 (Logging), A.16 (Incidents)
          </span>
        </div>

        {/* SOC 2 */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-cyan-400 font-mono block mb-1">
              AICPA SOC 2 (Type II)
            </span>
            <div className="text-2xl font-bold font-mono text-slate-100">
              {posture.framework_scores['SOC 2'] ?? 100}%
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Trust Criteria: Security & Availability
            </span>
          </div>

          <button
            onClick={onExportAuditPackage}
            disabled={isExporting}
            className="mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg shadow-cyan-950/60 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? 'Generating...' : 'Export Audit Package'}</span>
          </button>
        </div>
      </div>

      {/* Active Deviations Alert Banner */}
      {posture.deviations?.length > 0 && (
        <div className="bg-rose-950/30 rounded-xl border border-rose-500/40 p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-300 font-semibold text-sm">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <span>Active Compliance Deviations Detected ({posture.deviations.length})</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {posture.deviations.map((dev, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-mono text-rose-400 font-bold mr-2">{dev.control_id} ({dev.framework}):</span>
                  <span className="text-slate-300">{dev.title}</span>
                </div>
                <span className="text-[11px] text-rose-400 font-mono bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                  {dev.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Controls Table */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-cyan-400" />
            <h4 className="font-semibold text-slate-100 text-sm">
              Continuous Regulatory Compliance Controls Matrix
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Automated verification via Cyber Digital Twin
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3">Control ID</th>
                <th className="p-3">Framework</th>
                <th className="p-3">Category / Title</th>
                <th className="p-3">Monitored Assets</th>
                <th className="p-3">Status</th>
                <th className="p-3">Automated Evidence Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {posture.controls.map((ctrl) => (
                <tr key={ctrl.control_id} className="hover:bg-slate-900/50 transition">
                  <td className="p-3 font-mono font-bold text-cyan-300 whitespace-nowrap">
                    {ctrl.control_id}
                  </td>
                  <td className="p-3 font-semibold text-slate-300 whitespace-nowrap">
                    {ctrl.framework}
                  </td>
                  <td className="p-3">
                    <strong className="text-slate-200 block">{ctrl.title}</strong>
                    <span className="text-slate-400 text-[11px]">{ctrl.category}</span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-300">
                    {ctrl.target_nodes.join(', ')}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {getStatusBadge(ctrl.status)}
                  </td>
                  <td className="p-3 text-[11px] text-slate-400 font-mono leading-relaxed max-w-md">
                    {ctrl.evidence_summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

