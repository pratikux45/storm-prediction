"""
India Storm Prediction — Production ML Service
==============================================
Standalone FastAPI microservice exposing ML model inference.
Run with:  uvicorn backend.ml_service:app --port 8001 --reload
           OR from the project root: python -m uvicorn backend.ml_service:app --port 8001
"""

import os
import json
import joblib
import numpy as np
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ML_DIR   = os.path.join(BASE_DIR, "ml_models")

# ─── Risk labels ──────────────────────────────────────────────────────────────
RISK_LABELS = {0: "Low Risk", 1: "Moderate Risk", 2: "High Risk"}

# ─── Load models ─────────────────────────────────────────────────────────────
_MODEL_FILES = {
    "Random Forest":       "storm_predictor_random_forest.pkl",
    "Logistic Regression": "storm_predictor_logistic_regression.pkl",
    "Gradient Boosting":   "storm_predictor_gradient_boosting.pkl",
}

loaded_models: Dict[str, Any] = {}
load_errors:   Dict[str, str] = {}

for model_name, filename in _MODEL_FILES.items():
    path = os.path.join(ML_DIR, filename)
    try:
        loaded_models[model_name] = joblib.load(path)
        print(f"[ML Service] ✅ Loaded {model_name}")
    except Exception as e:
        load_errors[model_name] = str(e)
        print(f"[ML Service] ⚠️  Could not load {model_name}: {e}")

# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="India Storm Prediction — ML Service",
    description=(
        "Production-ready ML microservice for storm risk prediction. "
        "Supports 3 models: Random Forest, Logistic Regression, Gradient Boosting."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Schemas ─────────────────────────────────────────────────────────────────
class WeatherInput(BaseModel):
    temperature:   float = Field(..., ge=-10, le=60,  description="Temperature in °C")
    humidity:      float = Field(..., ge=0,   le=100, description="Relative humidity %")
    wind_speed:    float = Field(..., ge=0,   le=150, description="Wind speed in mph")
    precipitation: float = Field(0.0, ge=0,  le=500, description="Precipitation in mm")

    model_name: Optional[str] = Field(
        "Gradient Boosting",
        description="Model to use: 'Random Forest', 'Logistic Regression', or 'Gradient Boosting'"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "temperature": 38.5,
                "humidity": 85.0,
                "wind_speed": 30.0,
                "precipitation": 12.0,
                "model_name": "Gradient Boosting"
            }
        }


class BatchWeatherInput(BaseModel):
    inputs:     List[WeatherInput]
    model_name: Optional[str] = "Gradient Boosting"

    class Config:
        json_schema_extra = {
            "example": {
                "model_name": "Random Forest",
                "inputs": [
                    {"temperature": 38, "humidity": 85, "wind_speed": 30, "precipitation": 12},
                    {"temperature": 25, "humidity": 55, "wind_speed": 8,  "precipitation": 0},
                ]
            }
        }


# ─── Helpers ─────────────────────────────────────────────────────────────────
def _build_features(inp: WeatherInput) -> np.ndarray:
    return np.array([[inp.temperature, inp.humidity, inp.wind_speed, inp.precipitation]])


def _predict_single(features: np.ndarray, model_name: str) -> dict:
    """Run inference on one set of features using the specified model."""
    model = loaded_models.get(model_name)
    if model is None:
        # Fallback to any available model
        if loaded_models:
            model_name = next(iter(loaded_models))
            model = loaded_models[model_name]
        else:
            raise HTTPException(status_code=503, detail="No ML models are currently loaded.")

    prediction_int = int(model.predict(features)[0])
    probabilities  = model.predict_proba(features)[0]
    confidence     = round(float(max(probabilities)) * 100, 2)
    risk_label     = RISK_LABELS[prediction_int]

    return {
        "prediction":       risk_label,
        "prediction_code":  prediction_int,
        "confidence":       confidence,
        "storm_probability": confidence if risk_label != "Low Risk" else round(100 - confidence, 2),
        "model_used":       model_name,
        "probabilities": {
            "Low Risk":      round(float(probabilities[0]) * 100, 2),
            "Moderate Risk": round(float(probabilities[1]) * 100, 2),
            "High Risk":     round(float(probabilities[2]) * 100, 2),
        },
    }


