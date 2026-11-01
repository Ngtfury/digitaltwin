from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.twin.graph_manager import twin_engine
from app.ml.model_service import ml_service
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/twin", tags=["Cyber Digital Twin Topology & Builder"])

class CustomNodeCreate(BaseModel):
    id: Optional[str] = None
    label: str
    type: str  # SERVER, SECURITY_GATEWAY, GATEWAY, IOT_DEVICE, IDENTITY, DATABASE, STORAGE
    ip: str
    os: str
    vulnerability: Optional[str] = "None identified"
    criticality: Optional[str] = "MEDIUM"
    x: Optional[int] = None
    y: Optional[int] = None

class CustomEdgeCreate(BaseModel):
    source: str
    target: str
    protocol: Optional[str] = "TCP"
    port: Optional[int] = 80

class DeleteEdgeRequest(BaseModel):
    source: str
    target: str

class CustomAttackRequest(BaseModel):
    source_node: str
    target_node: str
    attack_type: str  # DOS_DDOS, BRUTE_FORCE, LATERAL_MOVEMENT, DATA_EXFILTRATION, RANSOMWARE_BEACON

@router.get("/topology")
def get_topology():
    """Retrieve full virtual enterprise topology graph with node/edge states."""
    return twin_engine.get_topology_dict()

@router.post("/nodes")
def add_node(node_in: CustomNodeCreate, current_user: User = Depends(get_current_user)):
    """Create a new custom node in the digital twin."""
    created = twin_engine.add_custom_node(node_in.dict())
    return {
        "message": f"Asset '{created['label']}' added successfully.",
        "node": created,
        "topology": twin_engine.get_topology_dict()
    }

@router.delete("/nodes/{node_id}")
def delete_node(node_id: str, current_user: User = Depends(get_current_user)):
    """Remove a node and its connections from the digital twin."""
    success = twin_engine.delete_node(node_id)
    if not success:
        raise HTTPException(status_code=404, detail="Node not found.")
    return {
        "message": f"Asset '{node_id}' removed.",
        "topology": twin_engine.get_topology_dict()
    }

@router.post("/edges")
def add_edge(edge_in: CustomEdgeCreate, current_user: User = Depends(get_current_user)):
    """Connect two nodes with a network route or trust relationship."""
    success = twin_engine.add_custom_edge(
        source=edge_in.source,
        target=edge_in.target,
        protocol=edge_in.protocol,
        port=edge_in.port
    )
    if not success:
        raise HTTPException(status_code=400, detail="Invalid source or target node ID.")
    return {
        "message": f"Connected '{edge_in.source}' to '{edge_in.target}'.",
        "topology": twin_engine.get_topology_dict()
    }

@router.delete("/edges")
def delete_edge(edge_req: DeleteEdgeRequest, current_user: User = Depends(get_current_user)):
    """Sever a network edge between two assets."""
    success = twin_engine.delete_edge(edge_req.source, edge_req.target)
    if not success:
        raise HTTPException(status_code=404, detail="Edge not found.")
    return {
        "message": f"Severed connection between '{edge_req.source}' and '{edge_req.target}'.",
        "topology": twin_engine.get_topology_dict()
    }

@router.post("/template/{template_name}")
def load_template(template_name: str, current_user: User = Depends(get_current_user)):
    """Load pre-configured or blank network architectures."""
    twin_engine.load_template(template_name)
    return {
        "message": f"Loaded template '{template_name}'.",
        "topology": twin_engine.get_topology_dict()
    }

@router.post("/custom-attack")
def run_custom_attack(req: CustomAttackRequest, current_user: User = Depends(get_current_user)):
    """Inject a dynamic attack across any custom path in the network topology."""
    result = twin_engine.simulate_custom_attack(
        source_id=req.source_node,
        target_id=req.target_node,
        attack_type=req.attack_type,
        ml_service=ml_service
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/reset")
def reset_twin(current_user: User = Depends(get_current_user)):
    twin_engine.reset_topology()
    return {
        "message": "Cyber Digital Twin topology successfully reset.",
        "topology": twin_engine.get_topology_dict()
    }

@router.post("/isolate/{node_id}")
def isolate_node(node_id: str, current_user: User = Depends(get_current_user)):
    success = twin_engine.isolate_node(node_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found.")
    return {
        "message": f"Node '{node_id}' isolated.",
        "topology": twin_engine.get_topology_dict()
    }

@router.post("/patch/{node_id}")
def patch_node(node_id: str, current_user: User = Depends(get_current_user)):
    success = twin_engine.patch_node(node_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found.")
    return {
        "message": f"Node '{node_id}' patched and verified.",
        "topology": twin_engine.get_topology_dict()
    }
