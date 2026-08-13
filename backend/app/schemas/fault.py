from pydantic import BaseModel
from typing import Optional


class PredictionRequest(BaseModel):
    """Original expert mode request — direct sensor telemetry values."""
    voltage: float
    temperature: float
    motor_speed: float
    current: float
    vibration: float
    ambient_temperature: float
    humidity: float


class SmartPredictionRequest(BaseModel):
    """
    Smart mode request — user-friendly inputs that get derived into ML features.
    
    The user provides their vehicle model, battery state, driving mode, and location.
    The backend derives the 7 ML features automatically.
    """
    vehicle_id: str                              # e.g. "tata_nexon_ev_max"
    battery_soc: float                           # 0-100%
    driving_mode: str = "normal"                 # "eco" | "normal" | "sport"
    odometer_km: float = 10000.0                 # Total distance driven in km
    is_charging: bool = False                    # Whether vehicle is currently charging

    # Location for automatic weather fetch (optional)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Manual weather overrides (optional — used if lat/lon not provided)
    ambient_temperature: Optional[float] = None
    humidity: Optional[float] = None