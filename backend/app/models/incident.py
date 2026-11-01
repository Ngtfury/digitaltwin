from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from app.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    severity = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    source_node = Column(String(100), nullable=False)
    target_node = Column(String(100), nullable=False)
    attack_type = Column(String(100), nullable=False)
    detection_method = Column(String(50), default="AI_ANOMALY")
    confidence = Column(Float, default=0.95)
    shap_summary = Column(Text, nullable=True)  # JSON string of top feature weights
    status = Column(String(30), default="DETECTED")  # DETECTED, CONTAINED, REMEDIATED
    timestamp = Column(DateTime, default=datetime.utcnow)

class SimulationRecord(Base):
    __tablename__ = "simulation_records"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(String(50), nullable=False)
    scenario_name = Column(String(150), nullable=False)
    trigger_type = Column(String(50), default="MANUAL")
    steps_count = Column(Integer, default=0)
    compromised_nodes = Column(Text, default="[]")  # JSON array
    blast_radius_percent = Column(Float, default=0.0)
    mitigation_applied = Column(String(100), nullable=True)
    duration_ms = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)

