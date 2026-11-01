import time
from typing import Dict, List, Any, Optional
from app.twin.graph_manager import twin_engine
from app.twin.scenarios import SCENARIOS
from app.ml.model_service import ml_service

class AttackSimulationEngine:
    def __init__(self):
        self.active_scenario_id: str = "supply_chain_iot"
        self.current_step_index: int = 0
        self.is_running: bool = False
        self.simulation_history: List[Dict[str, Any]] = []
        self.latest_step_result: Optional[Dict[str, Any]] = None

    def load_scenario(self, scenario_id: str) -> Dict[str, Any]:
        if scenario_id not in SCENARIOS:
            scenario_id = "supply_chain_iot"
        self.active_scenario_id = scenario_id
        self.current_step_index = 0
        self.latest_step_result = None
        twin_engine.reset_topology()
        return SCENARIOS[scenario_id]

    def reset(self):
        twin_engine.reset_topology()
        self.current_step_index = 0
        self.latest_step_result = None

    def execute_next_step(self) -> Dict[str, Any]:
        """Execute the next single step of the loaded attack scenario."""
        scenario = SCENARIOS.get(self.active_scenario_id, SCENARIOS["supply_chain_iot"])
        steps = scenario["steps"]

        if self.current_step_index >= len(steps):
            last = self.latest_step_result or {}
            return {
                "status": "COMPLETED",
                "message": "Scenario execution has concluded. All attack vectors reached target objectives.",
                "scenario_id": self.active_scenario_id,
                "step_number": len(steps),
                "title": f"Scenario Complete: {scenario['title']}",
                "attacker_node": last.get("attacker_node", "ext_attacker"),
                "target_node": last.get("target_node", "Target Crown Jewels"),
                "technique": "Adversary achieved full propagation objective.",
                "compromised_node": last.get("compromised_node", "All Targets"),
                "compliance_impact": last.get("compliance_impact", ["NIST RS.MI-1", "ISO A.16.1", "SOC 2 CC7.2"]),
                "current_step": self.current_step_index,
                "total_steps": len(steps),
                "topology": twin_engine.get_topology_dict()
            }

        step_data = steps[self.current_step_index]
        self.current_step_index += 1

        # 1. Update Graph State
        attacker_node = step_data["attacker_node"]
        target_node = step_data["target_node"]
        compromised = step_data.get("compromised_node")

        # Set target node status
        if compromised:
            twin_engine.set_node_status(compromised, "COMPROMISED")
        for imp in step_data.get("impacted_nodes", []):
            if imp != compromised:
                twin_engine.set_node_status(imp, "SUSPICIOUS")

        # Mark active attack edge
        if twin_engine.graph.has_edge(attacker_node, target_node):
            twin_engine.graph.edges[attacker_node, target_node]["active"] = True
            twin_engine.graph.edges[attacker_node, target_node]["attack_vector"] = True

        # 2. Run Flow Telemetry through AI Threat Detector
        telemetry = step_data.get("flow_telemetry", {})
        ai_prediction = ml_service.predict_flow(telemetry)

        # 3. Format Step Result
        step_result = {
            "status": "RUNNING" if self.current_step_index < len(steps) else "COMPLETED",
            "scenario_id": self.active_scenario_id,
            "step_number": step_data["step_number"],
            "title": step_data["title"],
            "attacker_node": attacker_node,
            "target_node": target_node,
            "technique": step_data["technique"],
            "compromised_node": compromised,
            "impacted_nodes": step_data.get("impacted_nodes", []),
            "compliance_impact": step_data.get("compliance_impact", []),
            "flow_telemetry": telemetry,
            "ai_detection": ai_prediction,
            "topology": twin_engine.get_topology_dict(),
            "timestamp": time.time()
        }

        self.latest_step_result = step_result
        self.simulation_history.append(step_result)
        return step_result

    def run_full_scenario(self) -> List[Dict[str, Any]]:
        """Run all remaining steps in the active scenario."""
        results = []
        scenario = SCENARIOS.get(self.active_scenario_id, SCENARIOS["supply_chain_iot"])
        while self.current_step_index < len(scenario["steps"]):
            res = self.execute_next_step()
            results.append(res)
        return results

    def apply_defense(self, action: str, target_node: Optional[str] = None) -> Dict[str, Any]:
        """Apply defensive intervention on the Cyber Digital Twin."""
        if action == "ISOLATE_NODE":
            if not target_node:
                # Isolate all compromised nodes
                compromised = [n for n, d in twin_engine.graph.nodes(data=True) if d.get("status") == "COMPROMISED"]
                for n in compromised:
                    twin_engine.isolate_node(n)
                msg = f"Quarantined {len(compromised)} compromised node(s): {', '.join(compromised)}"
            else:
                twin_engine.isolate_node(target_node)
                msg = f"Quarantined node {target_node}"
        elif action == "PATCH_VULNERABILITY":
            if not target_node:
                # Patch all nodes
                for n in twin_engine.graph.nodes:
                    twin_engine.patch_node(n)
                msg = "Patched all network node vulnerabilities and validated configurations."
            else:
                twin_engine.patch_node(target_node)
                msg = f"Patched and remediated vulnerability on node {target_node}"
        elif action == "RESET_BASELINE":
            self.reset()
            msg = "Restored Cyber Digital Twin to pristine normal baseline."
        else:
            msg = f"Unknown defense action: {action}"

        return {
            "action": action,
            "target_node": target_node,
            "message": msg,
            "topology": twin_engine.get_topology_dict()
        }

# Global Singleton
simulator_engine = AttackSimulationEngine()

