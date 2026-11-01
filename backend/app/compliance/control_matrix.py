from typing import Dict, List, Any

COMPLIANCE_CONTROLS: List[Dict[str, Any]] = [
    # --- NIST Cybersecurity Framework (CSF) ---
    {
        "framework": "NIST CSF",
        "control_id": "DE.AE-1",
        "category": "Detect - Anomalies and Events",
        "title": "Baseline of Network Operations & Data Flows",
        "description": "A baseline of network operations and expected data flows for users and systems is established and managed.",
        "target_nodes": ["fw_perimeter", "cloud_gateway", "dmz_web"],
        "telemetry_metric": "is_anomaly",
        "default_status": "COMPLIANT"
    },
    {
        "framework": "NIST CSF",
        "control_id": "DE.AE-2",
        "category": "Detect - Anomalies and Events",
        "title": "Detected Events Analyzed to Understand Attack Targets",
        "description": "Detected events are analyzed to understand attack targets and methods using AI explainability.",
        "target_nodes": ["internal_app", "iam_directory"],
        "telemetry_metric": "shap_attributions",
        "default_status": "COMPLIANT"
    },
    {
        "framework": "NIST CSF",
        "control_id": "PR.AC-4",
        "category": "Protect - Identity Management & Access Control",
        "title": "Access Permissions & Least Privilege Principle",
        "description": "Access permissions and authorizations are managed incorporating the principles of least privilege and separation of duties.",
        "target_nodes": ["iam_directory", "internal_app"],
        "telemetry_metric": "failed_logins",
        "default_status": "COMPLIANT"
    },
    {
        "framework": "NIST CSF",
        "control_id": "RS.MI-1",
        "category": "Respond - Mitigation",
        "title": "Incident Containment & Blast Radius Suppression",
        "description": "Incidents are contained to mitigate blast radius and prevent broader lateral network compromise.",
        "target_nodes": ["fw_perimeter", "internal_app", "db_core"],
        "telemetry_metric": "blast_radius_percent",
        "default_status": "COMPLIANT"
    },

    # --- ISO/IEC 27001:2022 (Annex A) ---
    {
        "framework": "ISO 27001",
        "control_id": "A.9.2",
        "category": "Access Control",
        "title": "User Access Provisioning and Authentication Management",
        "description": "Formal user registration and access de-provisioning processes prevent unauthorized lateral credential access.",
        "target_nodes": ["iam_directory", "dmz_web"],
        "telemetry_metric": "failed_logins",
        "default_status": "COMPLIANT"
    },
    {
        "framework": "ISO 27001",
        "control_id": "A.12.4",
        "category": "Operations Security",
        "title": "Logging, Monitoring & Event Telemetry Protection",
        "description": "Event logs recording user activities, exceptions, faults and information security events shall be produced and kept.",
        "target_nodes": ["cloud_gateway", "internal_app", "iot_controller"],
        "telemetry_metric": "flow_telemetry",
        "default_status": "COMPLIANT"
    },
    {
        "framework": "ISO 27001",
        "control_id": "A.16.1",
        "category": "Information Security Incident Management",
        "title": "Management of Security Incidents & Rapid Triage",
        "description": "Information security events are assessed and categorized to decide if they are classified as security incidents.",
        "target_nodes": ["dmz_web", "internal_app", "db_core"],
        "telemetry_metric": "detection_method",
        "default_status": "COMPLIANT"
    },
    {
        "framework": "ISO 27001",
        "control_id": "A.13.1",
        "category": "Communications Security",
        "title": "Network Security Management & Subnet Isolation",
        "description": "Groups of information services, users and information systems shall be segregated on networks.",
        "target_nodes": ["fw_perimeter", "iot_controller"],
        "telemetry_metric": "isolated_nodes",
        "default_status": "COMPLIANT"
    },

    # --- AICPA SOC 2 (Trust Services Criteria) ---
    {
        "framework": "SOC 2",
        "control_id": "CC6.1",
        "category": "Logical Access Controls",
        "title": "Logical Protection of Assets from Unauthorized Access",
        "description": "The entity implements logical access security software, infrastructure, and architectures over protected data.",
        "target_nodes": ["db_core", "cloud_s3_storage"],
        "telemetry_metric": "compromised_nodes",
        "default_status": "COMPLIANT"
    },
    {
        "framework": "SOC 2",
        "control_id": "CC7.2",
        "category": "System Operations & Incident Monitoring",
        "title": "System Monitoring for Anomalies and Threat Indicators",
        "description": "The entity monitors system components and the operation of controls for indicators of vulnerabilities or anomalies.",
        "target_nodes": ["cloud_gateway", "dmz_web", "internal_app", "db_core"],
        "telemetry_metric": "anomaly_score",
        "default_status": "COMPLIANT"
    }
]

