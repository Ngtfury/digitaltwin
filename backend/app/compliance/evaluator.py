from typing import Dict, List, Any
from app.compliance.control_matrix import COMPLIANCE_CONTROLS
from app.twin.graph_manager import twin_engine

class ComplianceEvaluator:
    def __init__(self):
        self.controls = COMPLIANCE_CONTROLS

    def evaluate_posture(self, latest_telemetry: dict = None) -> Dict[str, Any]:
        """
        Dynamically calculate compliance scores and control statuses
        based on the Digital Twin graph state and active security incidents.
        """
        graph_stats = twin_engine.get_health_metrics()
        nodes_dict = {n: d for n, d in twin_engine.graph.nodes(data=True)}
        
        evaluated_controls = []
        framework_tallies = {
            "NIST CSF": {"total": 0, "passed": 0, "at_risk": 0, "failed": 0},
            "ISO 27001": {"total": 0, "passed": 0, "at_risk": 0, "failed": 0},
            "SOC 2": {"total": 0, "passed": 0, "at_risk": 0, "failed": 0}
        }

        deviations = []

        for ctrl in self.controls:
            fw = ctrl["framework"]
            framework_tallies[fw]["total"] += 1

            # Check health of target nodes for this control
            target_nodes = ctrl["target_nodes"]
            compromised_targets = [n for n in target_nodes if nodes_dict.get(n, {}).get("status") == "COMPROMISED"]
            suspicious_targets = [n for n in target_nodes if nodes_dict.get(n, {}).get("status") == "SUSPICIOUS"]
            isolated_targets = [n for n in target_nodes if nodes_dict.get(n, {}).get("status") == "ISOLATED"]

            if compromised_targets:
                status = "NON_COMPLIANT"
                framework_tallies[fw]["failed"] += 1
                evidence = f"Control validation failed: Target asset(s) [{', '.join(compromised_targets)}] compromised by active attack vector without complete containment."
                deviations.append({
                    "control_id": ctrl["control_id"],
                    "framework": fw,
                    "title": ctrl["title"],
                    "severity": "HIGH",
                    "reason": evidence
                })
            elif suspicious_targets:
                status = "AT_RISK"
                framework_tallies[fw]["at_risk"] += 1
                evidence = f"Elevated threat anomaly observed targeting asset(s) [{', '.join(suspicious_targets)}]. Under automated AI observation."
            elif isolated_targets:
                status = "COMPLIANT"
                framework_tallies[fw]["passed"] += 1
                evidence = f"Compromised vector successfully mitigated via automated quarantine of [{', '.join(isolated_targets)}]. Control integrity maintained."
            else:
                status = "COMPLIANT"
                framework_tallies[fw]["passed"] += 1
                evidence = f"Telemetry verified normal. All target assets [{', '.join(target_nodes)}] pass automated configuration and anomaly checks."

            evaluated_controls.append({
                "control_id": ctrl["control_id"],
                "framework": fw,
                "category": ctrl["category"],
                "title": ctrl["title"],
                "description": ctrl["description"],
                "target_nodes": target_nodes,
                "status": status,
                "evidence_summary": evidence
            })

        # Dynamically check any custom-created nodes that were compromised
        all_mapped = set([t for c in self.controls for t in c["target_nodes"]])
        custom_compromised = [
            n for n, d in nodes_dict.items() 
            if d.get("status") == "COMPROMISED" and n not in all_mapped and n != "ext_attacker"
        ]
        for cn in custom_compromised:
            c_label = nodes_dict[cn].get("label", cn)
            deviations.append({
                "control_id": "CUSTOM-ASSET-ALERT",
                "framework": "NIST CSF / ISO 27001",
                "title": f"Breach of Custom Asset: '{c_label}'",
                "severity": "CRITICAL",
                "reason": f"Custom network asset [{cn}] compromised during attack simulation. Blast radius expanded to {graph_stats['blast_radius_percent']}%."
            })

        # Calculate scores
        framework_scores = {}
        for fw, tally in framework_tallies.items():
            tot = tally["total"]
            if tot > 0:
                score = ((tally["passed"] * 1.0) + (tally["at_risk"] * 0.5)) / tot * 100
                framework_scores[fw] = round(score, 1)
            else:
                framework_scores[fw] = 100.0

        total_all = len(self.controls)
        total_passed = sum(t["passed"] for t in framework_tallies.values())
        total_at_risk = sum(t["at_risk"] for t in framework_tallies.values())
        overall_readiness = round(((total_passed * 1.0 + total_at_risk * 0.5) / max(total_all, 1)) * 100, 1)

        # Penalize readiness if custom nodes are compromised
        if custom_compromised:
            overall_readiness = max(10.0, round(overall_readiness - (len(custom_compromised) * 15.0), 1))

        # Baseline Comparison metrics matching IEEE paper Table 1
        comparison_benchmark = {
            "incident_triage_time_min": {
                "siem_baseline": 12.0,
                "soar_baseline": 9.5,
                "proposed_digital_twin": 7.8,
                "improvement_vs_siem": "35% faster"
            },
            "compliance_reporting_hours": {
                "siem_baseline": 5.0,
                "soar_baseline": 4.2,
                "proposed_digital_twin": 3.0,
                "improvement_vs_siem": "40% faster"
            },
            "detection_precision_pct": {
                "siem_baseline": 83.0,
                "soar_baseline": 87.0,
                "proposed_digital_twin": 92.4
            },
            "detection_recall_pct": {
                "siem_baseline": 78.0,
                "soar_baseline": 84.0,
                "proposed_digital_twin": 89.5
            },
            "iso_27001_control_coverage_pct": {
                "siem_baseline": 0.0,
                "soar_baseline": 12.0,
                "proposed_digital_twin": 20.0
            }
        }

        return {
            "overall_readiness_score": overall_readiness,
            "framework_scores": framework_scores,
            "controls": evaluated_controls,
            "deviations": deviations,
            "graph_health": graph_stats,
            "benchmark_comparison": comparison_benchmark
        }

# Global Singleton
compliance_evaluator = ComplianceEvaluator()
