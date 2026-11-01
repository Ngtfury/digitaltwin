import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score
from app.ml.dataset_generator import generate_benchmark_dataset, FEATURE_COLUMNS, ATTACK_LABELS
from app.ml.shap_explainer import SHAPExplainerService

class MLThreatDetector:
    def __init__(self):
        self.iso_forest = None
        self.rf_classifier = None
        self.shap_service = None
        self.classes_ = ATTACK_LABELS
        self.metrics = {
            "accuracy": 0.942,
            "precision": 0.924,
            "recall": 0.895,
            "f1_score": 0.909,
            "training_samples": 5000,
            "models_ready": False
        }
        self._initialize_models()

    def _initialize_models(self):
        """Train or load models on realistic CICIDS2017/UNSW-NB15 benchmark telemetry."""
        df_x, s_y = generate_benchmark_dataset(n_samples=4000)
        X = df_x[FEATURE_COLUMNS].values
        y = s_y.values

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

        # 1. Unsupervised Outlier Detection (Isolation Forest)
        # Train solely on Benign flows from train split
        benign_mask = (y_train == "BENIGN")
        self.iso_forest = IsolationForest(
            n_estimators=100,
            contamination=0.08,
            random_state=42,
            n_jobs=-1
        )
        self.iso_forest.fit(X_train[benign_mask])

        # 2. Multi-Class Classifier (Random Forest)
        self.rf_classifier = RandomForestClassifier(
            n_estimators=120,
            max_depth=12,
            random_state=42,
            n_jobs=-1
        )
        self.rf_classifier.fit(X_train, y_train)

        # Evaluate performance on test set
        y_pred = self.rf_classifier.predict(X_test)
        # Binary anomaly check (Attack vs Benign) for precision/recall benchmark
        binary_true = (y_test != "BENIGN").astype(int)
        binary_pred = (y_pred != "BENIGN").astype(int)

        self.metrics = {
            "accuracy": round(float(accuracy_score(binary_true, binary_pred)), 4),
            "precision": round(float(precision_score(binary_true, binary_pred, zero_division=0)), 4),
            "recall": round(float(recall_score(binary_true, binary_pred, zero_division=0)), 4),
            "f1_score": round(float(f1_score(binary_true, binary_pred, zero_division=0)), 4),
            "training_samples": len(X_train),
            "models_ready": True
        }

        # Initialize SHAP Service
        self.shap_service = SHAPExplainerService(
            model=self.rf_classifier,
            feature_names=FEATURE_COLUMNS,
            background_data=X_train
        )

    def predict_flow(self, flow_data: dict) -> dict:
        """
        Evaluate a single network packet/flow through the dual-model AI pipeline.
        """
        # Ensure all features exist
        features = [float(flow_data.get(col, 0.0)) for col in FEATURE_COLUMNS]
        x_inst = np.array(features).reshape(1, -1)

        # 1. Isolation Forest Anomaly Score
        # decision_function gives negative for outliers, positive for inliers
        raw_score = float(self.iso_forest.decision_function(x_inst)[0])
        is_outlier = bool(self.iso_forest.predict(x_inst)[0] == -1)
        # Normalize anomaly score from 0.0 (safe) to 1.0 (extreme anomaly)
        anomaly_score = round(float(np.clip(1.0 - (raw_score + 0.5), 0.0, 1.0)), 3)

        # 2. Supervised Attack Classification
        probs = self.rf_classifier.predict_proba(x_inst)[0]
        class_idx = int(np.argmax(probs))
        predicted_attack = str(self.rf_classifier.classes_[class_idx])
        confidence = round(float(probs[class_idx]), 3)

        # If Isolation forest strongly flagged anomaly, ensure classification captures elevated risk
        if is_outlier and predicted_attack == "BENIGN":
            predicted_attack = "UNKNOWN_ANOMALOUS_OUTLIER"

        # 3. SHAP Feature Attribution
        shap_explanations = []
        if self.shap_service and predicted_attack != "BENIGN":
            # Pass corresponding class index for tree explainers
            shap_explanations = self.shap_service.explain_instance(x_inst, class_idx)

        return {
            "is_anomaly": predicted_attack != "BENIGN",
            "predicted_attack": predicted_attack,
            "confidence": confidence,
            "anomaly_score": anomaly_score,
            "is_zero_day_outlier": is_outlier,
            "class_probabilities": {
                cls: round(float(prob), 3)
                for cls, prob in zip(self.rf_classifier.classes_, probs)
            },
            "shap_attributions": shap_explanations
        }

# Global Singleton
ml_service = MLThreatDetector()

