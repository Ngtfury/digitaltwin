import random
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.ml.model_service import ml_service
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/detection", tags=["AI Threat Detection & XAI"])

class FlowTelemetryInput(BaseModel):
    flow_duration: float
    src_bytes: float
    dst_bytes: float
    src_pkts: float
    dst_pkts: float
    syn_count: float
    ack_count: float
    failed_logins: float
    dst_port: float
    byte_rate: float
    packet_rate: float

@router.get("/metrics")
def get_ml_metrics():
    """Retrieve benchmark performance metrics (Precision, Recall, F1, Training Size)."""
    return ml_service.metrics

@router.post("/predict")
def predict_packet(flow: FlowTelemetryInput, current_user: User = Depends(get_current_user)):
    """Evaluate network flow through Isolation Forest and Random Forest with SHAP."""
    return ml_service.predict_flow(flow.dict())

@router.get("/stream-packet")
def get_stream_packet():
    """
    Generate a live synthetic network packet to power the real-time SOC traffic feed.
    Randomly selects between benign traffic (80%) and simulated threat anomalies (20%).
    """
    is_threat = random.random() < 0.25
    if not is_threat:
        dur = round(random.uniform(0.5, 3.0), 3)
        s_pkts = random.randint(5, 20)
        d_pkts = random.randint(10, 30)
        s_bytes = s_pkts * random.randint(80, 200)
        d_bytes = d_pkts * random.randint(300, 800)
        flow = {
            "flow_duration": dur,
            "src_bytes": s_bytes,
            "dst_bytes": d_bytes,
            "src_pkts": s_pkts,
            "dst_pkts": d_pkts,
            "syn_count": 1,
            "ack_count": random.randint(2, 5),
            "failed_logins": 0,
            "dst_port": random.choice([80, 443, 53, 8080]),
            "byte_rate": round((s_bytes + d_bytes) / dur, 2),
            "packet_rate": round((s_pkts + d_pkts) / dur, 2)
        }
    else:
        attack_type = random.choice(["DOS_DDOS", "PORT_SCAN", "BRUTE_FORCE", "LATERAL_MOVEMENT", "DATA_EXFILTRATION"])
        if attack_type == "DOS_DDOS":
            dur = 0.05
            flow = {
                "flow_duration": dur, "src_bytes": 12000, "dst_bytes": 100,
                "src_pkts": 450, "dst_pkts": 2, "syn_count": 420, "ack_count": 0,
                "failed_logins": 0, "dst_port": 443, "byte_rate": 242000, "packet_rate": 9040
            }
        elif attack_type == "PORT_SCAN":
            dur = 0.02
            flow = {
                "flow_duration": dur, "src_bytes": 120, "dst_bytes": 0,
                "src_pkts": 3, "dst_pkts": 0, "syn_count": 3, "ack_count": 0,
                "failed_logins": 0, "dst_port": random.randint(1000, 60000), "byte_rate": 6000, "packet_rate": 150
            }
        elif attack_type == "BRUTE_FORCE":
            dur = 6.2
            flow = {
                "flow_duration": dur, "src_bytes": 2200, "dst_bytes": 1800,
                "src_pkts": 40, "dst_pkts": 35, "syn_count": 15, "ack_count": 12,
                "failed_logins": 14, "dst_port": 22, "byte_rate": 645, "packet_rate": 12
            }
        elif attack_type == "LATERAL_MOVEMENT":
            dur = 1.4
            flow = {
                "flow_duration": dur, "src_bytes": 4200, "dst_bytes": 3600,
                "src_pkts": 60, "dst_pkts": 55, "syn_count": 10, "ack_count": 18,
                "failed_logins": 3, "dst_port": 445, "byte_rate": 5571, "packet_rate": 82
            }
        else: # DATA_EXFILTRATION
            dur = 15.0
            flow = {
                "flow_duration": dur, "src_bytes": 1500000, "dst_bytes": 4500,
                "src_pkts": 900, "dst_pkts": 80, "syn_count": 2, "ack_count": 8,
                "failed_logins": 0, "dst_port": 443, "byte_rate": 100300, "packet_rate": 65
            }

    prediction = ml_service.predict_flow(flow)
    return {
        "telemetry": flow,
        "analysis": prediction
    }

