'use client';

import React from 'react';
import { Shield, ShieldAlert, Cpu, FileCheck2, Activity, BarChart3, User, LogOut, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  complianceScore: number;
  blastRadius: number;
  onRefreshAll: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  complianceScore,
  blastRadius,
  onRefreshAll
}: NavbarProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
    if (score >= 65) return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/30';
  };

  const getRadiusColor = (radius: number) => {
    if (radius === 0) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
    if (radius < 35) return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/30';
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo & Paper Reference */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50">
            <Cpu className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-wide">
                Cyber Digital Twin <span className="text-cyan-400 text-xs font-mono uppercase px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/40">IEEE ICCST Reference</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Security Threat Simulation & Continuous Compliance Optimization
            </p>
          </div>
        </div>

        {/* Live Top KPIs */}
        <div className="hidden lg:flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono ${getScoreColor(complianceScore)}`}>
            <FileCheck2 className="h-4 w-4" />
            <span>Compliance Readiness: <strong>{complianceScore}%</strong></span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono ${getRadiusColor(blastRadius)}`}>
            <ShieldAlert className="h-4 w-4" />
            <span>Attack Blast Radius: <strong>{blastRadius}%</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs font-mono text-cyan-300">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>AI Precision: <strong>92.4%</strong> | Recall: <strong>89.5%</strong></span>
          </div>
        </div>

        {/* User Auth & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshAll}
            title="Refresh System State"
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
              <div className="h-6 w-6 rounded-full bg-cyan-900/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold uppercase">
                {currentUser.username[0]}
              </div>
              <div className="text-left">
                <span className="text-slate-200 font-semibold block">{currentUser.username}</span>
                <span className="text-cyan-400 text-[10px] uppercase font-mono tracking-wider">{currentUser.role.replace('_', ' ')}</span>
              </div>
              <button
                onClick={onLogout}
                title="Log out"
                className="ml-2 text-slate-400 hover:text-rose-400 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md shadow-cyan-900/50 transition"
            >
              <User className="h-4 w-4" />
              <span>Login / RBAC</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80">
        <button
          onClick={() => setActiveTab('twin')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            activeTab === 'twin'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>Digital Twin & Threat Simulation</span>
        </button>

        <button
          onClick={() => setActiveTab('xai')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            activeTab === 'xai'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>AI Threat Detection & SHAP XAI</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            activeTab === 'compliance'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          <span>Compliance Automation & Audit Vault</span>
        </button>

        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            activeTab === 'benchmarks'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>SIEM / SOAR Benchmark Comparison</span>
        </button>
      </nav>
    </header>
  );
}

