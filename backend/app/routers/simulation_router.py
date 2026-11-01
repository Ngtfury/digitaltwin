from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.twin.attack_simulator import simulator_engine
from app.twin.scenarios import SCENARIOS
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/simulation", tags=["Threat Simulation Engine"])

class MitigationRequest(BaseModel):
    action: str  # ISOLATE_NODE, PATCH_VULNERABILITY, RESET_BASELINE
    target_node: Optional[str] = None

@router.get("/scenarios")
def list_scenarios():
    """List available what-if attack simulation scenarios."""
    return [
        {
            "id": s["id"],
            "title": s["title"],
            "description": s["description"],
            "steps_count": len(s["steps"])
        }
        for s in SCENARIOS.values()
    ]

@router.post("/load/{scenario_id}")
def load_scenario(scenario_id: str, current_user: User = Depends(get_current_user)):
    """Load a specific scenario into the digital twin simulation environment."""
    scenario = simulator_engine.load_scenario(scenario_id)
    return {
        "message": f"Scenario '{scenario['title']}' loaded.",
        "scenario": scenario
    }

@router.post("/step")
def step_simulation(current_user: User = Depends(get_current_user)):
    """Execute the next attack step in the active scenario."""
    return simulator_engine.execute_next_step()

@router.post("/run")
def run_full_simulation(current_user: User = Depends(get_current_user)):
    """Run all remaining steps of the active attack scenario."""
    results = simulator_engine.run_full_scenario()
    return {
        "status": "COMPLETED",
        "steps_executed": len(results),
        "results": results,
        "latest_state": simulator_engine.latest_step_result
    }

@router.post("/mitigate")
def apply_mitigation(req: MitigationRequest, current_user: User = Depends(get_current_user)):
    """Apply proactive defensive intervention on the Cyber Digital Twin."""
    return simulator_engine.apply_defense(req.action, req.target_node)

