'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, ShieldAlert, ShieldCheck, Play, RotateCcw, Lock, Unlock,
  CheckCircle2, AlertTriangle, ArrowRight, User, Terminal, Server, Database, Cloud, Radio, Activity,
  PlusCircle, Link2, Trash2, Eye, Move, Zap, AlertOctagon, Key, Sparkles, Compass, Route, Target, Flame,
  Laptop, Globe, HardDrive, Layers
} from 'lucide-react';
import NetworkBuilderModal from './components/NetworkBuilderModal';
import ConnectEdgeModal from './components/ConnectEdgeModal';

interface SimpleNode {
  id: string;
  label: string;
  type: string;
  ip: string;
  os: string;
  vulnerability: string;
  status: 'NORMAL' | 'VULNERABLE' | 'COMPROMISED' | 'ISOLATED' | 'ATTACKING';
  x: number;
  y: number;
}

interface SimpleEdge {
  id: string;
  source: string;
  target: string;
  protocol: string;
  active: boolean;
}

const INITIAL_NODES: SimpleNode[] = [
  // Tier 0: External Threat Actor (Kali Linux / C2)
  { id: 'ext_attacker', label: 'External Cyber Threat', type: 'EXTERNAL', ip: '198.51.100.24', os: 'Kali Linux / C2 Server', vulnerability: 'None (Threat Source)', status: 'ATTACKING', x: 550, y: 45 },

  // Tier 1: Perimeter Defense & Edge Gateways
  { id: 'fw_perimeter', label: 'Perimeter Next-Gen Firewall', type: 'SECURITY_GATEWAY', ip: '10.0.0.1', os: 'Palo Alto PanOS 11', vulnerability: 'None (Hardened Gateway)', status: 'NORMAL', x: 270, y: 145 },
  { id: 'cloud_gateway', label: 'Public API Gateway', type: 'GATEWAY', ip: '10.0.1.10', os: 'Kong / Envoy API Gateway', vulnerability: 'Rate Limit & BOLA Bypass', status: 'NORMAL', x: 550, y: 145 },
  { id: 'vpn_gateway', label: 'Corporate SSL-VPN Portal', type: 'SECURITY_GATEWAY', ip: '10.0.0.50', os: 'Fortinet FortiOS 7.4', vulnerability: 'CVE-2024-21762 (Pre-Auth RCE)', status: 'NORMAL', x: 830, y: 145 },

  // Tier 2: Public DMZ Services, Identity Provider & Office Workstations
  { id: 'dmz_web', label: 'Public Web App (Customer Portal)', type: 'SERVER', ip: '10.0.1.25', os: 'Ubuntu 22.04 LTS (Node.js)', vulnerability: 'CVE-2023-44487 (HTTP/2 Rapid Reset)', status: 'NORMAL', x: 360, y: 270 },
  { id: 'auth_server', label: 'Active Directory / IAM Broker', type: 'IDENTITY', ip: '10.0.1.50', os: 'Windows Server 2022 / Keycloak', vulnerability: 'Kerberoasting Service Accounts', status: 'NORMAL', x: 600, y: 270 },
  { id: 'corp_workstation', label: 'Admin Workstation (IT Staff)', type: 'WORKSTATION', ip: '10.0.4.12', os: 'Windows 11 Enterprise', vulnerability: 'Phishing Payload / Stolen SSH Key', status: 'NORMAL', x: 880, y: 270 },

  // Tier 3: Core Application Microservices, In-Memory Caches & IoT Hub
  { id: 'cache_redis', label: 'Redis Session Cache Cluster', type: 'DATABASE', ip: '10.0.2.15', os: 'Alpine Linux / Redis 7', vulnerability: 'Unauthenticated Cache Port 6379', status: 'NORMAL', x: 170, y: 395 },
  { id: 'internal_app', label: 'Core Microservices Backend', type: 'SERVER', ip: '10.0.2.50', os: 'Red Hat Enterprise 9.2', vulnerability: 'Hardcoded Service Token (gRPC)', status: 'NORMAL', x: 430, y: 395 },
  { id: 'msg_queue', label: 'Apache Kafka Event Bus', type: 'MESSAGE_BROKER', ip: '10.0.2.75', os: 'Debian 12 / Kafka 3.6', vulnerability: 'Permissive Topic ACL Access', status: 'NORMAL', x: 680, y: 395 },
  { id: 'iot_controller', label: 'Smart Building & OT Gateway', type: 'IOT_DEVICE', ip: '10.0.3.15', os: 'Embedded RTOS Linux', vulnerability: 'Default Firmware Password', status: 'NORMAL', x: 930, y: 395 },

  // Tier 4: Enterprise Databases, Audit SIEM, Cloud Backups & CCTV Sensors
  { id: 'siem_soc', label: 'SOC SIEM Audit Vault', type: 'STORAGE', ip: '10.0.5.10', os: 'Splunk Enterprise / Elastic', vulnerability: 'None (Immutable Log Storage)', status: 'NORMAL', x: 120, y: 530 },
  { id: 'db_core', label: 'Customer Financial Database', type: 'DATABASE', ip: '10.0.2.100', os: 'PostgreSQL 16 Enterprise', vulnerability: 'Unencrypted Internal Port 5432', status: 'NORMAL', x: 380, y: 530 },
  { id: 'cloud_s3', label: 'Cloud Backup Vault (S3)', type: 'STORAGE', ip: '10.0.4.5', os: 'AWS S3 Encrypted Bucket', vulnerability: 'Overly Permissive IAM Policy', status: 'NORMAL', x: 630, y: 530 },
  { id: 'iot_sensors', label: 'CCTV & Facility Sensors', type: 'IOT_DEVICE', ip: '10.0.3.100', os: 'Embedded Microcontroller', vulnerability: 'Cleartext RTSP Video Stream', status: 'NORMAL', x: 930, y: 530 }
];

