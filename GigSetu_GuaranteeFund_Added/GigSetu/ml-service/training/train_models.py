"""
GigSetu ML Model Training
===========================
Trains Random Forest and XGBoost classifiers on synthetic data.
For production: retrain on real historical booking data.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from xgboost import XGBClassifier
import joblib
import os

def train_models():
    print("=" * 40)
    print("GigSetu ML Model Training")
    print("=" * 40)
    
    # 1. Load data
    training_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(training_dir, 'training_data.csv')
    
    if not os.path.exists(data_path):
        print(f"Error: Training data not found at {data_path}")
        return
        
    df = pd.read_csv(data_path)
    
    # 2. Split features and target
    X = df[['skill_match', 'distance_score', 'availability', 'workload_balance', 'rating']]
    y = df['good_match']
    
    # 3. Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Create models directory
    models_dir = os.path.join(os.path.dirname(training_dir), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    # 4. Train Random Forest
    print("\nTraining Random Forest...")
    rf_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    rf_model.fit(X_train, y_train)
    
    rf_preds = rf_model.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_preds)
    print(f"Random Forest Accuracy: {rf_acc:.4f}")
    print("Random Forest Classification Report:")
    print(classification_report(y_test, rf_preds))
    
    rf_path = os.path.join(models_dir, 'random_forest.joblib')
    joblib.dump(rf_model, rf_path)
    
    # 5. Train XGBoost
    print("\nTraining XGBoost...")
    xgb_model = XGBClassifier(
        n_estimators=100, 
        max_depth=6, 
        learning_rate=0.1, 
        random_state=42, 
        eval_metric='logloss'
    )
    xgb_model.fit(X_train, y_train)
    
    xgb_preds = xgb_model.predict(X_test)
    xgb_acc = accuracy_score(y_test, xgb_preds)
    print(f"XGBoost Accuracy: {xgb_acc:.4f}")
    print("XGBoost Classification Report:")
    print(classification_report(y_test, xgb_preds))
    
    xgb_path = os.path.join(models_dir, 'xgboost_model.joblib')
    joblib.dump(xgb_model, xgb_path)
    
    # 6. Summary
    print("=" * 40)
    print("Training Complete Summary")
    print("=" * 40)
    print(f"Random Forest Accuracy: {rf_acc:.4f}")
    print(f"XGBoost Accuracy:       {xgb_acc:.4f}")
    print(f"Models saved to:        {models_dir}")

if __name__ == "__main__":
    train_models()
