import hashlib
import json
import time
from datetime import datetime
from typing import Dict, List, Any
from app.compliance.evaluator import compliance_evaluator

class ComplianceEvidenceVault:
    def __init__(self):
        self.evidence_ledger: List[Dict[str, Any]] = []

    def record_evidence(self, framework: str, control_id: str, status: str, details: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a cryptographically hashed evidence entry."""
        timestamp = datetime.utcnow().isoformat() + "Z"
        payload_str = json.dumps(details, sort_keys=True)
        
        # Calculate SHA-256 integrity hash
        hash_input = f"{framework}:{control_id}:{status}:{timestamp}:{payload_str}"
        sha256_hash = hashlib.sha256(hash_input.encode('utf-8')).hexdigest()

        entry = {
            "id": f"EVD-{len(self.evidence_ledger) + 1:04d}",
            "framework": framework,
            "control_id": control_id,
            "status": status,
            "details": details,
            "audit_hash": sha256_hash,
            "timestamp": timestamp
        }

        self.evidence_ledger.append(entry)
        return entry

    def generate_audit_package(self) -> Dict[str, Any]:
        """Build the full downloadable compliance audit bundle."""
        current_posture = compliance_evaluator.evaluate_posture()
        
        # Snapshot current controls as official evidence entries
        snapshot_time = datetime.utcnow().isoformat() + "Z"
        evidence_items = []
        for ctrl in current_posture["controls"]:
            raw_data = {
                "control_id": ctrl["control_id"],
                "framework": ctrl["framework"],
                "status": ctrl["status"],
                "summary": ctrl["evidence_summary"],
                "evaluated_at": snapshot_time
            }
            digest = hashlib.sha256(json.dumps(raw_data, sort_keys=True).encode()).hexdigest()
            evidence_items.append({
                **raw_data,
                "integrity_hash": digest
            })

        package = {
            "report_id": f"AUDIT-REP-{int(time.time())}",
            "frameworks_covered": ["NIST Cybersecurity Framework (CSF v2.0)", "ISO/IEC 27001:2022", "AICPA SOC 2 Type II"],
            "generated_at": snapshot_time,
            "readiness_score": current_posture["overall_readiness_score"],
            "framework_scores": current_posture["framework_scores"],
            "total_controls_audited": len(current_posture["controls"]),
            "controls_compliant": len([c for c in current_posture["controls"] if c["status"] == "COMPLIANT"]),
            "controls_non_compliant": len([c for c in current_posture["controls"] if c["status"] == "NON_COMPLIANT"]),
            "controls_at_risk": len([c for c in current_posture["controls"] if c["status"] == "AT_RISK"]),
            "deviations_count": len(current_posture["deviations"]),
            "active_deviations": current_posture["deviations"],
            "evidence_entries": evidence_items,
            "benchmark_savings": current_posture["benchmark_comparison"]
        }

        return package

# Global Singleton
evidence_vault = ComplianceEvidenceVault()