const INITIAL_EDGES: SimpleEdge[] = [
  // 1. External Ingress Links
  { id: 'e1', source: 'ext_attacker', target: 'fw_perimeter', protocol: 'HTTPS/443', active: false },
  { id: 'e2', source: 'ext_attacker', target: 'vpn_gateway', protocol: 'SSL-VPN/10443', active: false },

  // 2. Perimeter to DMZ & Defense Logging
  { id: 'e3', source: 'fw_perimeter', target: 'cloud_gateway', protocol: 'HTTPS/443', active: false },
  { id: 'e4', source: 'fw_perimeter', target: 'siem_soc', protocol: 'Syslog/514', active: false },

  // 3. Gateway to DMZ Applications & Identity
  { id: 'e5', source: 'cloud_gateway', target: 'dmz_web', protocol: 'REST/8080', active: false },
  { id: 'e6', source: 'cloud_gateway', target: 'auth_server', protocol: 'OAuth2/8443', active: false },

  // 4. VPN Gateway to Internal Office Workstations
  { id: 'e7', source: 'vpn_gateway', target: 'corp_workstation', protocol: 'RDP/3389', active: false },

  // 5. DMZ Web Application Outbound Links
  { id: 'e8', source: 'dmz_web', target: 'cache_redis', protocol: 'TCP/6379', active: false },
  { id: 'e9', source: 'dmz_web', target: 'internal_app', protocol: 'gRPC/50051', active: false },

  // 6. Identity Server Outbound Credentials & Tokens
  { id: 'e10', source: 'auth_server', target: 'internal_app', protocol: 'JWT/443', active: false },
  { id: 'e11', source: 'auth_server', target: 'db_core', protocol: 'Kerberos/88', active: false },

  // 7. Workstation Lateral Pivots (IT Admin compromised machine)
  { id: 'e12', source: 'corp_workstation', target: 'internal_app', protocol: 'SSH/22', active: false },
  { id: 'e13', source: 'corp_workstation', target: 'iot_controller', protocol: 'MQTT/8883', active: false },

  // 8. Internal Application Backend to Databases, Messaging & Logging
  { id: 'e14', source: 'internal_app', target: 'db_core', protocol: 'SQL/5432', active: false },
  { id: 'e15', source: 'internal_app', target: 'msg_queue', protocol: 'Kafka/9092', active: false },
  { id: 'e16', source: 'internal_app', target: 'siem_soc', protocol: 'Audit/9200', active: false },

  // 9. Event Bus to Smart Building Gateway
  { id: 'e17', source: 'msg_queue', target: 'iot_controller', protocol: 'AMQP/5672', active: false },

  // 10. Database Replication & Backup Storage
  { id: 'e18', source: 'db_core', target: 'cloud_s3', protocol: 'S3-API/443', active: false },

  // 11. IoT Controller to Physical Sensors
  { id: 'e19', source: 'iot_controller', target: 'iot_sensors', protocol: 'RTSP/554', active: false }
];

