from fastapi import APIRouter, Request
from app.schemas.fault import PredictionRequest, SmartPredictionRequest
from app.services.weather_service import get_weather_or_manual
from app.services.parameter_engine import derive_parameters
import numpy as np
import pandas as pd

router = APIRouter(prefix="/api/fault")

# Physical min/max operational bounds for converting real-world values into [0.0, 1.0] range
BOUNDS = {
    "voltage_v":       {"min": 180.0, "max": 260.0},
    "current_a":       {"min": 0.1,   "max": 30.0},
    "motor_speed_rpm": {"min": 10.0,  "max": 3000.0},
    "temperature_c":   {"min": 1.0,   "max": 120.0},
    "vibration_g":     {"min": 0.01,  "max": 5.0},
    "ambient_temp_c":  {"min": -10.0, "max": 60.0},
    "humidity":        {"min": 1.0,   "max": 100.0}
}

# Fault classification map (shared between both endpoints)
FAULT_MAP = {
    0: "Normal",
    1: "Warning",
    2: "Worst Condition",
    3: "Critical"
}

# Recommendation text (shared between both endpoints)
RECOMMENDATIONS = {
    "Normal": "• System parameters are operating within safe nominal limits.\n• Continue standard monitoring routines and maintain regular inspection schedules.\n• No immediate mechanical intervention required.",
    "Warning": "• Minor telemetry anomalies detected across operating features.\n• Schedule routine maintenance inspection soon to prevent potential component degradation.\n• Check motor temperature and vibration logs closely over the next 24 hours.",
    "Worst Condition": "• Severe operating deviations detected nearing component stress limits.\n• Immediate physical inspection and corrective maintenance required to avoid structural failure.\n• Reduce operating load immediately and inspect cooling/lubrication systems.",
    "Critical": "• Critical fault thresholds exceeded with immediate risk of motor burnout or mechanical failure.\n• Initiate emergency system shutdown immediately and perform complete diagnostic troubleshooting.\n• Do not restart machinery until hardware safety inspection is cleared by a certified engineer."
}


def _run_prediction(raw_inputs: dict, model, scaler) -> dict:
    """
    Shared ML inference logic used by both /predict and /smart-predict endpoints.
    Takes raw feature values, normalizes, scales, and runs the model.
    Returns the prediction response dict.
    """
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
            "current_a": "Current (0.1 - 30 A)",
            "motor_speed_rpm": "Motor Speed (10 - 3000 RPM)",
            "temperature_c": "Motor Temperature (1 - 120 °C)",
            "vibration_g": "Vibration (0.01 - 5 g)",
            "ambient_temp_c": "Ambient Temperature (-10 - 60 °C)",
            "humidity": "Humidity (1 - 100 %)"
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
    
    result = FAULT_MAP.get(prediction, "Unknown")
    recommendation = RECOMMENDATIONS.get(result, "Perform thorough system inspection and review sensor logs.")

    return {
        "predicted_fault": result,
        "recommendation": recommendation,
        "confidence": float(max(probability)) if probability is not None else None
    }


@router.post("/predict")
async def predict(request: PredictionRequest, http_request: Request):
    """Expert Mode: Direct sensor telemetry input → ML prediction."""
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

    return _run_prediction(raw_inputs, model, scaler)


@router.post("/smart-predict")
async def smart_predict(request: SmartPredictionRequest, http_request: Request):
    """
    Smart Mode: User-friendly inputs → Parameter derivation → ML prediction.
    
    Takes vehicle model, battery SOC, driving mode, location, and odometer.
    Derives the 7 ML features and runs the prediction pipeline.
    Returns the prediction result plus the derived parameters for transparency.
    """
    model = getattr(http_request.app.state, "model", None)
    scaler = getattr(http_request.app.state, "scaler", None)

    if model is None:
        return {
            "error": "Model not loaded. Please try again later."
        }

    # Step 1: Resolve weather (ambient temp + humidity)
    weather = await get_weather_or_manual(
        latitude=request.latitude,
        longitude=request.longitude,
        manual_ambient_temp=request.ambient_temperature,
        manual_humidity=request.humidity,
    )

    # Step 2: Derive ML parameters from user-friendly inputs
    try:
        derived = derive_parameters(
            vehicle_id=request.vehicle_id,
            battery_soc=request.battery_soc,
            driving_mode=request.driving_mode,
            ambient_temp_c=weather.ambient_temp_c,
            humidity=weather.humidity,
            odometer_km=request.odometer_km,
            is_charging=request.is_charging,
        )
    except ValueError as e:
        return {
            "error": str(e),
            "predicted_fault": "Unknown",
            "recommendation": "Please select a valid vehicle from the supported list.",
            "confidence": None
        }

    # Step 3: Run through existing ML pipeline
    raw_inputs = derived.to_ml_dict()
    prediction_result = _run_prediction(raw_inputs, model, scaler)

    # Step 4: Attach derived parameters for transparency
    prediction_result["derived_params"] = derived.to_display_dict()
    prediction_result["derivation_notes"] = derived.derivation_notes
    prediction_result["weather_source"] = (
        "auto" if request.latitude is not None and request.longitude is not None
        else "manual" if request.ambient_temperature is not None
        else "default"
    )
    prediction_result["mode"] = "smart"

    return prediction_result

