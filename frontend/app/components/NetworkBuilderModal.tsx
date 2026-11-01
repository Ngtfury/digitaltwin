'use client';

import React, { useState } from 'react';
import { PlusCircle, X, Server, Shield, Database, Radio, Key, Cloud, AlertCircle } from 'lucide-react';

interface NetworkBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (nodeData: any) => void;
}

export default function NetworkBuilderModal({
  isOpen,
  onClose,
  onAddNode
}: NetworkBuilderModalProps) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('SERVER');
  const [ip, setIp] = useState('10.0.5.25');
  const [os, setOs] = useState('Ubuntu 22.04 LTS');
  const [criticality, setCriticality] = useState('HIGH');
  const [vulnerability, setVulnerability] = useState('Unpatched Log4j (CVE-2021-44228)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    onAddNode({
      label: label.trim(),
      type,
      ip: ip.trim(),
      os: os.trim(),
      criticality,
      vulnerability: vulnerability.trim(),
      status: 'NORMAL'
    });
    setLabel('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-cyan-400">
          <PlusCircle className="h-5 w-5" />
          <h3 className="font-bold text-slate-100 text-base">
            Create Custom Enterprise Asset
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Add any custom server, IoT gateway, firewall, or database to your Cyber Digital Twin.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Asset Name / Label</label>
            <input
              type="text"
              placeholder="e.g. Core Payment Processor, Smart Infusion Hub"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Asset Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-cyan-500"
              >
                <option value="SERVER">Server / Application</option>
                <option value="SECURITY_GATEWAY">Firewall / WAF / VPN</option>
                <option value="GATEWAY">API / Cloud Gateway</option>
                <option value="WORKSTATION">Admin Workstation / Laptop</option>
                <option value="MESSAGE_BROKER">Message Broker / Kafka Queue</option>
                <option value="IOT_DEVICE">IoT / Embedded Device</option>
                <option value="DATABASE">Database Cluster</option>
                <option value="IDENTITY">IAM / Active Directory</option>
                <option value="STORAGE">Cloud Storage / SIEM Vault</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Criticality Level</label>
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-cyan-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">IP Address</label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Operating System</label>
              <input
                type="text"
                value={os}
                onChange={(e) => setOs(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Known Vulnerability / Exposure</label>
            <input
              type="text"
              value={vulnerability}
              onChange={(e) => setVulnerability(e.target.value)}
              placeholder="e.g. CVE-2023-44487, Weak SSH Password, SQLi"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-mono outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 mt-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-950/60"
          >
            Deploy Asset into Digital Twin
          </button>
        </form>
      </div>
    </div>
  );
}

