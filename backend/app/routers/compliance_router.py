from fastapi import APIRouter, Depends, Response
from app.compliance.evaluator import compliance_evaluator
from app.compliance.evidence_store import evidence_vault
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/compliance", tags=["Compliance Automation & Evidence"])

@router.get("/posture")
def get_compliance_posture():
    """Retrieve dynamic compliance readiness score and control statuses."""
    return compliance_evaluator.evaluate_posture()

@router.get("/evidence")
def get_evidence_ledger():
    """Retrieve cryptographically hashed audit evidence ledger."""
    return evidence_vault.evidence_ledger

@router.get("/export")
def export_audit_package(current_user: User = Depends(get_current_user)):
    """Generate and return official compliance audit package with SHA-256 evidence integrity."""
    return evidence_vault.generate_audit_package()

