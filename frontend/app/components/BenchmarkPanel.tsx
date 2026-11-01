'use client';

import React from 'react';
import { BarChart3, TrendingUp, Zap, Clock, ShieldCheck, DollarSign, Award, BookOpen } from 'lucide-react';

export default function BenchmarkPanel() {
  const benchmarks = [
    {
      metric: 'Incident Triage Time',
      unit: 'minutes',
      siem: 12.0,
      soar: 9.5,
      proposed: 7.8,
      improvement: '35% Faster',
      desc: 'Rapid ML-driven threat scoring and topology path correlation eliminate manual log review delays.'
    },
    {
      metric: 'Compliance Reporting Time',
      unit: 'hours',
      siem: 5.0,
      soar: 4.2,
      proposed: 3.0,
      improvement: '40% Faster',
      desc: 'Automated control mapping & evidence collection reduces 35 manual audit steps.'
    },
    {
      metric: 'Anomaly Detection Precision',
      unit: '%',
      siem: 83.0,
      soar: 87.0,
      proposed: 92.4,
      improvement: '+9.4% Higher',
      desc: 'Dual-model (Isolation Forest + Random Forest) reduces false positive alert fatigue.'
    },
    {
      metric: 'Anomaly Detection Recall',
      unit: '%',
      siem: 78.0,
      soar: 84.0,
      proposed: 89.5,
      improvement: '+11.5% Higher',
      desc: 'Enhanced sensitivity to subtle lateral movements and low-and-slow exfiltration.'
    },
    {
      metric: 'ISO 27001 Control Coverage',
      unit: '%',
      siem: 0.0,
      soar: 12.0,
      proposed: 20.0,
      improvement: 'Continuous Auto-Audit',
      desc: 'Real-time validation of Annex A controls (A.9, A.12.4, A.16.1).'
    },
    {
      metric: 'Hourly Operational Cost',
      unit: '$/hr',
      siem: 100.0,
      soar: 88.0,
      proposed: 78.0,
      improvement: '22% Cost Savings',
      desc: 'Serverless compute elasticity scales down during idle telemetry hours.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              Empirical Evaluation & Baseline Comparison (Table I Validation)
            </h3>
            <p className="text-xs text-slate-400">
              Benchmarking Proposed Cyber Digital Twin against Conventional SIEM and SOAR Workflows
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-cyan-300">
          <BookOpen className="h-4 w-4 text-cyan-400" />
          <span>IEEE ICCST 2025 Architecture</span>
        </div>
      </div>

      {/* Benchmark Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {benchmarks.map((b) => (
          <div key={b.metric} className="bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-slate-200 text-sm">{b.metric}</h4>
                <span className="text-[11px] text-slate-500 font-mono">Unit: {b.unit}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                {b.improvement}
              </span>
            </div>

            {/* Comparison Bars */}
            <div className="space-y-2 pt-1">
              {/* SIEM */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-400">SIEM Workflow</span>
                  <span className="text-slate-300">{b.siem} {b.unit}</span>
                </div>
                <div className="h-2 rounded bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-slate-600 rounded"
                    style={{ width: `${Math.min(100, (b.siem / Math.max(b.siem, b.proposed, b.soar, 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* SOAR */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-400">SOAR Workflow</span>
                  <span className="text-slate-300">{b.soar} {b.unit}</span>
                </div>
                <div className="h-2 rounded bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded"
                    style={{ width: `${Math.min(100, (b.soar / Math.max(b.siem, b.proposed, b.soar, 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Proposed Digital Twin */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-cyan-400 font-bold">Proposed Digital Twin</span>
                  <span className="text-cyan-300 font-bold">{b.proposed} {b.unit}</span>
                </div>
                <div className="h-2.5 rounded bg-slate-900 overflow-hidden shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                  <div
                    className="h-full bg-cyan-400 rounded"
                    style={{ width: `${Math.min(100, (b.proposed / Math.max(b.siem, b.proposed, b.soar, 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
              {b.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Synthesis Summary */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-xl space-y-3">
        <h4 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          Key Research Findings & Statistical Significance (p &lt; 0.01)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">35% Faster Incident Triage</span>
            <span className="text-slate-400">
              Replaces static SIEM alerts with dynamic attack graph propagation and real-time blast-radius calculation.
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">40% Faster Compliance Readiness</span>
            <span className="text-slate-400">
              Eliminates approximately 35 manual evidence-gathering tasks through continuous graph-to-control mapping.
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-purple-400 font-bold block">Auditable AI Explainability</span>
            <span className="text-slate-400">
              Provides mathematical SHAP attribution for each flagged flow, ensuring SOC analysts and compliance auditors can trust model decisions.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

