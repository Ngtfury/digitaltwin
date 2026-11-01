import numpy as np
import pandas as pd
from typing import Tuple, List

FEATURE_COLUMNS = [
    "flow_duration",
    "src_bytes",
    "dst_bytes",
    "src_pkts",
    "dst_pkts",
    "syn_count",
    "ack_count",
    "failed_logins",
    "dst_port",
    "byte_rate",
    "packet_rate"
]

ATTACK_LABELS = [
    "BENIGN",
    "DOS_DDOS",
    "PORT_SCAN",
    "BRUTE_FORCE",
    "LATERAL_MOVEMENT",
    "DATA_EXFILTRATION",
    "RANSOMWARE_BEACON"
]

def generate_benchmark_dataset(n_samples: int = 5000) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Synthesize realistic network flow data matching CICIDS2017 & UNSW-NB15 distributions.
    """
    np.random.seed(42)
    rows = []
    labels = []

    # 60% Benign, 40% Distributed attacks
    n_benign = int(n_samples * 0.6)
    n_attacks = n_samples - n_benign

    # 1. Benign Traffic
    for _ in range(n_benign):
        dur = np.random.exponential(scale=2.5) + 0.05
        s_pkts = int(np.random.poisson(lam=12) + 1)
        d_pkts = int(np.random.poisson(lam=15) + 1)
        s_bytes = int(s_pkts * np.random.normal(loc=120, scale=40) + 64)
        d_bytes = int(d_pkts * np.random.normal(loc=450, scale=100) + 128)
        syn = int(np.random.choice([1, 2], p=[0.9, 0.1]))
        ack = int(syn + np.random.poisson(lam=2))
        port = int(np.random.choice([80, 443, 53, 8080, 8443], p=[0.3, 0.5, 0.1, 0.05, 0.05]))
        byte_rate = (s_bytes + d_bytes) / dur
        pkt_rate = (s_pkts + d_pkts) / dur
        
        rows.append([dur, s_bytes, d_bytes, s_pkts, d_pkts, syn, ack, 0, port, byte_rate, pkt_rate])
        labels.append("BENIGN")

    # 2. Attacks
    attack_types = ["DOS_DDOS", "PORT_SCAN", "BRUTE_FORCE", "LATERAL_MOVEMENT", "DATA_EXFILTRATION", "RANSOMWARE_BEACON"]
    for _ in range(n_attacks):
        atk = np.random.choice(attack_types)
        labels.append(atk)

        if atk == "DOS_DDOS":
            dur = np.random.exponential(scale=0.1) + 0.01
            s_pkts = int(np.random.randint(200, 1500))
            d_pkts = int(np.random.randint(0, 5))
            s_bytes = int(s_pkts * 64)
            d_bytes = int(d_pkts * 40)
            syn = int(s_pkts * 0.95)
            ack = 0
            port = int(np.random.choice([80, 443, 8080]))
        elif atk == "PORT_SCAN":
            dur = np.random.uniform(0.005, 0.05)
            s_pkts = int(np.random.randint(1, 4))
            d_pkts = 0
            s_bytes = int(s_pkts * 44)
            d_bytes = 0
            syn = s_pkts
            ack = 0
            port = int(np.random.randint(1, 65535))
        elif atk == "BRUTE_FORCE":
            dur = np.random.uniform(1.0, 15.0)
            s_pkts = int(np.random.randint(30, 120))
            d_pkts = int(np.random.randint(25, 110))
            s_bytes = int(s_pkts * 85)
            d_bytes = int(d_pkts * 70)
            syn = int(np.random.randint(10, 40))
            ack = int(syn * 0.8)
            failed = int(np.random.randint(8, 35))
            port = int(np.random.choice([22, 3389, 445]))
            byte_rate = (s_bytes + d_bytes) / dur
            pkt_rate = (s_pkts + d_pkts) / dur
            rows.append([dur, s_bytes, d_bytes, s_pkts, d_pkts, syn, ack, failed, port, byte_rate, pkt_rate])
            continue
        elif atk == "LATERAL_MOVEMENT":
            dur = np.random.uniform(0.5, 4.0)
            s_pkts = int(np.random.randint(40, 200))
            d_pkts = int(np.random.randint(35, 180))
            s_bytes = int(s_pkts * 150)
            d_bytes = int(d_pkts * 120)
            syn = int(np.random.randint(5, 15))
            ack = int(syn + 5)
            port = int(np.random.choice([445, 135, 3389, 5985]))  # SMB, RPC, RDP, WinRM
        elif atk == "DATA_EXFILTRATION":
            dur = np.random.uniform(5.0, 30.0)
            s_pkts = int(np.random.randint(500, 3000))
            d_pkts = int(np.random.randint(100, 500))
            s_bytes = int(np.random.randint(500000, 5000000))  # Huge outbound byte volume
            d_bytes = int(d_pkts * 64)
            syn = 2
            ack = 10
            port = int(np.random.choice([443, 8443, 53, 9001]))
        elif atk == "RANSOMWARE_BEACON":
            dur = np.random.uniform(0.1, 1.0)
            s_pkts = int(np.random.randint(5, 20))
            d_pkts = int(np.random.randint(5, 20))
            s_bytes = int(s_pkts * 256)
            d_bytes = int(d_pkts * 256)
            syn = 1
            ack = 1
            port = int(np.random.choice([443, 8080, 445]))

        failed = 0
        byte_rate = (s_bytes + d_bytes) / max(dur, 0.001)
        pkt_rate = (s_pkts + d_pkts) / max(dur, 0.001)
        rows.append([dur, s_bytes, d_bytes, s_pkts, d_pkts, syn, ack, failed, port, byte_rate, pkt_rate])

    df = pd.DataFrame(rows, columns=FEATURE_COLUMNS)
    y = pd.Series(labels, name="label")
    return df, y

