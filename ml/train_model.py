"""
India Storm Prediction — ML Training Pipeline
============================================
Trains 3 (or 4 with XGBoost) classifiers on synthetic Indian meteorological data,
saves .pkl model files, model_metrics.json, and training_history.json for the
Jupyter Notebook analysis pipeline.
"""

import pandas as pd
import numpy as np
import json
import os
import joblib
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)
from sklearn.preprocessing import StandardScaler

# ─── Optional XGBoost ────────────────────────────────────────────────────────
try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("Info: XGBoost not installed. Training with 3 models only.")


def generate_synthetic_weather_data(num_samples: int = 5000) -> pd.DataFrame:
    """
    Generate synthetic data based on Indian meteorological patterns.
    Uses Gaussian noise and complex non-linear interactions to prevent
    overfitting and reflect real-world weather uncertainty.

    Returns
    -------
    pd.DataFrame with columns: temperature, humidity, wind_speed,
                               precipitation, storm_risk
    """
    print(f"Generating meteorological dataset ({num_samples} samples)...")
    np.random.seed(42)

    # Raw features
    temp = np.random.uniform(15.0, 45.0, num_samples)         # °C
    humidity = np.random.uniform(20.0, 100.0, num_samples)    # %
    wind_speed = np.random.uniform(0.0, 40.0, num_samples)    # mph
    precipitation = np.random.uniform(0.0, 50.0, num_samples) # mm

    # Non-linear interaction: high temp × high humidity → massive instability
    interaction_term = ((temp / 45.0) ** 3) * ((humidity / 100.0) ** 3) * 15.0

    base_risk = (
        (temp / 45.0) * 1.0
        + (humidity / 100.0) * 1.0
        + (wind_speed / 40.0) * 2.0
        + (precipitation / 50.0) * 2.0
        + interaction_term
    )

    # Gaussian noise to simulate real-world unpredictability
    noise = np.random.normal(0, 0.04, num_samples)
    final_risk_score = base_risk + noise

    # Percentile-based class boundaries → 50% Low / 35% Moderate / 15% High
    p50 = np.percentile(final_risk_score, 50)
    p85 = np.percentile(final_risk_score, 85)

    target = np.where(
        final_risk_score > p85, 2,
        np.where(final_risk_score > p50, 1, 0)
    )

    df = pd.DataFrame({
        "temperature":   temp,
        "humidity":      humidity,
        "wind_speed":    wind_speed,
        "precipitation": precipitation,
        "storm_risk":    target
    })

    print(f"Class distribution — Low: {(target==0).sum()} | "
          f"Moderate: {(target==1).sum()} | High: {(target==2).sum()}")
    return df


def train_and_evaluate_model(output_dir: str = "ml_models") -> None:
    """
    Full training pipeline:
      1. Generate synthetic data
      2. Split into train/test (80/20)
      3. Train Logistic Regression, Random Forest, Gradient Boosting (+ XGBoost)
      4. Run 5-fold cross-validation to produce training_history.json
      5. Evaluate on hold-out test set → model_metrics.json
      6. Persist every model as a .pkl file
    """
    print("=" * 55)
    print("  India Storm Prediction — ML Training Pipeline")
    print("=" * 55)

    # ── 1. Data ────────────────────────────────────────────────
    df = generate_synthetic_weather_data()
    X = df[["temperature", "humidity", "wind_speed", "precipitation"]]
    y = df["storm_risk"]

    # ── 2. Train / Test split ──────────────────────────────────
    print("\nSplitting dataset (80% train / 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # ── 3. Model definitions ───────────────────────────────────
    model_defs = {
        "Random Forest": RandomForestClassifier(
            n_estimators=100, max_depth=10,
            min_samples_split=5, random_state=42
        ),
        "Logistic Regression": LogisticRegression(
            max_iter=3000, random_state=42
        ),
        "Gradient Boosting": GradientBoostingClassifier(
            n_estimators=100, learning_rate=0.1,
            max_depth=5, random_state=42
        ),
        "Deep Learning": MLPClassifier(
            hidden_layer_sizes=(64, 32), max_iter=1000, random_state=42
        ),
    }

    if XGBOOST_AVAILABLE:
        model_defs["XGBoost"] = XGBClassifier(
            n_estimators=100, learning_rate=0.1,
            max_depth=5, random_state=42,
            use_label_encoder=False, eval_metric="mlogloss"
        )

    os.makedirs(output_dir, exist_ok=True)
    metrics_list = []
    training_history = {}

    # ── 4. Train, CV, Evaluate ─────────────────────────────────
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for name, model in model_defs.items():
        print(f"\n--- Training: {name} ---")

        # 5-fold cross-validation (F1 weighted)
        cv_scores = cross_val_score(
            model, X_train, y_train,
            cv=skf, scoring="f1_weighted", n_jobs=-1
        )
        training_history[name] = {
            "fold_f1_scores": cv_scores.tolist(),
            "mean_cv_f1":     float(cv_scores.mean()),
            "std_cv_f1":      float(cv_scores.std()),
        }
        print(f"  5-Fold CV F1: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

        # Final fit on full training data
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        acc  = accuracy_score(y_test, preds)
        prec = precision_score(y_test, preds, average="weighted", zero_division=0)
        rec  = recall_score(y_test, preds, average="weighted", zero_division=0)
        f1   = f1_score(y_test, preds, average="weighted", zero_division=0)
        cm   = confusion_matrix(y_test, preds).tolist()

        print(f"  Accuracy:  {acc*100:.2f}%")
        print(f"  Precision: {prec*100:.2f}%")
        print(f"  Recall:    {rec*100:.2f}%")
        print(f"  F1 Score:  {f1*100:.2f}%")

        # Save model
        safe_name = name.lower().replace(" ", "_")
        model_path = os.path.join(output_dir, f"storm_predictor_{safe_name}.pkl")
        joblib.dump(model, model_path)
        print(f"  Saved: {model_path}")

        metrics_list.append({
            "model_name":       name,
            "accuracy":         round(acc, 6),
            "precision":        round(prec, 6),
            "recall":           round(rec, 6),
            "f1_score":         round(f1, 6),
            "confusion_matrix": cm,
            "file_path":        model_path,
        })

    # ── 5. Save JSON artefacts ─────────────────────────────────
    metrics_path = os.path.join(output_dir, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_list, f, indent=4)
    print(f"\nMetrics saved: {metrics_path}")

    history_path = os.path.join(output_dir, "training_history.json")
    with open(history_path, "w") as f:
        json.dump(training_history, f, indent=4)
    print(f"Training history saved: {history_path}")

    print("\n[OK] All models trained successfully!")
    print("=" * 55)


if __name__ == "__main__":
    train_and_evaluate_model()
