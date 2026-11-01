'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, Zap, AlertTriangle, ShieldCheck, Cpu, 
  BarChart2, Play, Pause, RefreshCw, Sliders, Info, Sparkles
} from 'lucide-react';
import { AIDetectionResult } from '../types';

interface DetectionPanelProps {
  latestDetection: AIDetectionResult | null;
  onFetchLivePacket: () => void;
}

export default function DetectionPanel({
  latestDetection: propDetection,
  onFetchLivePacket
}: DetectionPanelProps) {
  const [isLiveReplay, setIsLiveReplay] = useState<boolean>(false);
  const [activeDetection, setActiveDetection] = useState<AIDetectionResult | null>(propDetection);

  // Live Playground Sliders State
  const [flowDuration, setFlowDuration] = useState<number>(1.5);
  const [srcBytes, setSrcBytes] = useState<number>(4500);
  const [dstBytes, setDstBytes] = useState<number>(3200);
  const [srcPkts, setSrcPkts] = useState<number>(65);
  const [dstPkts, setDstPkts] = useState<number>(55);
  const [synCount, setSynCount] = useState<number>(8);
  const [ackCount, setAckCount] = useState<number>(12);
  const [failedLogins, setFailedLogins] = useState<number>(0);
  const [dstPort, setDstPort] = useState<number>(443);
  const [byteRate, setByteRate] = useState<number>(5133);
  const [packetRate, setPacketRate] = useState<number>(80);

  // Sync prop updates
  useEffect(() => {
    if (propDetection) {
      setActiveDetection(propDetection);
    }
  }, [propDetection]);

  // Auto-stream packets when live replay is turned on
  useEffect(() => {
    let interval: any = null;
    if (isLiveReplay) {
      interval = setInterval(() => {
        onFetchLivePacket();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveReplay, onFetchLivePacket]);

  // Live evaluation of slider adjustments
  const evaluateCustomFlow = async (overrides: Partial<any> = {}) => {
    const dur = overrides.flowDuration ?? flowDuration;
    const sBytes = overrides.srcBytes ?? srcBytes;
    const dBytes = overrides.dstBytes ?? dstBytes;
    const sPkts = overrides.srcPkts ?? srcPkts;
    const dPkts = overrides.dstPkts ?? dstPkts;
    const syn = overrides.synCount ?? synCount;
    const ack = overrides.ackCount ?? ackCount;
    const fails = overrides.failedLogins ?? failedLogins;
    const port = overrides.dstPort ?? dstPort;
    const bRate = overrides.byteRate ?? Math.round((sBytes + dBytes) / Math.max(dur, 0.01));
    const pRate = overrides.packetRate ?? Math.round((sPkts + dPkts) / Math.max(dur, 0.01));

    try {
      const res = await fetch('http://127.0.0.1:8000/api/detection/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          flow_duration: dur,
          src_bytes: sBytes,
          dst_bytes: dBytes,
          src_pkts: sPkts,
          dst_pkts: dPkts,
          syn_count: syn,
          ack_count: ack,
          failed_logins: fails,
          dst_port: port,
          byte_rate: bRate,
          packet_rate: pRate
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveDetection(data);
      }
    } catch (e) {
      console.error('Error evaluating slider flow:', e);
    }
  };

  const applyPreset = (preset: string) => {
    let vals: any = {};
    if (preset === 'benign') {
      vals = { flowDuration: 2.0, srcBytes: 800, dstBytes: 1500, srcPkts: 12, dstPkts: 18, synCount: 1, ackCount: 4, failedLogins: 0, dstPort: 443, byteRate: 1150, packetRate: 15 };
    } else if (preset === 'ddos') {
      vals = { flowDuration: 0.05, srcBytes: 15000, dstBytes: 100, srcPkts: 500, dstPkts: 2, synCount: 480, ackCount: 0, failedLogins: 0, dstPort: 443, byteRate: 302000, packetRate: 10040 };
    } else if (preset === 'brute') {
      vals = { flowDuration: 6.5, srcBytes: 2500, dstBytes: 1800, srcPkts: 45, dstPkts: 40, synCount: 18, ackCount: 15, failedLogins: 28, dstPort: 22, byteRate: 661, packetRate: 13 };
    } else if (preset === 'smb_lateral') {
      vals = { flowDuration: 1.2, srcBytes: 6800, dstBytes: 4200, srcPkts: 90, dstPkts: 80, synCount: 14, ackCount: 22, failedLogins: 3, dstPort: 445, byteRate: 9166, packetRate: 141 };
    } else if (preset === 'exfiltration') {
      vals = { flowDuration: 20.0, srcBytes: 3200000, dstBytes: 12000, srcPkts: 2100, dstPkts: 280, synCount: 2, ackCount: 16, failedLogins: 0, dstPort: 5432, byteRate: 160600, packetRate: 119 };
    }

    setFlowDuration(vals.flowDuration);
    setSrcBytes(vals.srcBytes);
    setDstBytes(vals.dstBytes);
    setSrcPkts(vals.srcPkts);
    setDstPkts(vals.dstPkts);
    setSynCount(vals.synCount);
    setAckCount(vals.ackCount);
    setFailedLogins(vals.failedLogins);
    setDstPort(vals.dstPort);
    setByteRate(vals.byteRate);
    setPacketRate(vals.packetRate);

    evaluateCustomFlow(vals);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stream Controls */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              AI Threat Detection & SHAP Explainability Engine
            </h3>
            <p className="text-xs text-slate-400">
              Interactive Telemetry Sandbox: Adjust flow metrics to watch the AI and SHAP values respond live!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsLiveReplay(!isLiveReplay)}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium text-xs transition shadow-md ${
              isLiveReplay
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
            }`}
          >
            {isLiveReplay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isLiveReplay ? 'Pause Telemetry Replay' : 'Stream Live Telemetry'}</span>
          </button>

          <button
            onClick={onFetchLivePacket}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sample Flow</span>
          </button>
        </div>
      </div>

      {/* Interactive Telemetry Playground Sliders (NEW!) */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h4 className="font-semibold text-slate-100 text-sm">
              Live Network Telemetry Simulator & Sliders
            </h4>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-mono mr-1">Inject Preset:</span>
            <button
              onClick={() => applyPreset('benign')}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-slate-700 transition text-[11px]"
            >
              Benign HTTPS
            </button>
            <button
              onClick={() => applyPreset('ddos')}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 transition text-[11px]"
            >
              SYN Flood DDoS
            </button>
            <button
              onClick={() => applyPreset('brute')}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-amber-950 text-slate-300 hover:text-amber-300 border border-slate-700 transition text-[11px]"
            >
              SSH Brute Force
            </button>
            <button
              onClick={() => applyPreset('smb_lateral')}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 border border-slate-700 transition text-[11px]"
            >
              SMB Lateral Move
            </button>
            <button
              onClick={() => applyPreset('exfiltration')}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-purple-950 text-slate-300 hover:text-purple-300 border border-slate-700 transition text-[11px]"
            >
              SQL Exfiltration
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-1">
          {/* Destination Port */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Dst Port:</span>
              <span className="text-cyan-400 font-bold">{dstPort}</span>
            </div>
            <select
              value={dstPort}
              onChange={(e) => {
                const p = Number(e.target.value);
                setDstPort(p);
                evaluateCustomFlow({ dstPort: p });
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none"
            >
              <option value={22}>Port 22 (SSH)</option>
              <option value={80}>Port 80 (HTTP)</option>
              <option value={443}>Port 443 (HTTPS)</option>
              <option value={445}>Port 445 (SMB)</option>
              <option value={3389}>Port 3389 (RDP)</option>
              <option value={5432}>Port 5432 (Postgres)</option>
              <option value={8080}>Port 8080 (Alt-HTTP)</option>
            </select>
          </div>

          {/* Failed Logins */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Failed Logins:</span>
              <span className="text-amber-400 font-bold">{failedLogins}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={failedLogins}
              onChange={(e) => {
                const f = Number(e.target.value);
                setFailedLogins(f);
                evaluateCustomFlow({ failedLogins: f });
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* SYN Flags */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">SYN Flags:</span>
              <span className="text-rose-400 font-bold">{synCount}</span>
            </div>
            <input
              type="range"
              min="1"
              max="600"
              value={synCount}
              onChange={(e) => {
                const s = Number(e.target.value);
                setSynCount(s);
                evaluateCustomFlow({ synCount: s });
              }}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Byte Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Byte Rate:</span>
              <span className="text-slate-200 font-bold">{(byteRate / 1000).toFixed(0)}k B/s</span>
            </div>
            <input
              type="range"
              min="100"
              max="350000"
              step="5000"
              value={byteRate}
              onChange={(e) => {
                const b = Number(e.target.value);
                setByteRate(b);
                evaluateCustomFlow({ byteRate: b });
              }}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Packet Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Packet Rate:</span>
              <span className="text-slate-200 font-bold">{packetRate} p/s</span>
            </div>
            <input
              type="range"
              min="5"
              max="9000"
              step="100"
              value={packetRate}
              onChange={(e) => {
                const p = Number(e.target.value);
                setPacketRate(p);
                evaluateCustomFlow({ packetRate: p });
              }}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Flow Duration */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Duration:</span>
              <span className="text-slate-200 font-bold">{flowDuration.toFixed(2)}s</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="25"
              step="0.5"
              value={flowDuration}
              onChange={(e) => {
                const d = Number(e.target.value);
                setFlowDuration(d);
                evaluateCustomFlow({ flowDuration: d });
              }}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Latest Detection & SHAP Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Detection Overview & Probabilities (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Classification Status Card */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Flow Evaluation
              </span>
              {activeDetection?.is_anomaly ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse">
                  ALERT: THREAT DETECTED
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                  BENIGN / VERIFIED
                </span>
              )}
            </div>

            {activeDetection ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Classified Attack Vector:</span>
                    <strong className="text-lg font-bold text-slate-100 font-mono">
                      {activeDetection.predicted_attack.replace('_', ' ')}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Model Confidence:</span>
                    <strong className="text-lg font-bold text-cyan-400 font-mono">
                      {(activeDetection.confidence * 100).toFixed(1)}%
                    </strong>
                  </div>
                </div>

                {/* Isolation Forest Anomaly Score Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Isolation Forest Anomaly Score:</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {activeDetection.anomaly_score.toFixed(3)} / 1.000
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        activeDetection.anomaly_score > 0.5 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, activeDetection.anomaly_score * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {activeDetection.is_zero_day_outlier
                      ? '⚠️ High anomaly score indicates structural deviation from normal baseline.'
                      : '✓ Normal spatial density cluster.'}
                  </span>
                </div>

                {/* Class Probabilities Breakdown */}
                {activeDetection.class_probabilities && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 block">
                      Ensemble Multi-Class Probability Distribution
                    </span>
                    <div className="space-y-1.5">
                      {Object.entries(activeDetection.class_probabilities).map(([cls, prob]) => (
                        <div key={cls} className="space-y-1 text-xs">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-slate-300">{cls}</span>
                            <span className="text-slate-400">{(prob * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                            <div
                              className={`h-full ${
                                cls === activeDetection.predicted_attack ? 'bg-cyan-400' : 'bg-slate-700'
                              }`}
                              style={{ width: `${Math.min(100, prob * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Awaiting network flow ingestion. Click <strong>Sample Flow</strong> or move a slider above.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: SHAP Feature Attribution Waterfall (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-cyan-400" />
              <h4 className="font-semibold text-slate-100 text-sm">
                Explainable AI: SHAP Feature Attribution
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              TreeExplainer (Shapley Values)
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <Info className="h-4 w-4 text-cyan-400 inline mr-1.5 -mt-0.5" />
            <strong>Why was this flagged?</strong> The chart below isolates how each network telemetry feature pushed the model’s prediction toward threat vs benign baseline.
          </div>

          {activeDetection && activeDetection.shap_attributions?.length > 0 ? (
            <div className="space-y-3 pt-2">
              {activeDetection.shap_attributions.map((attr, idx) => {
                const isRisk = attr.direction === 'RISK_INCREASE';
                const barWidth = Math.min(100, Math.abs(attr.impact) * 200);

                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${isRisk ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                        <span className="font-mono font-semibold text-slate-200">{attr.feature}</span>
                        <span className="text-[11px] text-slate-400 font-mono">(value = {attr.value})</span>
                      </div>
                      <span className={`font-mono text-xs font-bold ${isRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {attr.impact > 0 ? `+${attr.impact.toFixed(4)}` : attr.impact.toFixed(4)}
                      </span>
                    </div>

                    {/* Attribution Impact Bar */}
                    <div className="h-2 rounded-full bg-slate-950 overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isRisk ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(8, barWidth)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-500">
              {activeDetection?.predicted_attack === 'BENIGN'
                ? 'Traffic matches standard operational baseline. No anomaly attribution required.'
                : 'Run a simulation step, move a slider, or sample an anomalous packet to compute live SHAP attributions.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
