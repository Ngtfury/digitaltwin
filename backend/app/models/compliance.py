from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base

class ComplianceEvidence(Base):
    __tablename__ = "compliance_evidence"

    id = Column(Integer, primary_key=True, index=True)
    framework = Column(String(50), nullable=False)  # NIST_CSF, ISO_27001, SOC_2
    control_id = Column(String(50), nullable=False)  # e.g. DE.AE-1, RS.MI-1, A.12.4
    control_title = Column(String(200), nullable=False)
    status = Column(String(30), default="COMPLIANT")  # COMPLIANT, AT_RISK, NON_COMPLIANT
    telemetry_ref = Column(String(100), nullable=True)
    evidence_payload = Column(Text, nullable=False)  # JSON details of verified evidence
    audit_hash = Column(String(64), nullable=False)  # SHA-256 integrity hash
    timestamp = Column(DateTime, default=datetime.utcnow)

