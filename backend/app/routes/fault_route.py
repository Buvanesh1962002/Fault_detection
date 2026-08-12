from fastapi import APIRouter, Request
from app.schemas.fault import PredictionRequest
import numpy as np
import pandas as pd

router = APIRouter(prefix="/api/fault")

# Physical min/max operational bounds for converting real-world values into [0.0, 1.0] range
BOUNDS = {
    "voltage_v":       {"min": 180.0, "max": 260.0},
    "current_a":       {"min": 0.0,   "max": 30.0},
    "motor_speed_rpm": {"min": 0.0,   "max": 3000.0},
    "temperature_c":   {"min": 0.0,   "max": 120.0},
    "vibration_g":     {"min": 0.0,   "max": 5.0},
    "ambient_temp_c":  {"min": -10.0, "max": 60.0},
    "humidity":        {"min": 0.0,   "max": 100.0}
}

@router.post("/predict")
async def predict(request: PredictionRequest, http_request: Request):
    model = getattr(http_request.app.state, "model", None)
    scaler = getattr(http_request.app.state, "scaler", None)

    if model is None:
        return {
            "error": "Model not loaded. Please try again later."
        }

    # Extract input values into a dictionary
    raw_inputs = {
        "voltage_v": request.voltage,
        "current_a": request.current,
        "motor_speed_rpm": request.motor_speed,
        "temperature_c": request.temperature,
        "vibration_g": request.vibration,
        "ambient_temp_c": request.ambient_temperature,
        "humidity": request.humidity
    }

    # Detect if user entered pre-scaled values [0.0, 1.0] across ALL inputs
    is_prescaled = all(0.0 <= raw_inputs[col] <= 1.0 for col in raw_inputs)

    if is_prescaled:
        # User entered pre-scaled 0.0 - 1.0 values
        input_df = pd.DataFrame([raw_inputs])
    else:
        # Validate each real-world input reading against physical operational bounds
        errors = []
        labels = {
            "voltage_v": "Voltage (180 - 260 V)",
            "current_a": "Current (0 - 30 A)",
            "motor_speed_rpm": "Motor Speed (0 - 3000 RPM)",
            "temperature_c": "Motor Temperature (0 - 120 °C)",
            "vibration_g": "Vibration (0 - 5 g)",
            "ambient_temp_c": "Ambient Temperature (-10 - 60 °C)",
            "humidity": "Humidity (0 - 100 %)"
        }

        normalized_inputs = {}
        for col, val in raw_inputs.items():
            b = BOUNDS[col]
            if val < b["min"] or val > b["max"]:
                errors.append(f"{labels[col]} received invalid value {val} (allowed range: {b['min']} to {b['max']}).")
            else:
                normalized_inputs[col] = (val - b["min"]) / (b["max"] - b["min"])

        # If any single reading input is out of range, reject request and return error message
        if errors:
            return {
                "error": "Invalid Sensor Reading: " + " | ".join(errors),
                "predicted_fault": "Unknown",
                "recommendation": "Correct out-of-range sensor inputs before running analysis.",
                "confidence": None
            }

        input_df = pd.DataFrame([normalized_inputs])

    # Scale using loaded StandardScaler instance if available
    if scaler:
        input_array = scaler.transform(input_df)
    else:
        input_array = input_df.values
    
    prediction = int(model.predict(input_array)[0])
    probability = model.predict_proba(input_array)[0] if hasattr(model, 'predict_proba') else None
    
    # Map prediction to label
    fault_map = {
        0: "Normal",
        1: "Warning",
        2: "Worst Condition",
        3: "Critical"
    }
    
    result = fault_map.get(prediction, "Unknown")
    
    recommendation = {
        "Normal": "Continue monitoring",
        "Warning": "Schedule maintenance soon",
        "Worst Condition": "Immediate attention required",
        "Critical": "Emergency shutdown required"
    }.get(result, "Check system")

    return {
        "predicted_fault": result,
        "recommendation": recommendation,
        "confidence": float(max(probability)) if probability is not None else None
    }

