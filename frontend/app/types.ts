export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'security_analyst' | 'compliance_auditor';
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'EXTERNAL' | 'SECURITY_GATEWAY' | 'GATEWAY' | 'SERVER' | 'IOT_DEVICE' | 'IDENTITY' | 'DATABASE' | 'STORAGE';
  ip: string;
  os: string;
  vulnerability: string;
  criticality: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NORMAL' | 'SUSPICIOUS' | 'COMPROMISED' | 'ISOLATED' | 'ATTACKING';
  x?: number;
  y?: number;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  protocol: string;
  port: number;
  active: boolean;
  attack_vector: boolean;
}

export interface TopologyData {
  nodes: { data: NetworkNode }[];
  edges: { data: NetworkEdge }[];
  stats: {
    total_nodes: number;
    normal_nodes: number;
    suspicious_nodes: number;
    compromised_nodes: number;
    isolated_nodes: number;
    blast_radius_percent: number;
  };
}

export interface SHAPAttribution {
  feature: string;
  value: number;
  impact: number;
  direction: 'RISK_INCREASE' | 'RISK_DECREASE';
}

export interface AIDetectionResult {
  is_anomaly: boolean;
  predicted_attack: string;
  confidence: number;
  anomaly_score: number;
  is_zero_day_outlier: boolean;
  class_probabilities: Record<string, number>;
  shap_attributions: SHAPAttribution[];
}

export interface SimulationStepResult {
  status: 'RUNNING' | 'COMPLETED';
  scenario_id: string;
  step_number: number;
  title: string;
  attacker_node: string;
  target_node: string;
  technique: string;
  compromised_node: string;
  impacted_nodes: string[];
  compliance_impact: string[];
  flow_telemetry: Record<string, number>;
  ai_detection: AIDetectionResult;
  topology: TopologyData;
  timestamp: number;
}

export interface ComplianceControl {
  control_id: string;
  framework: 'NIST CSF' | 'ISO 27001' | 'SOC 2';
  category: string;
  title: string;
  description: string;
  target_nodes: string[];
  status: 'COMPLIANT' | 'AT_RISK' | 'NON_COMPLIANT';
  evidence_summary: string;
}

export interface CompliancePosture {
  overall_readiness_score: number;
  framework_scores: Record<string, number>;
  controls: ComplianceControl[];
  deviations: {
    control_id: string;
    framework: string;
    title: string;
    severity: string;
    reason: string;
  }[];
  graph_health: TopologyData['stats'];
  benchmark_comparison: Record<string, any>;
}