export default function InteractivePrototypeDashboard() {
  const [nodes, setNodes] = useState<SimpleNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<SimpleEdge[]>(INITIAL_EDGES);
  const [attackStep, setAttackStep] = useState<number>(0);
  const [lastEventText, setLastEventText] = useState<string>('Network baseline active. Arrows show one-way network traffic flow (e.g. Web Server -> Database).');
  
  // Modals & Selected Node
  const [isAddNodeOpen, setIsAddNodeOpen] = useState<boolean>(false);
  const [isConnectEdgeOpen, setIsConnectEdgeOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<SimpleNode | null>(null);

  // Dragging State
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Drag Handlers
  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingId(id);
    const clicked = nodes.find(n => n.id === id);
    if (clicked) setSelectedNode(clicked);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(35, Math.min(1065, e.clientX - rect.left));
    const y = Math.max(35, Math.min(620, e.clientY - rect.top));

    setNodes(prev => prev.map(n => n.id === draggingId ? { ...n, x, y } : n));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  // Add Asset Handler
  const handleAddAsset = (nodeData: any) => {
    const newId = `asset_${Date.now()}`;
    const newNode: SimpleNode = {
      id: newId,
      label: nodeData.label || 'New Server',
      type: nodeData.type || 'SERVER',
      ip: nodeData.ip || '10.0.5.50',
      os: nodeData.os || 'Ubuntu 24.04',
      vulnerability: nodeData.vulnerability || 'Unpatched Service',
      status: 'NORMAL',
      x: 520 + (nodes.length % 4) * 60,
      y: 350 + (nodes.length % 3) * 45
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode);
    setLastEventText(`Added asset '${newNode.label}'. Connect an arrow to/from it using '+ Connect Link'!`);
  };

  // Connect Link Handler (STRICTLY ONE-WAY DIRECTED ARROW)
  const handleAddEdge = (edgeData: any) => {
    const newEdge: SimpleEdge = {
      id: `edge_${Date.now()}`,
      source: edgeData.source,
      target: edgeData.target,
      protocol: edgeData.protocol || 'TCP/8080',
      active: false
    };
    setEdges(prev => [...prev, newEdge]);
    
    const srcNode = nodes.find(n => n.id === edgeData.source)?.label || edgeData.source;
    const dstNode = nodes.find(n => n.id === edgeData.target)?.label || edgeData.target;
    setLastEventText(`Established ONE-WAY route: [${srcNode}] ──(${edgeData.protocol})──▶ [${dstNode}]. If ${srcNode} is breached, ${dstNode} becomes exposed (not vice versa)!`);
  };

  // Remove Node Handler
  const handleDeleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    if (selectedNode?.id === id) setSelectedNode(null);
  };

  // =========================================================================
  // ALGORITHM: DIRECTED ATTACK GRAPH TRAVERSAL (STRICT ONE-WAY ARROWS)
  // An attack can ONLY flow from e.source -> e.target (never backwards).
  // A breached server exposes the database, but a database cannot breach a web server!
  // =========================================================================
  const handleNextAttackStep = () => {
    const nextStep = attackStep + 1;
    setAttackStep(nextStep);

    let newCompromisedIds: string[] = [];
    let newVulnerableIds: string[] = [];

    setNodes((currentNodes) => {
      let updatedNodes = [...currentNodes];

      if (nextStep === 1) {
        // Step 1: Ingress attack on perimeter targets connected to External Attacker
        const ingressTargets = edges.filter(e => e.source === 'ext_attacker').map(e => e.target);
        const fallbackTarget = ingressTargets.length > 0 ? ingressTargets : ['fw_perimeter'];

        updatedNodes = updatedNodes.map(n => fallbackTarget.includes(n.id) ? { ...n, status: 'COMPROMISED' } : n);
        newCompromisedIds.push(...fallbackTarget);
      } else {
        // Any node that was previously VULNERABLE now gets fully BREACHED!
        updatedNodes = updatedNodes.map(n => {
          if (n.status === 'VULNERABLE') {
            newCompromisedIds.push(n.id);
            return { ...n, status: 'COMPROMISED' };
          }
          return n;
        });
      }

      // Collect all currently compromised nodes
      const allCompromised = updatedNodes.filter(n => n.status === 'COMPROMISED').map(n => n.id);

      // DIRECTED NEIGHBOR DISCOVERY (STRICT ONE-WAY):
      // Only targets of outgoing edges from compromised nodes become vulnerable:
      // IF (e.source is compromised) -> e.target becomes VULNERABLE!
      // (Does NOT work in reverse: an edge targeting a compromised node cannot be traversed backwards)
      edges.forEach((e) => {
        if (allCompromised.includes(e.source) && e.target !== 'ext_attacker') {
          const targetNode = updatedNodes.find(n => n.id === e.target);
          if (targetNode && targetNode.status === 'NORMAL') {
            newVulnerableIds.push(e.target);
          }
        }
      });

      // Mark targets as VULNERABLE (Yellow)
      updatedNodes = updatedNodes.map(n => {
        if (newVulnerableIds.includes(n.id) && n.status === 'NORMAL') {
          return { ...n, status: 'VULNERABLE' };
        }
        return n;
      });

      // Update descriptive text
      const compNames = updatedNodes.filter(n => n.status === 'COMPROMISED').map(n => n.label).join(', ');
      const vulnNames = updatedNodes.filter(n => n.status === 'VULNERABLE').map(n => n.label).join(', ');
      
      if (vulnNames.length > 0) {
        setLastEventText(`Breached: [${compNames}]. Outgoing connection arrows expose: [${vulnNames}] (Yellow)!`);
      } else {
        setLastEventText(`Breached: [${compNames}]. No outgoing connection arrows left to infect.`);
      }

      return updatedNodes;
    });

    // Update active edge pulses strictly in the direction of the attack
    setEdges((currentEdges) => {
      return currentEdges.map((e) => {
        const srcIsComp = nodes.some(n => n.id === e.source && (n.status === 'COMPROMISED' || n.id === 'ext_attacker'));
        const dstIsExposed = nodes.some(n => n.id === e.target && ['COMPROMISED', 'VULNERABLE'].includes(n.status));
        if (srcIsComp && dstIsExposed) {
          return { ...e, active: true };
        }
        return e;
      });
    });
  };

  // =========================================================================
  // ALGORITHM 1: INBOUND DIRECTED PATHFINDING & EXPLOIT PROBABILITY (NetworkX / BFS)
  // Finds all real one-way directed paths from Hacker to ANY asset
  // Calculates cumulative joint probability: P(Path) = Product(P_hop)
  // =========================================================================
  const getAllAttackPathsForNode = (targetId: string) => {
    if (targetId === 'ext_attacker') {
      return [{ path: ['ext_attacker'], probability: 100, reachable: true }];
    }

    const allPaths: { path: string[]; probability: number; reachable: boolean }[] = [];

    const dfs = (currentId: string, currentPath: string[], visited: Set<string>) => {
      if (currentId === targetId) {
        let prob = 0.98;
        for (let i = 1; i < currentPath.length; i++) {
          const n = nodes.find(item => item.id === currentPath[i]);
          if (n?.vulnerability.includes('None') || n?.vulnerability.includes('Hardened')) {
            prob *= 0.85; // Hardened perimeter / firewall
          } else {
            prob *= 0.96; // Known vulnerability
          }
        }
        allPaths.push({
          path: [...currentPath],
          probability: Math.round(prob * 100),
          reachable: true
        });
        return;
      }

      if (currentPath.length >= 10) return; // Prevent infinite loops or excessive depth

      // STRICTLY OUTGOING EDGES ONLY
      const outgoing = edges.filter(e => e.source === currentId);
      for (const edge of outgoing) {
        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          dfs(edge.target, [...currentPath, edge.target], visited);
          visited.delete(edge.target);
        }
      }
    };

    dfs('ext_attacker', ['ext_attacker'], new Set(['ext_attacker']));

    // Sort by highest probability first
    allPaths.sort((a, b) => b.probability - a.probability);
    return allPaths;
  };

  const getAttackPathForNode = (targetId: string) => {
    const all = getAllAttackPathsForNode(targetId);
    if (all.length === 0) {
      return { path: [], probability: 0, reachable: false, allPaths: [] };
    }
    return {
      path: all[0].path,
      probability: all[0].probability,
      reachable: true,
      allPaths: all
    };
  };

  // =========================================================================
  // ALGORITHM 2: LATERAL MOVEMENT & BLAST RADIUS (Downstream Reachability)
  // If THIS asset is breached, which other assets can it compromise?
  // Crucial Rule: Attacking a Database NEVER gives access to Web Server
  // because there is no outgoing edge from Database to Web Server!
  // =========================================================================
  const getDownstreamBlastRadius = (nodeId: string) => {
    if (nodeId === 'ext_attacker') return { directTargets: [], allReachable: [], count: 0 };

    const directTargets = edges.filter(e => e.source === nodeId).map(e => e.target);
    const reachableNodes = new Set<string>();

    const dfs = (curr: string) => {
      const outgoing = edges.filter(e => e.source === curr);
      for (const e of outgoing) {
        if (!reachableNodes.has(e.target) && e.target !== nodeId) {
          reachableNodes.add(e.target);
          dfs(e.target);
        }
      }
    };
    dfs(nodeId);

    const directLabels = directTargets.map(id => nodes.find(n => n.id === id)?.label || id);
    const allLabels = Array.from(reachableNodes).map(id => nodes.find(n => n.id === id)?.label || id);

    return {
      directTargets: directLabels,
      allReachable: allLabels,
      count: reachableNodes.size
    };
  };

  // =========================================================================
  // INTERACTIVE FEATURE: SIMULATE INITIAL BREACH ON SELECTED ASSET (Patient Zero)
  // User can click ANY asset (e.g. Database or Web Server) and immediately see:
  // - If it's Database: NO upstream systems are affected!
  // - If it's Web Server: Downstream databases/storage turn vulnerable!
  // =========================================================================
  const handleSimulateInitialBreachOnNode = (nodeId: string) => {
    const targetNode = nodes.find(n => n.id === nodeId);
    if (!targetNode || nodeId === 'ext_attacker') return;

    // Direct downstream targets along outgoing links
    const directTargetIds = edges.filter(e => e.source === nodeId).map(e => e.target);

    // Update nodes: clicked node is COMPROMISED (Red), downstream targets become VULNERABLE (Yellow)
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        return { ...n, status: 'COMPROMISED' };
      }
      if (directTargetIds.includes(n.id)) {
        return { ...n, status: 'VULNERABLE' };
      }
      return { ...n, status: 'NORMAL' };
    }));

    // Activate only the outgoing edges originating from this breached node
    setEdges(prev => prev.map(e => ({
      ...e,
      active: e.source === nodeId && directTargetIds.includes(e.target)
    })));

    setAttackStep(88); // Custom asset compromise state

    if (directTargetIds.length === 0) {
      setLastEventText(`🔒 ZERO Lateral Access: '${targetNode.label}' is breached, but it has NO outbound links. Reverse movement is blocked! Upstream servers (Web/API) remain 100% SAFE (Green)!`);
    } else {
      const targetNames = directTargetIds.map(id => nodes.find(n => n.id === id)?.label || id).join(', ');
      setLastEventText(`⚠️ Lateral Movement Triggered: '${targetNode.label}' breached! Outgoing links expose: [${targetNames}] (Yellow). Upstream assets remain unaffected!`);
    }
  };

  // Execute Targeted Attack directly on selected asset's path
  const handleTargetedAttackOnPath = (targetId: string) => {
    const { path, reachable } = getAttackPathForNode(targetId);
    if (!reachable || path.length < 2) return;

    setAttackStep(90); // Custom path active
    setNodes(prev => prev.map(n => {
      if (path.includes(n.id)) {
        if (n.id === targetId) return { ...n, status: 'COMPROMISED' };
        if (n.id === 'ext_attacker') return { ...n, status: 'ATTACKING' };
        return { ...n, status: 'COMPROMISED' };
      }
      return { ...n, status: 'NORMAL' };
    }));

    // Activate edges along path
    setEdges(prev => prev.map(e => {
      for (let i = 0; i < path.length - 1; i++) {
        if (e.source === path[i] && e.target === path[i+1]) {
          return { ...e, active: true };
        }
      }
      return { ...e, active: false };
    }));

    const pathNames = path.map(id => nodes.find(n => n.id === id)?.label || id).join(' ➔ ');
    setLastEventText(`Targeted Exploit Executed! Path: ${pathNames}. Target '${nodes.find(n => n.id === targetId)?.label}' is now COMPROMISED.`);
  };

  // Quarantine Handler
  const handleQuarantine = () => {
    setAttackStep(99);
    setNodes(prev => prev.map(n => {
      if (n.status === 'COMPROMISED') {
        return { ...n, status: 'ISOLATED' };
      }
      if (n.status === 'VULNERABLE') {
        return { ...n, status: 'NORMAL' };
      }
      return n;
    }));
    setEdges(prev => prev.map(e => ({ ...e, active: false })));
    setLastEventText("Defense Action: Breached assets quarantined (Isolated in Blue). Connections severed! Remaining network protected.");
  };

  // Reset Network
  const handleReset = () => {
    setAttackStep(0);
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    setSelectedNode(null);
    setLastEventText('Network restored to pristine normal baseline. Everything is safe (Green).');
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'EXTERNAL': return AlertOctagon;
      case 'SECURITY_GATEWAY': return Shield;
      case 'GATEWAY': return Globe;
      case 'SERVER': return Server;
      case 'WORKSTATION': return Laptop;
      case 'IDENTITY': return Key;
      case 'IOT_DEVICE': return Radio;
      case 'DATABASE': return Database;
      case 'STORAGE': return HardDrive;
      case 'MESSAGE_BROKER': return Layers;
      default: return Server;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPROMISED':
        return {
          bg: 'bg-rose-950',
          border: '#f43f5e',
          text: 'text-rose-400',
          badge: 'bg-rose-900 text-rose-200 border-rose-500'
        };
      case 'VULNERABLE':
        return {
          bg: 'bg-amber-950',
          border: '#f59e0b',
          text: 'text-amber-400',
          badge: 'bg-amber-900 text-amber-200 border-amber-500'
        };
      case 'ISOLATED':
        return {
          bg: 'bg-sky-950',
          border: '#0ea5e9',
          text: 'text-sky-400',
          badge: 'bg-sky-900 text-sky-200 border-sky-500'
        };
      case 'ATTACKING':
        return {
          bg: 'bg-purple-950',
          border: '#a855f7',
          text: 'text-purple-400',
          badge: 'bg-purple-900 text-purple-200 border-purple-500'
        };
      default:
        return {
          bg: 'bg-slate-900',
          border: '#10b981',
          text: 'text-emerald-400',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
        };
    }
  };

  // Health calculation (scaled to 15 assets)
  const compromisedCount = nodes.filter(n => n.status === 'COMPROMISED').length;
  const vulnerableCount = nodes.filter(n => n.status === 'VULNERABLE').length;
  const healthPercent = Math.max(0, Math.round(100 - (compromisedCount * 10) - (vulnerableCount * 4)));

  // Current selected node path analysis & blast radius
  const selectedNodeAnalysis = selectedNode ? getAttackPathForNode(selectedNode.id) : null;
  const selectedNodeBlast = selectedNode ? getDownstreamBlastRadius(selectedNode.id) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100 tracking-wide">
              Cyber Digital Twin <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono ml-1">Directed Attack Graph Engine</span>
            </h1>
            <p className="text-xs text-slate-400">
              One-Way Path Traversal (Web ➔ DB, not reverse) &bull; Exploit Probability &bull; AI Scoring
            </p>
          </div>
        </div>

        {/* Action Buttons & Health */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddNodeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-semibold text-xs transition shadow"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>+ Add New Asset</span>
          </button>

          <button
            onClick={() => setIsConnectEdgeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition shadow"
          >
            <Link2 className="h-3.5 w-3.5" />
            <span>+ Connect Link</span>
          </button>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold ${
            healthPercent >= 80 ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400' : 'bg-rose-950/60 border-rose-500 text-rose-400 animate-pulse'
          }`}>
            <Activity className="h-4 w-4" />
            <span>Health: {healthPercent}% ({attackStep === 0 ? 'Safe' : attackStep === 99 ? 'Protected' : 'Breached!'})</span>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-4">
        
        {/* Real-Time Chain Reaction Status Callout */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Algorithm Rule:</strong> {lastEventText}
            </span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 shrink-0 ml-3">
            {nodes.length} Assets &bull; {edges.length} Directed Routes
          </span>
        </div>

        {/* 3. The Interactive Draggable Digital Twin Canvas */}
        <div className="relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
          {/* Canvas Top Bar */}
          <div className="px-5 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <Move className="h-3.5 w-3.5 text-cyan-400" />
              Interactive Canvas (Drag any node &bull; Click any node to calculate its attack probability!)
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Normal</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span> Exposed (Vulnerable)</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Breached</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span> Quarantined</span>
            </div>
          </div>

          {/* SVG Canvas Area with Real-Time Node Dragging */}
          <div 
            className="relative w-full h-[650px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] overflow-auto select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <svg ref={svgRef} className="w-[1100px] h-[650px] mx-auto block">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                </marker>
                <marker id="arrow-red" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
                </marker>
              </defs>

              {/* Render Connecting Edges */}
              {edges.map((e) => {
                const src = nodes.find(n => n.id === e.source);
                const dst = nodes.find(n => n.id === e.target);
                if (!src || !dst) return null;

                const midX = (src.x + dst.x) / 2;
                const midY = (src.y + dst.y) / 2;

                return (
                  <g key={e.id}>
                    <line
                      x1={src.x}
                      y1={src.y}
                      x2={dst.x}
                      y2={dst.y}
                      stroke={e.active ? '#f43f5e' : '#334155'}
                      strokeWidth={e.active ? 3 : 1.5}
                      strokeDasharray={e.active ? '6 4' : 'none'}
                      markerEnd={e.active ? 'url(#arrow-red)' : 'url(#arrow)'}
                      className={e.active ? 'animate-pulse' : ''}
                    />
                    <rect x={midX - 30} y={midY - 8} width="60" height="15" rx="3" fill="#090d16" stroke={e.active ? '#f43f5e' : '#1e293b'} strokeWidth="0.8" />
                    <text x={midX} y={midY + 3} textAnchor="middle" fill={e.active ? '#fda4af' : '#64748b'} fontSize="8" fontFamily="monospace">
                      {e.protocol}
                    </text>
                  </g>
                );
              })}

              {/* Render Draggable Nodes */}
              {nodes.map((n) => {
                const Icon = getNodeIcon(n.type);
                const style = getStatusColor(n.status);
                const isSelected = selectedNode?.id === n.id;

                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x}, ${n.y})`}
                    onMouseDown={(e) => handleMouseDown(n.id, e)}
                    className="cursor-grab active:cursor-grabbing group"
                  >
                    {/* Outer Glow / Halo */}
                    <circle
                      r={isSelected ? 32 : 26}
                      fill="transparent"
                      stroke={isSelected ? '#38bdf8' : (n.status === 'VULNERABLE' ? '#f59e0b' : 'transparent')}
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      className={n.status === 'COMPROMISED' ? 'animate-spin' : n.status === 'VULNERABLE' ? 'animate-pulse' : ''}
                    />

                    {/* Node Body */}
                    <circle
                      r="22"
                      className={`${style.bg} transition-all duration-200`}
                      stroke={style.border}
                      strokeWidth={n.status === 'COMPROMISED' ? 3 : n.status === 'VULNERABLE' ? 2.5 : 1.5}
                    />

                    {/* Node Icon */}
                    <foreignObject x="-11" y="-11" width="22" height="22">
                      <div className="flex items-center justify-center h-full w-full pointer-events-none">
                        <Icon className={`h-4 w-4 ${style.text}`} />
                      </div>
                    </foreignObject>

                    {/* Node Label */}
                    <text x="0" y="34" textAnchor="middle" className="fill-slate-200 text-[9.5px] font-semibold drop-shadow pointer-events-none">
                      {n.label}
                    </text>
                    <text x="0" y="44" textAnchor="middle" className="fill-slate-400 text-[8px] font-mono pointer-events-none">
                      {n.ip}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Selected Node Inspector Drawer with Path Probability Engine */}
            {selectedNode && (
              <div className="absolute top-4 right-4 w-[360px] max-h-[610px] overflow-y-auto bg-slate-900/95 border border-slate-700 rounded-xl p-4 shadow-2xl backdrop-blur text-xs space-y-3 z-20">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-cyan-400" />
                      {selectedNode.label}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">{selectedNode.ip}</span>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded">
                    ✕
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Status:</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${getStatusColor(selectedNode.status).badge}`}>
                      {selectedNode.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Operating System:</span>
                    <span className="text-slate-200 font-mono">{selectedNode.os}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Vulnerability:</span>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 text-amber-300 font-mono text-[11px]">
                      {selectedNode.vulnerability || 'No known vulnerabilities'}
                    </div>
                  </div>
                </div>

                {/* 1. Algorithmic Inbound Exploit Paths & Probability */}
                {selectedNode.id !== 'ext_attacker' && selectedNodeAnalysis && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px]">
                        <Compass className="h-3.5 w-3.5 text-cyan-400" />
                        Inbound Breach Probability:
                      </span>
                      <span className={`font-mono font-bold text-xs ${
                        selectedNodeAnalysis.reachable 
                          ? (selectedNodeAnalysis.probability >= 80 ? 'text-rose-400' : 'text-amber-400') 
                          : 'text-emerald-400'
                      }`}>
                        {selectedNodeAnalysis.reachable ? `${selectedNodeAnalysis.probability}% (High Risk)` : '0% (Safe / Isolated)'}
                      </span>
                    </div>

                    {selectedNodeAnalysis.reachable ? (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 block">Shortest Inbound Path from Hacker:</span>
                        <div className="p-1.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-200 leading-tight">
                          {selectedNodeAnalysis.path.map(id => nodes.find(n => n.id === id)?.label || id).join(' ➔ ')}
                        </div>

                        {/* If multiple paths exist */}
                        {selectedNodeAnalysis.allPaths && selectedNodeAnalysis.allPaths.length > 1 && (
                          <div className="text-[10px] text-slate-400 pt-1">
                            <span>Alternative Inbound Routes ({selectedNodeAnalysis.allPaths.length} total):</span>
                            <div className="space-y-1 mt-1 max-h-20 overflow-y-auto pr-1">
                              {selectedNodeAnalysis.allPaths.slice(1, 3).map((p, idx) => (
                                <div key={idx} className="p-1 rounded bg-slate-900/60 border border-slate-800/80 font-mono text-[9px] text-slate-300 flex justify-between">
                                  <span className="truncate">{p.path.map(id => nodes.find(n => n.id === id)?.label || id).join(' ➔ ')}</span>
                                  <span className="text-amber-400 font-bold ml-1">{p.probability}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleTargetedAttackOnPath(selectedNode.id)}
                          className="w-full mt-1.5 py-1.5 px-2 bg-rose-900/70 hover:bg-rose-800 text-rose-100 border border-rose-500/50 rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <Zap className="h-3.5 w-3.5 text-amber-300" />
                          <span>Simulate Attack from Hacker to This Asset</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-400 leading-relaxed font-mono p-1.5 rounded bg-emerald-950/30 border border-emerald-900/50">
                        🔒 No inbound path from Hacker. Directional routing prevents reverse traversal!
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Lateral Movement & Blast Radius (Outbound Impact) */}
                {selectedNode.id !== 'ext_attacker' && selectedNodeBlast && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px]">
                        <Flame className="h-3.5 w-3.5 text-amber-400" />
                        Lateral Movement Blast Radius:
                      </span>
                      <span className={`font-mono font-bold text-[11px] ${
                        selectedNodeBlast.count > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {selectedNodeBlast.count > 0 ? `${selectedNodeBlast.count} Assets at Risk` : '0 Assets (Dead-End)'}
                      </span>
                    </div>

                    {selectedNodeBlast.count > 0 ? (
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Can infect downstream along outgoing arrows:</span>
                        <div className="p-1.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-rose-300 leading-tight">
                          {selectedNodeBlast.directTargets.join(', ')}
                        </div>
                      </div>
                    ) : (
                      <div className="p-1.5 rounded bg-emerald-950/30 border border-emerald-900/50 text-[10px] text-emerald-400 leading-relaxed font-mono">
                        🔒 Safe Terminal Asset: Has ZERO outgoing links! If this asset is breached, it CANNOT jump to Web Server or upstream assets!
                      </div>
                    )}

                    <button
                      onClick={() => handleSimulateInitialBreachOnNode(selectedNode.id)}
                      className="w-full py-1.5 px-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow transition"
                    >
                      <Target className="h-3.5 w-3.5" />
                      <span>Simulate Initial Breach on this Asset (Patient Zero)</span>
                    </button>
                  </div>
                )}

                {/* 3. Quarantine & Delete Controls */}
                {selectedNode.id !== 'ext_attacker' && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <button
                      onClick={() => {
                        setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, status: 'ISOLATED' } : n));
                        setSelectedNode(prev => prev ? { ...prev, status: 'ISOLATED' } : null);
                      }}
                      className="w-full py-1.5 px-2 bg-sky-900/80 hover:bg-sky-800 text-sky-200 border border-sky-500/40 rounded font-medium flex items-center justify-center gap-1 transition"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Quarantine Node (Isolate)
                    </button>

                    <button
                      onClick={() => handleDeleteNode(selectedNode.id)}
                      className="w-full py-1 px-2 bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-900 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove Asset
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Simulation Controller Bar */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleNextAttackStep}
                className="py-2.5 px-4 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 transition"
              >
                <Play className="h-4 w-4" />
                <span>
                  {attackStep === 0 ? '▶ Step 1: Attack Ingress' : `▶ Step ${attackStep + 1}: Follow Outgoing Attack Links`}
                </span>
              </button>

              <button
                onClick={handleQuarantine}
                disabled={attackStep === 0 || attackStep === 99}
                className="py-2.5 px-4 rounded-lg bg-sky-700 hover:bg-sky-600 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-950/60 transition"
              >
                <Lock className="h-4 w-4" />
                <span>🛡️ Quarantine Breached Nodes (Cut Off Attack)</span>
              </button>

              <button
                onClick={handleReset}
                className="py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="h-4 w-4" />
                <span>🔄 Reset Network to 100% Safe</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Two Clean Explanatory Cards: AI Detection & Compliance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card A: AI Threat Detection */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-cyan-400" />
                AI Threat Detection (Real Machine Learning)
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                attackStep > 0 && attackStep < 99 ? 'bg-rose-950 text-rose-300 border border-rose-500' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}>
                {attackStep > 0 && attackStep < 99 ? 'ANOMALOUS ACTIVITY' : 'TRAFFIC NORMAL'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Classified Attack:</span>
                <span className="font-mono font-bold text-slate-200">
                  {attackStep === 0 && 'Benign HTTPS Traffic'}
                  {attackStep === 1 && 'Ingress Port Scan & Gateway Recon'}
                  {attackStep === 2 && 'Web Server Lateral Infiltration'}
                  {attackStep >= 3 && attackStep < 99 && 'Internal Lateral Movement & Data Exfiltration'}
                  {attackStep === 99 && 'Threat Mitigated (Quarantined)'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">AI Model Confidence:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {attackStep === 0 ? '99.4%' : attackStep === 99 ? '98.5%' : '96.2% High Risk'}
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                <strong>Why the AI detected this:</strong>{' '}
                {attackStep === 0 && 'Telemetry matches normal user sessions.'}
                {attackStep === 1 && 'AI noticed abnormal packet rates and failed credential checks targeting Port 443.'}
                {attackStep === 2 && 'AI flagged unauthorized calls jumping across the link into Web Server.'}
                {attackStep >= 3 && attackStep < 99 && 'AI detected abnormal data transfer across internal routes to connected servers.'}
                {attackStep === 99 && 'The breached connection was severed. Network returned to baseline.'}
              </div>
            </div>
          </div>

          {/* Card B: Compliance Posture */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                Compliance & Regulations (NIST & ISO)
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                attackStep > 0 && attackStep < 99 ? 'bg-rose-950 text-rose-300 border border-rose-500' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}>
                {attackStep > 0 && attackStep < 99 ? 'FAILED AUDIT' : 'PASSED'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">NIST CSF (DE.AE-1 / RS.MI-1):</span>
                <span className={`font-mono font-bold ${attackStep > 0 && attackStep < 99 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {attackStep > 0 && attackStep < 99 ? 'VIOLATED (Breach Active)' : 'COMPLIANT'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">ISO/IEC 27001 (A.12.4 Logging):</span>
                <span className={`font-mono font-bold ${attackStep > 0 && attackStep < 99 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {attackStep > 0 && attackStep < 99 ? 'VIOLATED' : 'COMPLIANT'}
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                <strong>Recommended Action:</strong>{' '}
                {attackStep === 0 && 'System passes all audit checks.'}
                {attackStep > 0 && attackStep < 99 && 'Click "Quarantine Breached Nodes" above to isolate the attack and restore compliance.'}
                {attackStep === 99 && 'Containment successful. NIST RS.MI-1 mitigation criterion satisfied.'}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 px-6 text-center text-xs text-slate-500">
        AI-Driven Cyber Digital Twin &bull; Directed Graph Traversal &bull; IEEE ICCST Reference Framework
      </footer>

      {/* Modals */}
      <NetworkBuilderModal
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        onAddNode={handleAddAsset}
      />

      <ConnectEdgeModal
        isOpen={isConnectEdgeOpen}
        onClose={() => setIsConnectEdgeOpen(false)}
        nodes={nodes.map(n => ({ data: n as any }))}
        onAddEdge={handleAddEdge}
      />
    </div>
  );
}
