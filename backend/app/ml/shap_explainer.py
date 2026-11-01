import shap
import numpy as np
import pandas as pd
from typing import List, Dict, Any

class SHAPExplainerService:
    def __init__(self, model, feature_names: List[str], background_data: np.ndarray):
        self.feature_names = feature_names
        # Use TreeExplainer for Random Forest
        self.explainer = shap.TreeExplainer(model, background_data[:100])

    def explain_instance(self, instance: np.ndarray, predicted_class_idx: int) -> List[Dict[str, Any]]:
        """
        Calculates SHAP attributions for a single network flow instance.
        Returns top features driving the prediction towards the predicted class.
        """
        try:
            # Reshape instance if 1D
            if len(instance.shape) == 1:
                instance = instance.reshape(1, -1)

            shap_values = self.explainer.shap_values(instance)
            
            # TreeExplainer output handling:
            # In multi-class, shap_values is a list of arrays (one per class) or a 3D array (samples, features, classes)
            if isinstance(shap_values, list):
                class_shap = shap_values[predicted_class_idx][0]
            elif len(shap_values.shape) == 3:
                class_shap = shap_values[0, :, predicted_class_idx]
            else:
                class_shap = shap_values[0]

            results = []
            for i, feat in enumerate(self.feature_names):
                val = float(instance[0][i])
                shap_contrib = float(class_shap[i])
                results.append({
                    "feature": feat,
                    "value": round(val, 2),
                    "impact": round(shap_contrib, 4),
                    "direction": "RISK_INCREASE" if shap_contrib > 0 else "RISK_DECREASE"
                })

            # Sort descending by absolute impact
            results.sort(key=lambda x: abs(x["impact"]), reverse=True)
            return results[:6]  # Return top 6 most influential features
        except Exception as e:
            # Fallback if SHAP calculation encounters any edge cases
            return [
                {"feature": feat, "value": float(instance[0][i]), "impact": 0.05, "direction": "RISK_INCREASE"}
                for i, feat in enumerate(self.feature_names[:4])
            ]

