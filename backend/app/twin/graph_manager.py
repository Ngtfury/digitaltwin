import networkx as nx
from typing import Dict, List, Any, Optional
import random

class CyberDigitalTwin:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.reset_topology()

    def reset_topology(self):
        """Construct the reference enterprise network graph from the base paper."""
        self.load_template("ieee_base")

    def load_template(self, template_name: str):
        self.graph.clear()

        if template_name == "blank":
            # Just an external attacker and a perimeter gateway
            self.graph.add_node("ext_attacker", id="ext_attacker", label="External Threat Source", type="EXTERNAL", ip="198.51.100.24", os="Kali Linux", vulnerability="None", criticality="NONE", status="ATTACKING", x=450, y=60)
            self.graph.add_node("fw_perimeter", id="fw_perimeter", label="Perimeter Firewall", type="SECURITY_GATEWAY", ip="10.0.0.1", os="Palo Alto PanOS", vulnerability="None", criticality="HIGH", status="NORMAL", x=450, y=200)
            self.graph.add_edge("ext_attacker", "fw_perimeter", protocol="TCP/HTTPS", port=443, active=False, attack_vector=False)
            return

        if template_name == "fintech_banking":
            nodes_data = [
                {"id": "ext_attacker", "label": "External Cyber Threat", "type": "EXTERNAL", "ip": "198.51.100.77", "os": "Unknown Attacker", "vulnerability": "None", "criticality": "NONE", "status": "ATTACKING", "x": 450, "y": 50},
                {"id": "waf_edge", "label": "Cloud WAF & DDoS Shield", "type": "SECURITY_GATEWAY", "ip": "192.168.1.1", "os": "Cloudflare Enterprise", "vulnerability": "Rate Limiting Bypass", "criticality": "HIGH", "status": "NORMAL", "x": 450, "y": 150},
                {"id": "api_banking", "label": "Open Banking API Gateway", "type": "GATEWAY", "ip": "10.1.1.10", "os": "Kong API Gateway", "vulnerability": "Broken Object Level Auth (BOLA)", "criticality": "CRITICAL", "status": "NORMAL", "x": 300, "y": 270},
                {"id": "auth_service", "label": "OAuth2 / MFA Auth Broker", "type": "IDENTITY", "ip": "10.1.1.20", "os": "Keycloak Cluster", "vulnerability": "Session Hijack Token Reuse", "criticality": "CRITICAL", "status": "NORMAL", "x": 600, "y": 270},
                {"id": "core_payment", "label": "Core Payment Processing Engine", "type": "SERVER", "ip": "10.1.2.5", "os": "RHEL 9 PCI-DSS Compliant", "vulnerability": "Unpatched Java Deserialization", "criticality": "CRITICAL", "status": "NORMAL", "x": 300, "y": 420},
                {"id": "hsm_crypto", "label": "Hardware Security Module (HSM)", "type": "SECURITY_GATEWAY", "ip": "10.1.2.99", "os": "Thales Luna HSM Firmware", "vulnerability": "Firmware PIN Lockout Risk", "criticality": "CRITICAL", "status": "NORMAL", "x": 600, "y": 420},
                {"id": "ledger_db", "label": "Financial Ledger PostgreSQL DB", "type": "DATABASE", "ip": "10.1.3.50", "os": "PostgreSQL 16 High-Availability", "vulnerability": "SQL Injection Vector", "criticality": "CRITICAL", "status": "NORMAL", "x": 300, "y": 560},
                {"id": "swift_gateway", "label": "SWIFT Wire Transfer Node", "type": "SERVER", "ip": "10.1.3.80", "os": "IBM AIX Banking Node", "vulnerability": "Unauthorized RPC Hook", "criticality": "CRITICAL", "status": "NORMAL", "x": 600, "y": 560}
            ]
            for n in nodes_data:
                self.graph.add_node(n["id"], **n)
            edges_data = [
                ("ext_attacker", "waf_edge", {"protocol": "HTTPS", "port": 443}),
                ("waf_edge", "api_banking", {"protocol": "HTTPS/mTLS", "port": 8443}),
                ("waf_edge", "auth_service", {"protocol": "HTTPS", "port": 443}),
                ("api_banking", "core_payment", {"protocol": "gRPC", "port": 50051}),
                ("auth_service", "core_payment", {"protocol": "JWT Bearer", "port": 8080}),
                ("core_payment", "hsm_crypto", {"protocol": "PKCS#11", "port": 1234}),
                ("core_payment", "ledger_db", {"protocol": "PostgreSQL TLS", "port": 5432}),
                ("core_payment", "swift_gateway", {"protocol": "SWIFT-Net", "port": 10022})
            ]
            for src, dst, attrs in edges_data:
                self.graph.add_edge(src, dst, **attrs)
            return

        if template_name == "healthcare_iot":
            nodes_data = [
                {"id": "ext_attacker", "label": "External Ransomware Group", "type": "EXTERNAL", "ip": "198.51.100.99", "os": "C2 Server", "vulnerability": "None", "criticality": "NONE", "status": "ATTACKING", "x": 450, "y": 50},
                {"id": "hospital_firewall", "label": "Hospital Perimeter Firewall", "type": "SECURITY_GATEWAY", "ip": "172.16.0.1", "os": "Fortinet FortiOS 7.4", "vulnerability": "SSL-VPN CVE-2024-21762", "criticality": "HIGH", "status": "NORMAL", "x": 450, "y": 150},
                {"id": "telehealth_portal", "label": "Patient Portal & Telehealth", "type": "SERVER", "ip": "172.16.1.10", "os": "Ubuntu 22.04 LTS", "vulnerability": "IDOR Patient Record Leak", "criticality": "HIGH", "status": "NORMAL", "x": 250, "y": 270},
                {"id": "medical_iot_gw", "label": "Medical IoT Device Gateway", "type": "GATEWAY", "ip": "172.16.2.1", "os": "Embedded Medical Linux", "vulnerability": "Hardcoded Medical Gateway Creds", "criticality": "CRITICAL", "status": "NORMAL", "x": 650, "y": 270},
                {"id": "infusion_pumps", "label": "Smart Infusion Pumps Hub", "type": "IOT_DEVICE", "ip": "172.16.2.45", "os": "RTOS Medical Device", "vulnerability": "Unauthenticated Dosage Override", "criticality": "CRITICAL", "status": "NORMAL", "x": 800, "y": 400},
                {"id": "icu_monitors", "label": "ICU Patient Vital Monitors", "type": "IOT_DEVICE", "ip": "172.16.2.60", "os": "Proprietary Biomedical OS", "vulnerability": "Cleartext HL7 Stream", "criticality": "CRITICAL", "status": "NORMAL", "x": 580, "y": 400},
                {"id": "ehr_database", "label": "Electronic Health Record (EHR) DB", "type": "DATABASE", "ip": "172.16.3.100", "os": "Oracle Database 19c (HIPAA)", "vulnerability": "Unpatched Oracle TNS Listener", "criticality": "CRITICAL", "status": "NORMAL", "x": 250, "y": 450},
                {"id": "pacs_imaging", "label": "PACS Radiology Imaging Server", "type": "SERVER", "ip": "172.16.3.200", "os": "Windows Server 2022 (DICOM)", "vulnerability": "DICOM Port 104 Remote Code Exec", "criticality": "CRITICAL", "status": "NORMAL", "x": 450, "y": 560}
            ]
            for n in nodes_data:
                self.graph.add_node(n["id"], **n)
            edges_data = [
                ("ext_attacker", "hospital_firewall", {"protocol": "HTTPS/VPN", "port": 443}),
                ("hospital_firewall", "telehealth_portal", {"protocol": "HTTPS", "port": 443}),
                ("hospital_firewall", "medical_iot_gw", {"protocol": "Internal Route", "port": 8080}),
                ("medical_iot_gw", "infusion_pumps", {"protocol": "MQTT/CoAP", "port": 1883}),
                ("medical_iot_gw", "icu_monitors", {"protocol": "HL7 v2 over TCP", "port": 2575}),
                ("telehealth_portal", "ehr_database", {"protocol": "Oracle Net8", "port": 1521}),
                ("ehr_database", "pacs_imaging", {"protocol": "DICOM C-FIND", "port": 104})
            ]
            for src, dst, attrs in edges_data:
                self.graph.add_edge(src, dst, **attrs)
            return

        # Default: IEEE Base Paper
        nodes_data = [
            {"id": "ext_attacker", "label": "External Threat Source", "type": "EXTERNAL", "ip": "198.51.100.24", "os": "Kali Linux / Botnet", "vulnerability": "None (Attacker)", "criticality": "NONE", "status": "ATTACKING", "x": 450, "y": 50},
            {"id": "fw_perimeter", "label": "Perimeter Next-Gen Firewall", "type": "SECURITY_GATEWAY", "ip": "10.0.0.1", "os": "Palo Alto PanOS 11", "vulnerability": "CVE-2024-3400 (Low Risk, Patched)", "criticality": "HIGH", "status": "NORMAL", "x": 300, "y": 150},
            {"id": "cloud_gateway", "label": "Cloud API Gateway", "type": "GATEWAY", "ip": "10.0.1.10", "os": "AWS API Gateway / Nginx", "vulnerability": "Misconfigured CORS & Rate Limiting", "criticality": "MEDIUM", "status": "NORMAL", "x": 600, "y": 150},
            {"id": "dmz_web", "label": "DMZ Web Application", "type": "SERVER", "ip": "10.0.1.25", "os": "Ubuntu 22.04 LTS (Node.js/Next)", "vulnerability": "CVE-2023-44487 (HTTP/2 Rapid Reset)", "criticality": "HIGH", "status": "NORMAL", "x": 450, "y": 260},
            {"id": "internal_app", "label": "Internal Core Server", "type": "SERVER", "ip": "10.0.2.50", "os": "Red Hat Enterprise 9.2", "vulnerability": "Hardcoded Service Credentials", "criticality": "CRITICAL", "status": "NORMAL", "x": 300, "y": 380},
            {"id": "iot_controller", "label": "IoT Physical Access Hub", "type": "IOT_DEVICE", "ip": "10.0.3.15", "os": "Embedded Linux (MQTT/CoAP)", "vulnerability": "Default Firmware Credentials", "criticality": "HIGH", "status": "NORMAL", "x": 600, "y": 380},
            {"id": "iot_sensors", "label": "IoT Surveillance & Sensors", "type": "IOT_DEVICE", "ip": "10.0.3.100", "os": "RTOS / Microcontroller", "vulnerability": "Unauthenticated RTSP Stream", "criticality": "MEDIUM", "status": "NORMAL", "x": 750, "y": 480},
            {"id": "iam_directory", "label": "Active Directory / IAM Domain Controller", "type": "IDENTITY", "ip": "10.0.2.10", "os": "Windows Server 2022", "vulnerability": "Kerberoasting Vulnerable Accounts", "criticality": "CRITICAL", "status": "NORMAL", "x": 150, "y": 480},
            {"id": "db_core", "label": "Core Financial / Customer DB", "type": "DATABASE", "ip": "10.0.2.100", "os": "PostgreSQL 16 Enterprise", "vulnerability": "Unencrypted Internal Traffic Port", "criticality": "CRITICAL", "status": "NORMAL", "x": 300, "y": 520},
            {"id": "cloud_s3_storage", "label": "Cloud Evidence & Backup Bucket", "type": "STORAGE", "ip": "10.0.4.5", "os": "AWS S3 / Immutable Glacier", "vulnerability": "Overly Permissive IAM Policy", "criticality": "HIGH", "status": "NORMAL", "x": 500, "y": 580}
        ]
        for n in nodes_data:
            self.graph.add_node(n["id"], **n)

        edges_data = [
            ("ext_attacker", "fw_perimeter", {"protocol": "TCP/HTTPS", "port": 443}),
            ("fw_perimeter", "cloud_gateway", {"protocol": "HTTPS", "port": 443}),
            ("cloud_gateway", "dmz_web", {"protocol": "HTTP/REST", "port": 8080}),
            ("dmz_web", "internal_app", {"protocol": "gRPC", "port": 50051}),
            ("internal_app", "iot_controller", {"protocol": "MQTT/TLS", "port": 8883}),
            ("iot_controller", "iot_sensors", {"protocol": "CoAP/UDP", "port": 5683}),
            ("internal_app", "iam_directory", {"protocol": "LDAP/Kerberos", "port": 389}),
            ("internal_app", "db_core", {"protocol": "PostgreSQL", "port": 5432}),
            ("iam_directory", "db_core", {"protocol": "Kerberos SSO", "port": 88}),
            ("db_core", "cloud_s3_storage", {"protocol": "S3-API / HTTPS", "port": 443})
        ]
        for src, dst, attrs in edges_data:
            self.graph.add_edge(src, dst, **attrs)

    def add_custom_node(self, node: dict) -> dict:
        node_id = node.get("id") or f"node_{len(self.graph.nodes) + 1}_{int(random.random() * 1000)}"
        node["id"] = node_id
        node["status"] = node.get("status", "NORMAL")
        node["criticality"] = node.get("criticality", "MEDIUM")
        node["type"] = node.get("type", "SERVER")
        node["vulnerability"] = node.get("vulnerability", "None identified")
        
        # Calculate coordinate if missing
        if "x" not in node or "y" not in node:
            count = len(self.graph.nodes)
            node["x"] = 250 + (count % 4) * 140
            node["y"] = 200 + (count // 4) * 120

        self.graph.add_node(node_id, **node)
        return node

    def delete_node(self, node_id: str) -> bool:
        if node_id in self.graph:
            self.graph.remove_node(node_id)
            return True
        return False

    def add_custom_edge(self, source: str, target: str, protocol: str = "TCP", port: int = 80) -> bool:
        if source in self.graph and target in self.graph:
            self.graph.add_edge(source, target, protocol=protocol, port=port, active=False, attack_vector=False)
            return True
        return False

    def delete_edge(self, source: str, target: str) -> bool:
        if self.graph.has_edge(source, target):
            self.graph.remove_edge(source, target)
            return True
        return False

    def get_topology_dict(self) -> Dict[str, Any]:
        nodes = []
        for node_id, data in self.graph.nodes(data=True):
            nodes.append({
                "data": {
                    "id": node_id,
                    "label": data.get("label", node_id),
                    "type": data.get("type", "SERVER"),
                    "ip": data.get("ip", ""),
                    "os": data.get("os", ""),
                    "vulnerability": data.get("vulnerability", ""),
                    "criticality": data.get("criticality", "MEDIUM"),
                    "status": data.get("status", "NORMAL"),
                    "x": data.get("x", 450),
                    "y": data.get("y", 300)
                }
            })

        edges = []
        for u, v, data in self.graph.edges(data=True):
            edges.append({
                "data": {
                    "id": f"{u}->{v}",
                    "source": u,
                    "target": v,
                    "protocol": data.get("protocol", "TCP"),
                    "port": data.get("port", 0),
                    "active": data.get("active", False),
                    "attack_vector": data.get("attack_vector", False)
                }
            })

        return {
            "nodes": nodes,
            "edges": edges,
            "stats": self.get_health_metrics()
        }

    def get_health_metrics(self) -> Dict[str, Any]:
        total_enterprise_nodes = len([n for n in self.graph.nodes if n != "ext_attacker"])
        compromised = len([n for n, d in self.graph.nodes(data=True) if d.get("status") == "COMPROMISED"])
        suspicious = len([n for n, d in self.graph.nodes(data=True) if d.get("status") == "SUSPICIOUS"])
        isolated = len([n for n, d in self.graph.nodes(data=True) if d.get("status") == "ISOLATED"])
        normal = total_enterprise_nodes - (compromised + suspicious + isolated)

        blast_radius = round((compromised / max(total_enterprise_nodes, 1)) * 100, 1)

        return {
            "total_nodes": total_enterprise_nodes,
            "normal_nodes": max(0, normal),
            "suspicious_nodes": suspicious,
            "compromised_nodes": compromised,
            "isolated_nodes": isolated,
            "blast_radius_percent": blast_radius
        }

    def set_node_status(self, node_id: str, status: str):
        if node_id in self.graph:
            self.graph.nodes[node_id]["status"] = status

    def isolate_node(self, node_id: str) -> bool:
        if node_id in self.graph:
            self.graph.nodes[node_id]["status"] = "ISOLATED"
            for u, v in list(self.graph.in_edges(node_id)) + list(self.graph.out_edges(node_id)):
                self.graph.edges[u, v]["active"] = False
                self.graph.edges[u, v]["attack_vector"] = False
            return True
        return False

    def patch_node(self, node_id: str) -> bool:
        if node_id in self.graph:
            self.graph.nodes[node_id]["status"] = "NORMAL"
            self.graph.nodes[node_id]["vulnerability"] = "Patched & Validated"
            return True
        return False

    def simulate_custom_attack(self, source_id: str, target_id: str, attack_type: str, ml_service) -> Dict[str, Any]:
        """
        Dynamically propagate an attack from any node to any target in user's custom network graph.
        """
        if source_id not in self.graph or target_id not in self.graph:
            return {"error": "Source or Target node not in network topology."}

        # Find attack path
        try:
            # Try directed path, or treat as undirected if network allows lateral pivoting
            if nx.has_path(self.graph, source_id, target_id):
                path = nx.shortest_path(self.graph, source_id, target_id)
            else:
                undirected = self.graph.to_undirected()
                if nx.has_path(undirected, source_id, target_id):
                    path = nx.shortest_path(undirected, source_id, target_id)
                else:
                    path = [source_id, target_id]  # Direct exploit injection
        except Exception:
            path = [source_id, target_id]

        # Reset active edge flags
        for u, v in self.graph.edges:
            self.graph.edges[u, v]["active"] = False
            self.graph.edges[u, v]["attack_vector"] = False

        # Mark path edges
        for i in range(len(path) - 1):
            u, v = path[i], path[i+1]
            if self.graph.has_edge(u, v):
                self.graph.edges[u, v]["active"] = True
                self.graph.edges[u, v]["attack_vector"] = True
            elif self.graph.has_edge(v, u):
                self.graph.edges[v, u]["active"] = True
                self.graph.edges[v, u]["attack_vector"] = True

        # Update node states
        for node in path[1:-1]:
            if self.graph.nodes[node].get("status") != "ISOLATED":
                self.graph.nodes[node]["status"] = "SUSPICIOUS"
        
        self.graph.nodes[target_id]["status"] = "COMPROMISED"

        # Dynamically infer or weaponize attack pattern based on target asset profile
        target_data = self.graph.nodes[target_id]
        target_vuln = str(target_data.get("vulnerability", "")).lower()
        target_type = target_data.get("type", "SERVER")
        target_label = target_data.get("label", target_id)

        # Intelligent attack pattern mapping
        if not attack_type or attack_type == "AUTO":
            if any(k in target_vuln for k in ["sql", "data", "dump", "exfil", "leak"]):
                attack_type = "DATA_EXFILTRATION"
            elif any(k in target_vuln for k in ["ssh", "brute", "password", "credential", "auth", "kerberos"]):
                attack_type = "BRUTE_FORCE"
            elif any(k in target_vuln for k in ["dos", "ddos", "flood", "reset"]):
                attack_type = "DOS_DDOS"
            elif any(k in target_vuln for k in ["ransom", "encrypt", "lock"]):
                attack_type = "RANSOMWARE_BEACON"
            elif target_type in ["DATABASE", "STORAGE"]:
                attack_type = "DATA_EXFILTRATION"
            elif target_type == "IDENTITY":
                attack_type = "BRUTE_FORCE"
            else:
                attack_type = "LATERAL_MOVEMENT"

        # Generate realistic flow telemetry matching inferred attack type
        if attack_type == "DOS_DDOS":
            dst_port = 443
            flow = {"flow_duration": 0.05, "src_bytes": 14000, "dst_bytes": 120, "src_pkts": 500, "dst_pkts": 2, "syn_count": 480, "ack_count": 0, "failed_logins": 0, "dst_port": dst_port, "byte_rate": 282400, "packet_rate": 10040}
            technique = f"TCP SYN Flooding targeting {target_label} web service (MITRE T1498)"
        elif attack_type == "BRUTE_FORCE":
            dst_port = 22 if "ssh" in target_vuln else (389 if target_type == "IDENTITY" else 3389)
            flow = {"flow_duration": 7.5, "src_bytes": 2800, "dst_bytes": 2100, "src_pkts": 55, "dst_pkts": 48, "syn_count": 22, "ack_count": 18, "failed_logins": 25, "dst_port": dst_port, "byte_rate": 653, "packet_rate": 13}
            technique = f"Automated Credential Spray on port {dst_port} against {target_label} (MITRE T1110)"
        elif attack_type == "DATA_EXFILTRATION":
            dst_port = 5432 if target_type == "DATABASE" else 443
            flow = {"flow_duration": 19.5, "src_bytes": 3500000, "dst_bytes": 15000, "src_pkts": 2200, "dst_pkts": 310, "syn_count": 2, "ack_count": 14, "failed_logins": 0, "dst_port": dst_port, "byte_rate": 180256, "packet_rate": 128}
            technique = f"High-Volume Outbound Data Exfiltration from {target_label} (MITRE T1048)"
        elif attack_type == "RANSOMWARE_BEACON":
            dst_port = 445
            flow = {"flow_duration": 0.8, "src_bytes": 980, "dst_bytes": 740, "src_pkts": 18, "dst_pkts": 15, "syn_count": 1, "ack_count": 2, "failed_logins": 0, "dst_port": dst_port, "byte_rate": 2150, "packet_rate": 41}
            technique = f"Ransomware Encryption Command Beacon across {target_label} (MITRE T1486)"
        else: # LATERAL_MOVEMENT or PORT_SCAN
            dst_port = 445 if "smb" in target_vuln else 8080
            flow = {"flow_duration": 1.5, "src_bytes": 5200, "dst_bytes": 4100, "src_pkts": 75, "dst_pkts": 68, "syn_count": 12, "ack_count": 16, "failed_logins": 4, "dst_port": dst_port, "byte_rate": 6200, "packet_rate": 95}
            technique = f"Lateral SMB/RPC Pivot into {target_label} (MITRE T1021)"

        # Pass through the real ML and SHAP engine!
        detection = ml_service.predict_flow(flow)

        return {
            "source": source_id,
            "target": target_id,
            "attack_type": attack_type,
            "technique": technique,
            "path_traversed": path,
            "compromised_node": target_id,
            "impacted_vulnerability": target_data.get("vulnerability", "Generic exploit"),
            "flow_telemetry": flow,
            "ai_detection": detection,
            "topology": self.get_topology_dict()
        }

# Global Singleton
twin_engine = CyberDigitalTwin()
