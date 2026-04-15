# backend/app/ai/vitals_risk_model.py
import joblib
import numpy as np
import pandas as pd
import json
import os
from datetime import datetime
from pathlib import Path

class VitalsRiskPredictor:
    """Vitals-based risk prediction using trained Logistic Regression/Random Forest"""
    
    def __init__(self):
        # Get the absolute path to the AI module directory
        self.ai_dir = Path(__file__).parent
        
        # Load model and artifacts
        model_path = self.ai_dir / 'vitals_risk_model.pkl'
        features_path = self.ai_dir / 'feature_columns.json'
        scaler_path = self.ai_dir / 'feature_scaler.pkl'
        
        # Check if model exists (will be created during training)
        if model_path.exists():
            self.model = joblib.load(model_path)
            with open(features_path, 'r') as f:
                self.feature_columns = json.load(f)
            
            # Load scaler if it exists (for Logistic Regression)
            self.scaler = joblib.load(scaler_path) if scaler_path.exists() else None
            self.is_trained = True
        else:
            self.is_trained = False
            print("Warning: Vitals risk model not trained yet. Run training script first.")
    
    def extract_features_from_vitals(self, vital_signs_record):
        """
        Convert vital signs record to feature vector
        vital_signs_record: dict from vital_signs table or API
        """
        # Calculate derived features
        pulse_pressure = vital_signs_record.get('systolic_bp', 0) - vital_signs_record.get('diastolic_bp', 0)
        map_value = vital_signs_record.get('diastolic_bp', 0) + (pulse_pressure / 3)
        
        # BMI calculation (if height and weight available)
        bmi = 25.0  # default
        if vital_signs_record.get('weight') and vital_signs_record.get('height'):
            bmi = vital_signs_record['weight'] / (vital_signs_record['height'] ** 2)
        
        features = {
            'Heart Rate': vital_signs_record.get('heart_rate', 75),
            'Respiratory Rate': vital_signs_record.get('respiratory_rate', 16),
            'Body Temperature': vital_signs_record.get('temperature', 36.8),
            'Oxygen Saturation': vital_signs_record.get('oxygen_saturation', 97),
            'Systolic Blood Pressure': vital_signs_record.get('systolic_bp', 120),
            'Diastolic Blood Pressure': vital_signs_record.get('diastolic_bp', 80),
            'Age': vital_signs_record.get('age', 50),
            'Derived_HRV': vital_signs_record.get('heart_rate_variability', 0.1),
            'Derived_Pulse_Pressure': pulse_pressure,
            'Derived_BMI': bmi,
            'Derived_MAP': map_value,
            'Gender_encoded': 1 if vital_signs_record.get('gender') == 'Male' else 0
        }
        
        return features
    
    def predict(self, vital_signs_record):
        """
        Predict risk from vital signs
        Returns: dict with risk assessment
        """
        if not self.is_trained:
            # Fallback to rule-based assessment if model not trained
            return self._rule_based_fallback(vital_signs_record)
        
        # Extract features
        features = self.extract_features_from_vitals(vital_signs_record)
        
        # Create DataFrame with proper column order
        X = pd.DataFrame([features])[self.feature_columns]
        
        # Scale if scaler exists
        if self.scaler:
            X_scaled = self.scaler.transform(X)
        else:
            X_scaled = X.values
        
        # Predict probability
        risk_probability = self.model.predict_proba(X_scaled)[0][1]
        
        # Clinical interpretation
        if risk_probability >= 0.7:
            risk_level = "HIGH RISK"
            recommendation = "Immediate clinical review required"
            color_code = "danger"
            action_required = True
        elif risk_probability >= 0.4:
            risk_level = "MODERATE RISK"
            recommendation = "Monitor closely, consider follow-up within 24 hours"
            color_code = "warning"
            action_required = False
        else:
            risk_level = "LOW RISK"
            recommendation = "Routine care, no immediate action needed"
            color_code = "success"
            action_required = False
        
        return {
            'risk_score': float(risk_probability),
            'risk_percentage': f"{risk_probability * 100:.1f}%",
            'risk_level': risk_level,
            'recommendation': recommendation,
            'color_code': color_code,
            'action_required': action_required,
            'model_used': 'trained_ml_model',
            'timestamp': datetime.now().isoformat()
        }
    
    def _rule_based_fallback(self, vital_signs_record):
        """Fallback clinical rules when ML model not available"""
        risk_score = 0
        reasons = []
        
        # Clinical rules (based on NEWS2 criteria)
        hr = vital_signs_record.get('heart_rate', 75)
        if hr > 120 or hr < 50:
            risk_score += 0.3
            reasons.append(f"Abnormal heart rate: {hr}")
        
        sbp = vital_signs_record.get('systolic_bp', 120)
        if sbp > 180 or sbp < 90:
            risk_score += 0.3
            reasons.append(f"Abnormal blood pressure: {sbp}")
        
        spo2 = vital_signs_record.get('oxygen_saturation', 97)
        if spo2 < 92:
            risk_score += 0.4
            reasons.append(f"Low oxygen saturation: {spo2}%")
        
        temp = vital_signs_record.get('temperature', 36.8)
        if temp > 38.5 or temp < 35.5:
            risk_score += 0.3
            reasons.append(f"Abnormal temperature: {temp}°C")
        
        # Cap risk score at 0.95
        risk_score = min(risk_score, 0.95)
        
        if risk_score >= 0.6:
            risk_level = "HIGH RISK"
            color_code = "danger"
        elif risk_score >= 0.3:
            risk_level = "MODERATE RISK"
            color_code = "warning"
        else:
            risk_level = "LOW RISK"
            color_code = "success"
        
        return {
            'risk_score': risk_score,
            'risk_percentage': f"{risk_score * 100:.1f}%",
            'risk_level': risk_level,
            'recommendation': f"Abnormal findings: {', '.join(reasons)}" if reasons else "Vitals within normal range",
            'color_code': color_code,
            'action_required': risk_score >= 0.6,
            'model_used': 'rule_based_fallback',
            'abnormal_findings': reasons,
            'timestamp': datetime.now().isoformat()
        }

# Singleton instance
vitals_risk_predictor = VitalsRiskPredictor()