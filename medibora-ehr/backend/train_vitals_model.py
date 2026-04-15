# backend/train_vitals_model.py
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score
import joblib
import json
from app.ai.vitals_risk_model import VitalsRiskPredictor

def train_vitals_model(csv_path='training_data.csv'):
    """
    Train the vitals risk model using CSV data
    CSV should have columns matching your sample
    """
    print("="*60)
    print("Training Vitals Risk Model")
    print("="*60)
    
    # Load data
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} records")
    
    # Prepare target
    df['risk_target'] = (df['Risk Category'] == 'High Risk').astype(int)
    print(f"Class distribution: {df['risk_target'].value_counts().to_dict()}")
    
    # Feature columns
    feature_columns = [
        'Heart Rate', 'Respiratory Rate', 'Body Temperature',
        'Oxygen Saturation', 'Systolic Blood Pressure', 'Diastolic Blood Pressure',
        'Age', 'Derived_HRV', 'Derived_Pulse_Pressure', 'Derived_BMI', 'Derived_MAP'
    ]
    
    # Add gender
    df['Gender_encoded'] = (df['Gender'] == 'Male').astype(int)
    feature_columns.append('Gender_encoded')
    
    X = df[feature_columns]
    y = df['risk_target']
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train
    model = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    print("\nModel Performance:")
    print(f"Accuracy: {model.score(X_test_scaled, y_test):.3f}")
    print(f"ROC-AUC: {roc_auc_score(y_test, y_pred_proba):.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Low Risk', 'High Risk']))
    
    # Save artifacts in the ai directory
    ai_dir = Path(__file__).parent / 'app' / 'ai'
    ai_dir.mkdir(exist_ok=True)
    
    joblib.dump(model, ai_dir / 'vitals_risk_model.pkl')
    joblib.dump(scaler, ai_dir / 'feature_scaler.pkl')
    
    with open(ai_dir / 'feature_columns.json', 'w') as f:
        json.dump(feature_columns, f)
    
    print(f"\n✅ Model saved to {ai_dir}/vitals_risk_model.pkl")
    print("\nTraining complete! Restart Flask to load the new model.")

if __name__ == '__main__':
    import sys
    csv_file = sys.argv[1] if len(sys.argv) > 1 else 'training_data.csv'
    train_vitals_model(csv_file)