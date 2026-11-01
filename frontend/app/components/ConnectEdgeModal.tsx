'use client';

import React, { useState } from 'react';
import { Link2, X } from 'lucide-react';
import { NetworkNode } from '../types';

interface ConnectEdgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: { data: NetworkNode }[];
  onAddEdge: (edgeData: any) => void;
}

export default function ConnectEdgeModal({
  isOpen,
  onClose,
  nodes,
  onAddEdge
}: ConnectEdgeModalProps) {
  const [source, setSource] = useState(nodes[0]?.data.id || '');
  const [target, setTarget] = useState(nodes[1]?.data.id || '');
  const [protocol, setProtocol] = useState('HTTPS');
  const [port, setPort] = useState(443);

  if (!isOpen) return null;

  const handleProtocolChange = (prot: string) => {
    setProtocol(prot);
    switch (prot) {
      case 'HTTPS': setPort(443); break;
      case 'SSH': setPort(22); break;
      case 'SMB': setPort(445); break;
      case 'PostgreSQL': setPort(5432); break;
      case 'MQTT': setPort(1883); break;
      case 'gRPC': setPort(50051); break;
      case 'RDP': setPort(3389); break;
      default: setPort(8080); break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !target || source === target) return;

    onAddEdge({
      source,
      target,
      protocol: `${protocol}/${port}`,
      port
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

        <div className="flex items-center gap-2 text-cyan-400">
          <Link2 className="h-5 w-5" />
          <h3 className="font-bold text-slate-100 text-base">
            Connect Network Route / Trust Edge
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Establish communication paths or authentication channels between digital twin assets.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Source Node</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-cyan-500"
            >
              {nodes.map(({ data }) => (
                <option key={data.id} value={data.id}>
                  {data.label} ({data.ip})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Target Node</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-cyan-500"
            >
              {nodes.map(({ data }) => (
                <option key={data.id} value={data.id}>
                  {data.label} ({data.ip})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Protocol</label>
              <select
                value={protocol}
                onChange={(e) => handleProtocolChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none focus:border-cyan-500"
              >
                <option value="HTTPS">HTTPS</option>
                <option value="SSH">SSH</option>
                <option value="SMB">SMB (Windows File Share)</option>
                <option value="PostgreSQL">PostgreSQL / SQL</option>
                <option value="MQTT">MQTT (IoT Sensor Protocol)</option>
                <option value="gRPC">gRPC / Microservices</option>
                <option value="RDP">RDP (Remote Desktop)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Port</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={source === target}
            className="w-full py-2.5 mt-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs transition shadow-lg shadow-cyan-950/60"
          >
            Create Network Connection
          </button>
        </form>
      </div>
    </div>
  );
}

