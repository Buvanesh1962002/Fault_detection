from fastapi import APIRouter, Request
from app.schemas.fault import PredictionRequest
import numpy as np
import pandas as pd

router = APIRouter(prefix="/api/fault")

@router.post("/predict")
async def predict(request: PredictionRequest, http_request: Request):
    model = getattr(http_request.app.state, "model", None)
    scaler = getattr(http_request.app.state, "scaler", None)

    if model is None:
        return {
            "error": "Model not loaded. Please try again later."
        }

    # Create DataFrame with the exact feature names the scaler/model were fitted with
    input_df = pd.DataFrame([{
        "voltage_v": request.voltage,
        "current_a": request.current,
        "motor_speed_rpm": request.motor_speed,
        "temperature_c": request.temperature,
        "vibration_g": request.vibration,
        "ambient_temp_c": request.ambient_temperature,
        "humidity": request.humidity
    }])

    # Scale if you have a scaler
    if scaler:
        input_array = scaler.transform(input_df)
    else:
        input_array = input_df.values
    
    prediction = int(model.predict(input_array)[0])
    probability = model.predict_proba(input_array)[0] if hasattr(model, 'predict_proba') else None
    
    # Map prediction to label (adjust according to your classes)
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