def _all_models_consensus(features: np.ndarray) -> dict:
    """Get prediction from every loaded model for cross-model consensus."""
    consensus = {}
    for name, model in loaded_models.items():
        pred_int  = int(model.predict(features)[0])
        probs     = model.predict_proba(features)[0]
        consensus[name] = {
            "prediction": RISK_LABELS[pred_int],
            "confidence": round(float(max(probs)) * 100, 2),
        }
    return consensus


# ─── Endpoints ───────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health_check():
    """Health check — returns load status for every model."""
    return {
        "status":        "ok" if loaded_models else "degraded",
        "timestamp":     datetime.utcnow().isoformat() + "Z",
        "loaded_models": list(loaded_models.keys()),
        "failed_models": load_errors,
        "model_count":   len(loaded_models),
    }


@app.get("/models", tags=["Models"])
def list_models():
    """List all available ML models and their load status."""
    return {
        "available_models": list(loaded_models.keys()),
        "model_details": {
            name: {
                "status":     "loaded",
                "type":       type(model).__name__,
                "features":   ["temperature", "humidity", "wind_speed", "precipitation"],
                "classes":    list(RISK_LABELS.values()),
            }
            for name, model in loaded_models.items()
        },
        "failed_to_load": load_errors,
    }


@app.get("/model-performance", tags=["Models"])
def get_model_performance():
    """
    Return saved evaluation metrics (accuracy, precision, recall, F1)
    for all trained models, plus cross-validation history.
    """
    metrics_path = os.path.join(ML_DIR, "model_metrics.json")
    history_path = os.path.join(ML_DIR, "training_history.json")

    if not os.path.exists(metrics_path):
        raise HTTPException(
            status_code=404,
            detail="model_metrics.json not found. Run ml/train_model.py first."
        )

    with open(metrics_path, "r") as f:
        metrics = json.load(f)

    training_history = {}
    if os.path.exists(history_path):
        with open(history_path, "r") as f:
            training_history = json.load(f)

    # Determine best model by F1
    best = max(metrics, key=lambda m: m["f1_score"])

    return {
        "models":       metrics,
        "best_model":   best["model_name"],
        "summary": {
            m["model_name"]: {
                "accuracy":  round(m["accuracy"]  * 100, 2),
                "precision": round(m["precision"] * 100, 2),
                "recall":    round(m["recall"]    * 100, 2),
                "f1_score":  round(m["f1_score"]  * 100, 2),
            }
            for m in metrics
        },
        "training_history": training_history,
        "dataset_info": {
            "total_samples":    5000,
            "train_samples":    4000,
            "test_samples":     1000,
            "features":         ["temperature", "humidity", "wind_speed", "precipitation"],
            "classes":          list(RISK_LABELS.values()),
            "class_weights":    {"Low Risk": "50%", "Moderate Risk": "35%", "High Risk": "15%"},
        },
    }


@app.post("/predict", tags=["Prediction"])
def predict(request: WeatherInput):
    """
    Single storm-risk prediction.

    Returns the predicted risk level, confidence score, per-class probabilities,
    and a cross-model consensus breakdown.
    """
    model_name = request.model_name or "Gradient Boosting"
    features   = _build_features(request)

    result = _predict_single(features, model_name)
    consensus = _all_models_consensus(features)

    return {
        **result,
        "features_used": {
            "temperature":   request.temperature,
            "humidity":      request.humidity,
            "wind_speed":    request.wind_speed,
            "precipitation": request.precipitation,
        },
        "all_models_consensus": consensus,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.post("/predict/batch", tags=["Prediction"])
def predict_batch(request: BatchWeatherInput):
    """
    Batch storm-risk prediction for multiple weather inputs.
    Returns predictions for each input in order.
    """
    model_name = request.model_name or "Gradient Boosting"

    results = []
    for idx, inp in enumerate(request.inputs):
        features = _build_features(inp)
        try:
            res = _predict_single(features, model_name)
            results.append({
                "index": idx,
                "input": {
                    "temperature":   inp.temperature,
                    "humidity":      inp.humidity,
                    "wind_speed":    inp.wind_speed,
                    "precipitation": inp.precipitation,
                },
                **res,
            })
        except Exception as e:
            results.append({"index": idx, "error": str(e)})

    high_risk_count = sum(1 for r in results if r.get("prediction") == "High Risk")

    return {
        "total_inputs":     len(request.inputs),
        "model_used":       model_name,
        "high_risk_count":  high_risk_count,
        "results":          results,
        "timestamp":        datetime.utcnow().isoformat() + "Z",
    }
