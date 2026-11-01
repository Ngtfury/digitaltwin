from typing import List, Dict, Any

SCENARIOS: Dict[str, Dict[str, Any]] = {
    "supply_chain_iot": {
        "id": "supply_chain_iot",
        "title": "Supply Chain Breach with Lateral IoT Pivot & Privilege Escalation",
        "description": "Adversary exploits cloud supply chain vulnerability, performs lateral movement through internal servers, pivots across IoT devices, escalates privileges to Domain Admin, and exfiltrates database records.",
        "steps": [
            {
                "step_number": 1,
                "title": "Supply Chain Infiltration",
                "attacker_node": "ext_attacker",
                "target_node": "cloud_gateway",
                "attack_type": "PORT_SCAN / RECON",
                "technique": "API Gateway CORS Misconfiguration Exploit (MITRE ATT&CK T1190)",
                "impacted_nodes": ["cloud_gateway"],
                "compromised_node": "cloud_gateway",
                "flow_telemetry": {
                    "flow_duration": 0.04,
                    "src_bytes": 128,
                    "dst_bytes": 0,
                    "src_pkts": 3,
                    "dst_pkts": 0,
                    "syn_count": 3,
                    "ack_count": 0,
                    "failed_logins": 0,
                    "dst_port": 443,
                    "byte_rate": 3200,
                    "packet_rate": 75
                },
                "compliance_impact": ["NIST DE.AE-1", "ISO A.12.4"]
            },
            {
                "step_number": 2,
                "title": "DMZ Web Compromise",
                "attacker_node": "cloud_gateway",
                "target_node": "dmz_web",
                "attack_type": "BRUTE_FORCE",
                "technique": "Credential Stuffing on Web Admin Portal (MITRE ATT&CK T1110)",
                "impacted_nodes": ["dmz_web"],
                "compromised_node": "dmz_web",
                "flow_telemetry": {
                    "flow_duration": 8.5,
                    "src_bytes": 1240,
                    "dst_bytes": 980,
                    "src_pkts": 45,
                    "dst_pkts": 40,
                    "syn_count": 25,
                    "ack_count": 20,
                    "failed_logins": 18,
                    "dst_port": 8080,
                    "byte_rate": 261,
                    "packet_rate": 10
                },
                "compliance_impact": ["NIST PR.AC-4", "SOC 2 CC6.1"]
            },
            {
                "step_number": 3,
                "title": "Lateral Movement to Internal Core Server",
                "attacker_node": "dmz_web",
                "target_node": "internal_app",
                "attack_type": "LATERAL_MOVEMENT",
                "technique": "Internal gRPC / SSH Tunneling via Stolen Service Token (MITRE ATT&CK T1021)",
                "impacted_nodes": ["internal_app"],
                "compromised_node": "internal_app",
                "flow_telemetry": {
                    "flow_duration": 1.8,
                    "src_bytes": 4500,
                    "dst_bytes": 3800,
                    "src_pkts": 85,
                    "dst_pkts": 70,
                    "syn_count": 8,
                    "ack_count": 12,
                    "failed_logins": 2,
                    "dst_port": 50051,
                    "byte_rate": 4611,
                    "packet_rate": 86
                },
                "compliance_impact": ["ISO A.9.2", "NIST PR.AC-4"]
            },
            {
                "step_number": 4,
                "title": "IoT Controller Pivot & Sensor Tampering",
                "attacker_node": "internal_app",
                "target_node": "iot_controller",
                "attack_type": "LATERAL_MOVEMENT",
                "technique": "MQTT Broker Credential Exploit on Embedded Gateway (MITRE ATT&CK T1078)",
                "impacted_nodes": ["iot_controller", "iot_sensors"],
                "compromised_node": "iot_controller",
                "flow_telemetry": {
                    "flow_duration": 2.2,
                    "src_bytes": 3200,
                    "dst_bytes": 2800,
                    "src_pkts": 55,
                    "dst_pkts": 50,
                    "syn_count": 6,
                    "ack_count": 10,
                    "failed_logins": 1,
                    "dst_port": 8883,
                    "byte_rate": 2727,
                    "packet_rate": 47
                },
                "compliance_impact": ["ISO A.12.4", "SOC 2 CC7.2"]
            },
            {
                "step_number": 5,
                "title": "Domain Privilege Escalation",
                "attacker_node": "internal_app",
                "target_node": "iam_directory",
                "attack_type": "BRUTE_FORCE",
                "technique": "Kerberoasting Ticket Extraction & Domain Admin Takeover (MITRE ATT&CK T1558)",
                "impacted_nodes": ["iam_directory"],
                "compromised_node": "iam_directory",
                "flow_telemetry": {
                    "flow_duration": 5.4,
                    "src_bytes": 8900,
                    "dst_bytes": 12000,
                    "src_pkts": 110,
                    "dst_pkts": 95,
                    "syn_count": 14,
                    "ack_count": 22,
                    "failed_logins": 12,
                    "dst_port": 389,
                    "byte_rate": 3870,
                    "packet_rate": 38
                },
                "compliance_impact": ["NIST PR.AC-4", "ISO A.9.2", "SOC 2 CC6.1"]
            },
            {
                "step_number": 6,
                "title": "Data Exfiltration & Database Dump",
                "attacker_node": "internal_app",
                "target_node": "db_core",
                "attack_type": "DATA_EXFILTRATION",
                "technique": "Direct SQL Query Pipeline to Staged Cloud Storage (MITRE ATT&CK T1048)",
                "impacted_nodes": ["db_core", "cloud_s3_storage"],
                "compromised_node": "db_core",
                "flow_telemetry": {
                    "flow_duration": 22.0,
                    "src_bytes": 2800000,
                    "dst_bytes": 12000,
                    "src_pkts": 1800,
                    "dst_pkts": 250,
                    "syn_count": 2,
                    "ack_count": 15,
                    "failed_logins": 0,
                    "dst_port": 5432,
                    "byte_rate": 127818,
                    "packet_rate": 93
                },
                "compliance_impact": ["NIST RS.MI-1", "ISO A.16.1", "SOC 2 CC7.2"]
            }
        ]
    },
    "ransomware_propagation": {
        "id": "ransomware_propagation",
        "title": "Enterprise Ransomware Propagation via Internal Lateral Movement",
        "description": "Simulates aggressive ransomware infection entering through compromised DMZ application, propagating via SMB/RPC, encrypting core assets, and attempting backup invalidation.",
        "steps": [
            {
                "step_number": 1,
                "title": "Initial Malicious Payload Drop",
                "attacker_node": "ext_attacker",
                "target_node": "dmz_web",
                "attack_type": "PORT_SCAN",
                "technique": "Web Application Infiltration & Dropper Deployment (MITRE ATT&CK T1190)",
                "impacted_nodes": ["dmz_web"],
                "compromised_node": "dmz_web",
                "flow_telemetry": {
                    "flow_duration": 0.08,
                    "src_bytes": 256,
                    "dst_bytes": 40,
                    "src_pkts": 4,
                    "dst_pkts": 1,
                    "syn_count": 4,
                    "ack_count": 1,
                    "failed_logins": 0,
                    "dst_port": 443,
                    "byte_rate": 3700,
                    "packet_rate": 62
                },
                "compliance_impact": ["NIST DE.AE-1"]
            },
            {
                "step_number": 2,
                "title": "Rapid Lateral Propagation via SMB",
                "attacker_node": "dmz_web",
                "target_node": "internal_app",
                "attack_type": "LATERAL_MOVEMENT",
                "technique": "EternalBlue / SMB Worm Dissemination (MITRE ATT&CK T1210)",
                "impacted_nodes": ["internal_app"],
                "compromised_node": "internal_app",
                "flow_telemetry": {
                    "flow_duration": 1.2,
                    "src_bytes": 9500,
                    "dst_bytes": 4200,
                    "src_pkts": 120,
                    "dst_pkts": 85,
                    "syn_count": 15,
                    "ack_count": 25,
                    "failed_logins": 3,
                    "dst_port": 445,
                    "byte_rate": 11416,
                    "packet_rate": 170
                },
                "compliance_impact": ["ISO A.12.4", "NIST PR.AC-4"]
            },
            {
                "step_number": 3,
                "title": "Ransomware Encryption of Critical Database",
                "attacker_node": "internal_app",
                "target_node": "db_core",
                "attack_type": "RANSOMWARE_BEACON",
                "technique": "Symmetric AES-256 Key Encryption of Database Volumes (MITRE ATT&CK T1486)",
                "impacted_nodes": ["db_core"],
                "compromised_node": "db_core",
                "flow_telemetry": {
                    "flow_duration": 0.6,
                    "src_bytes": 850,
                    "dst_bytes": 620,
                    "src_pkts": 14,
                    "dst_pkts": 12,
                    "syn_count": 1,
                    "ack_count": 1,
                    "failed_logins": 0,
                    "dst_port": 445,
                    "byte_rate": 2450,
                    "packet_rate": 43
                },
                "compliance_impact": ["ISO A.16.1", "SOC 2 CC7.2"]
            },
            {
                "step_number": 4,
                "title": "Targeting Cloud Backup Storage",
                "attacker_node": "internal_app",
                "target_node": "cloud_s3_storage",
                "attack_type": "DATA_EXFILTRATION",
                "technique": "Cloud Storage Deletion & Shadow Copy Removal (MITRE ATT&CK T1490)",
                "impacted_nodes": ["cloud_s3_storage"],
                "compromised_node": "cloud_s3_storage",
                "flow_telemetry": {
                    "flow_duration": 18.0,
                    "src_bytes": 1800000,
                    "dst_bytes": 8400,
                    "src_pkts": 1200,
                    "dst_pkts": 160,
                    "syn_count": 2,
                    "ack_count": 12,
                    "failed_logins": 0,
                    "dst_port": 443,
                    "byte_rate": 100466,
                    "packet_rate": 75
                },
                "compliance_impact": ["NIST RS.MI-1", "ISO A.12.4", "SOC 2 CC6.1"]
            }
        ]
    }
}

