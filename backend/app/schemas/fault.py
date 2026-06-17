from pydantic import BaseModel


class PredictionRequest(BaseModel):
    voltage: float
    temperature: float
    motor_speed: float
    current: float
    vibration: float
    ambient_temperature: float
    humidity: float