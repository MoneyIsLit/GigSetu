"""
GigSetu ML Service
===================
FastAPI-based ML microservice for worker-job matching predictions.
Uses Random Forest and XGBoost classifiers.

IMPORTANT: Current models are trained on SYNTHETIC demo data.
For production, retrain on real historical booking data.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
import joblib
import os
import subprocess
import sys
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

# ---- CNN / image verification imports ----
import cv2
from PIL import Image
import torch
import torchvision.models as tv_models
import torchvision.transforms as transforms

app = FastAPI(
    title='GigSetu ML Service',
    description='AI-powered worker matching predictions',
    version='1.0.0'
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

# Global model variables
rf_model = None
xgb_model = None
models_loaded = False

# CNN feature extractor globals (MobileNetV2, loaded once at startup)
cnn_model = None
cnn_transform = None

class PredictionRequest(BaseModel):
    skill_match: float = Field(ge=0, le=1)
    distance_score: float = Field(ge=0, le=1)
    availability: float = Field(ge=0, le=1)
    workload_balance: float = Field(ge=0, le=1)
    rating: float = Field(ge=0, le=1)

class VerifyWorkPhotoRequest(BaseModel):
    beforeImagePath: str = ''
    afterImagePath:  str

class VerifyWorkPhotoResponse(BaseModel):
    blurryPhoto: bool
    verificationScore: float
    flagged: bool

class PredictionResponse(BaseModel):
    randomForestProbability: float
    xgboostProbability: float
    combinedMLScore: float

class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    model_type: str

@app.on_event('startup')
async def startup_event():
    global rf_model, xgb_model, models_loaded, cnn_model, cnn_transform
    
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    rf_path = os.path.join(models_dir, 'random_forest.joblib')
    xgb_path = os.path.join(models_dir, 'xgboost_model.joblib')
    
    # If models don't exist, generate data and train
    if not os.path.exists(rf_path) or not os.path.exists(xgb_path):
        print('Models not found. Generating training data and training models...')
        training_dir = os.path.join(os.path.dirname(__file__), 'training')
        
        # Generate data
        subprocess.run([sys.executable, os.path.join(training_dir, 'generate_data.py')], check=True)
        
        # Train models
        subprocess.run([sys.executable, os.path.join(training_dir, 'train_models.py')], check=True)
    
    # Load Random Forest + XGBoost models
    try:
        rf_model = joblib.load(rf_path)
        xgb_model = joblib.load(xgb_path)
        models_loaded = True
        print('✅ Models loaded successfully!')
    except Exception as e:
        print(f'⚠️ Error loading models: {e}')
        models_loaded = False

    # Load MobileNetV2 as a fixed CNN feature extractor (no training needed).
    try:
        weights = tv_models.MobileNet_V2_Weights.IMAGENET1K_V1
        _full_model = tv_models.mobilenet_v2(weights=weights)
        # Strip the classifier head — keep only the feature backbone.
        _full_model.classifier = torch.nn.Identity()
        _full_model.eval()
        cnn_model = _full_model

        # Standard ImageNet preprocessing.
        cnn_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])
        print('✅ MobileNetV2 feature extractor loaded!')
    except Exception as e:
        print(f'⚠️ MobileNetV2 load error: {e}')
        cnn_model = None


@app.get('/')
async def root():
    return {
        'service': 'GigSetu ML Service',
        'version': '1.0.0',
        'description': 'AI-powered worker matching predictions using Random Forest and XGBoost',
        'note': 'Models trained on synthetic demo data for prototype purposes'
    }

@app.get('/health', response_model=HealthResponse)
async def health():
    return {
        'status': 'healthy' if models_loaded else 'degraded',
        'models_loaded': models_loaded,
        'model_type': 'Random Forest + XGBoost'
    }

@app.post('/predict', response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    if not models_loaded:
        # Fallback: use weighted formula if models aren't loaded
        weighted = (0.30 * request.skill_match + 0.20 * request.distance_score + 
                   0.15 * request.availability + 0.25 * request.workload_balance + 
                   0.10 * request.rating)
        return {
            'randomForestProbability': round(weighted, 4),
            'xgboostProbability': round(weighted, 4),
            'combinedMLScore': round(weighted, 4)
        }
    
    try:
        features = np.array([[request.skill_match, request.distance_score, 
                             request.availability, request.workload_balance, 
                             request.rating]])
        
        # Get probabilities (probability of class 1 = good match)
        rf_prob = rf_model.predict_proba(features)[0][1]
        xgb_prob = xgb_model.predict_proba(features)[0][1]
        
        # Combined score: equal weight
        combined = 0.5 * rf_prob + 0.5 * xgb_prob
        
        return {
            'randomForestProbability': round(float(rf_prob), 4),
            'xgboostProbability': round(float(xgb_prob), 4),
            'combinedMLScore': round(float(combined), 4)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Prediction error: {str(e)}')


# ---- Helper: extract CNN embedding from an image file ----
def _extract_embedding(image_path: str) -> np.ndarray:
    """Load image from disk and return a 1D MobileNetV2 feature vector."""
    img = Image.open(image_path).convert('RGB')
    tensor = cnn_transform(img).unsqueeze(0)  # shape: (1, 3, 224, 224)
    with torch.no_grad():
        features = cnn_model(tensor)           # shape: (1, 1280) for MobileNetV2
    return features.squeeze().numpy()


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


@app.post('/verify-work-photo', response_model=VerifyWorkPhotoResponse)
async def verify_work_photo(request: VerifyWorkPhotoRequest):
    """
    Verify a proof-of-work photo pair.

    Steps:
      1. Blur check on the after photo (Laplacian variance < 100 → blurry).
      2. MobileNetV2 feature extraction on both photos.
      3. Cosine similarity → verificationScore.
      4. flagged = True if similarity > 0.92 (before/after look almost identical).
    """
    after_path = request.afterImagePath
    before_path = request.beforeImagePath

    # ── 1. Validate file exists ──────────────────────────────────────────────
    if not after_path or not os.path.isfile(after_path):
        raise HTTPException(status_code=422, detail=f'After image not found at path: {after_path}')

    # ── 2. Blur check (Laplacian variance) ──────────────────────────────────
    BLUR_THRESHOLD = 100.0
    try:
        img_bgr = cv2.imread(after_path)
        if img_bgr is None:
            raise ValueError('cv2 could not decode image')
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f'Could not read after image: {exc}')

    if lap_var < BLUR_THRESHOLD:
        return VerifyWorkPhotoResponse(blurryPhoto=True, verificationScore=0.0, flagged=False)

    # ── 3. CNN feature extraction ────────────────────────────────────────────
    if cnn_model is None:
        # CNN unavailable — return neutral result; don't block the worker.
        return VerifyWorkPhotoResponse(blurryPhoto=False, verificationScore=0.5, flagged=False)

    try:
        after_emb = _extract_embedding(after_path)

        if before_path and os.path.isfile(before_path):
            before_emb = _extract_embedding(before_path)
            sim = _cosine_similarity(before_emb, after_emb)
        else:
            # No before photo — cannot compare; return neutral score.
            sim = 0.5

        SIMILARITY_FLAG_THRESHOLD = 0.92
        flagged = sim > SIMILARITY_FLAG_THRESHOLD

        return VerifyWorkPhotoResponse(
            blurryPhoto=False,
            verificationScore=round(sim, 4),
            flagged=flagged,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'CNN verification error: {str(exc)}')


@app.get('/forecast')
async def forecast():
    """Synthetic demo demand forecasting endpoint.
    Replace generated data with real anonymized booking history for production.
    """
    services = ['electrician', 'plumber', 'carpenter', 'cleaner', 'painter', 'gardener', 'applianceRepair', 'delivery', 'farmWorker']
    rng = np.random.default_rng(42)
    X, y = [], []

    for service_idx, service in enumerate(services):
        base = 18 + (service_idx * 3)
        trend = (service_idx % 4) * 0.15
        for day in range(30):
            noise = rng.normal(0, 2.0)
            demand = max(1, base + trend * day + 4 * np.sin(day / 4) + noise)
            X.append([service_idx, day, day % 7])
            y.append(demand)

    X_arr, y_arr = np.array(X), np.array(y)
    rf_forecaster = RandomForestRegressor(n_estimators=120, random_state=42, min_samples_leaf=2)
    xgb_forecaster = XGBRegressor(n_estimators=120, max_depth=3, learning_rate=0.05, subsample=0.9, colsample_bytree=0.9, random_state=42, objective='reg:squarederror')
    rf_forecaster.fit(X_arr, y_arr)
    xgb_forecaster.fit(X_arr, y_arr)

    predictions = []
    for service_idx, service in enumerate(services):
        features = np.array([[service_idx, 30, 2]])
        rf_pred = float(rf_forecaster.predict(features)[0])
        xgb_pred = float(xgb_forecaster.predict(features)[0])
        predicted = 0.5 * rf_pred + 0.5 * xgb_pred
        recent_values = [y[i] for i in range(len(y)) if X[i][0] == service_idx and X[i][1] >= 23]
        recent = float(np.mean(recent_values))
        change = ((predicted - recent) / recent * 100) if recent else 0
        predictions.append({
            'service': service,
            'predictedDemand': round(max(0, predicted), 1),
            'randomForestForecast': round(max(0, rf_pred), 1),
            'xgboostForecast': round(max(0, xgb_pred), 1),
            'recentAverage': round(recent, 1),
            'trendPercent': round(change, 1)
        })

    predictions.sort(key=lambda x: x['predictedDemand'], reverse=True)
    return {
        'model': 'Random Forest + XGBoost Regressors',
        'dataType': 'synthetic demo data',
        'horizon': 'next service-demand period',
        'predictions': predictions
    }


# Run with: python app.py
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
