# AI-Driven Cyber Digital Twin Framework for Security Threat Simulation and Compliance Optimization

[![IEEE Reference](https://img.shields.io/badge/IEEE-ICCST_2025_Reference-blue)](https://doi.org/10.1109/ICCST63435.2025.11293889)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16_(React_19)-black?logo=next.js)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://python.org)
[![XAI](https://img.shields.io/badge/Explainability-SHAP_TreeExplainer-orange)](https://shap.readthedocs.io/)

A production-grade implementation of the IEEE ICCST 2025 research framework uniting **Cyber Digital Twins**, **Dual-Model AI Threat Detection (CICIDS2017 & UNSW-NB15)**, **SHAP Explainable AI (XAI)**, and **Continuous Compliance Automation (NIST CSF, ISO/IEC 27001, AICPA SOC 2)**.

---

## 🚀 Key Innovations & Architecture

1. **Role-Based Access Control (RBAC)**:
   - Token-based JWT authentication with scoped roles:
     - `admin`: System management, pipeline orchestration, model retraining.
     - `security_analyst`: Interactive threat simulation, anomaly inspection, SHAP triage.
     - `compliance_auditor`: Continuous compliance posture verification, cryptographically hashed evidence retrieval.

2. **Dual-Model AI Threat Detection Pipeline**:
   - **Unsupervised Zero-Day Outlier Detection**: Isolation Forest modeling normal spatial densities.
   - **Supervised Multi-Class Classifier**: Random Forest calibrated on flow telemetry features (duration, byte rate, packet rate, SYN/ACK distribution, port signatures).
   - **SHAP (Shapley Additive exPlanations)**: Exact Shapley feature attributions revealing mathematical justification for why each alert was triggered.

3. **Graph-Based Cyber Digital Twin**:
   - In-memory `NetworkX` topology representing perimeter firewalls, cloud gateways, DMZ web services, internal core servers, IoT hubs, Active Directory/IAM domain controllers, database clusters, and cloud backup buckets.
   - Dynamic node states (`NORMAL`, `SUSPICIOUS`, `COMPROMISED`, `ISOLATED`).
   - Real-time blast-radius calculation and active attack vector visualization.

4. **Adversarial "What-If" Threat Simulation**:
   - **Scenario 1**: Supply Chain & Cloud Misconfiguration $\rightarrow$ Internal Lateral Movement $\rightarrow$ IoT Pivot $\rightarrow$ Domain Privilege Escalation $\rightarrow$ Data Exfiltration.
   - **Scenario 2**: Ransomware Infiltration $\rightarrow$ Rapid SMB Lateral Spread $\rightarrow$ Database Encryption $\rightarrow$ Backup Deletion.
   - **Proactive Defenses**: Quarantine Breached Nodes (Network Segmentation) and Automated Patching/Remediation.

5. **Automated Continuous Compliance**:
   - Real-time mapping against:
     - **NIST CSF**: `DE.AE-1` (Baseline Anomalies), `DE.AE-2` (Event Analysis), `PR.AC-4` (Least Privilege), `RS.MI-1` (Mitigation).
     - **ISO/IEC 27001 (Annex A)**: `A.9.2` (Access Control), `A.12.4` (Logging & Monitoring), `A.16.1` (Incident Management), `A.13.1` (Network Segregation).
     - **AICPA SOC 2**: `CC6.1` (Logical Protection), `CC7.2` (Incident Monitoring).
   - Automated generation of downloadable, cryptographically signed (`SHA-256`) audit evidence packages.

---

## 📊 Empirical Evaluation & Base Paper Validation (Table I)

| Metric | Traditional SIEM | Modern SOAR | Proposed Cyber Digital Twin | Research Advantage |
| :--- | :---: | :---: | :---: | :---: |
| **Incident Triage Time** | 12.0 ± 0.8 min | 9.5 ± 0.7 min | **7.8 ± 0.5 min** | **35% faster triage** |
| **Compliance Reporting Time** | 5.0 ± 0.4 hrs | 4.2 ± 0.3 hrs | **3.0 ± 0.3 hrs** | **40% faster compliance** |
| **Detection Precision** | 83 ± 2.1% | 87 ± 1.7% | **92.4 ± 1.5%** | **Lower false positives** |
| **Detection Recall** | 78 ± 2.4% | 84 ± 1.9% | **89.5 ± 1.8%** | **Catches stealth attacks** |
| **ISO 27001 Control Coverage** | 0% | 12% | **20%** | **Continuous validation** |
| **Hourly Operational Cost** | $100 ± $4 | $88 ± $3 | **$78 ± $3** | **22% cost reduction** |

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ (tested on Node v24)
- NPM

### 2. Single-Command Launch (Recommended)
Simply run the launcher from the project root:

**Windows**:
```cmd
run.bat
```
or
```powershell
python run_system.py
```

**Linux / macOS**:
```bash
chmod +x run.sh
./run.sh
```

This single command starts:
- **FastAPI Backend**: `http://127.0.0.1:8000` (OpenAPI Docs at `/docs`)
- **Next.js Frontend**: `http://localhost:3000`
- Automatically opens the executive SOC dashboard in your default browser!

---

## 🔑 Pre-Configured Test Accounts (RBAC)

| Role | Username | Password | Permissions & Views |
| :--- | :--- | :--- | :--- |
| **Security Analyst** | `analyst` | `AnalystPassword123!` | Threat simulation, live stream triage, SHAP explanations, topology defense. |
| **Compliance Auditor** | `auditor` | `AuditorPassword123!` | Continuous compliance posture, regulatory matrix, cryptographic audit export. |
| **System Administrator** | `admin` | `AdminPassword123!` | Full privileges, system reset, user provisioning, pipeline control. |

*(The dashboard automatically authenticates you as the Analyst on first visit for zero-friction evaluation; you can switch accounts anytime from the top bar!)*

---

## 📁 Repository Structure

```
digitaltwin/
├── backend/
│   ├── app/
│   │   ├── auth/            # JWT & RBAC security dependencies
│   │   ├── compliance/      # NIST, ISO 27001, SOC 2 evaluator & evidence vault
│   │   ├── ml/              # Isolation Forest, Random Forest & SHAP Explainer
│   │   ├── models/          # SQLAlchemy DB models (User, Incident, Evidence)
│   │   ├── routers/         # REST API endpoints (Auth, Twin, Sim, AI, Comp)
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── twin/            # Cyber Digital Twin graph & attack scenarios
│   │   ├── config.py        # Environment settings & secrets
│   │   ├── database.py      # SQLite connection & session maker
│   │   └── main.py          # FastAPI application entry point
│   └── requirements.txt
├── frontend/                # Modern Next.js 16 (React 19) App Router
│   ├── app/
│   │   ├── components/      # UI components (Canvas, Controls, XAI, Compliance)
│   │   ├── globals.css      # Dark-mode cybersecurity theme
│   │   ├── layout.tsx       # Root layout & typography
│   │   ├── page.tsx         # Executive SOC dashboard controller
│   │   └── types.ts         # TypeScript interfaces
│   └── package.json
├── run_system.py            # Orchestrated one-click dual launcher
├── run.bat                  # Windows batch launcher
├── run.sh                   # Linux/macOS shell launcher
└── README.md
```

---

## 🛡️ License & Reference
Based on the research paper:  
*Vivek Venkatesan, Chakkaravarthy Arunachalam*, **"AI-Driven Digital Twin Framework for Security Threat Simulation and Compliance Optimization"**, *IEEE International Carnahan Conference on Security Technology (ICCST)*.

