"""
Weather Service

Fetches real-time ambient temperature and humidity from the Open-Meteo API.
This is a free API that requires no API key.
https://open-meteo.com/
"""

import httpx
from typing import Optional


class WeatherData:
    """Simple container for weather data."""
    def __init__(self, ambient_temp_c: float, humidity: float):
        self.ambient_temp_c = ambient_temp_c
        self.humidity = humidity

    def to_dict(self) -> dict:
        return {
            "ambient_temp_c": self.ambient_temp_c,
            "humidity": self.humidity,
        }


# Open-Meteo API base URL
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# Default fallback values if weather API fails
DEFAULT_AMBIENT_TEMP = 30.0  # °C — reasonable Indian summer default
DEFAULT_HUMIDITY = 65.0  # % — reasonable Indian default


async def get_weather(latitude: float, longitude: float) -> WeatherData:
    """
    Fetches current weather (temperature and humidity) from Open-Meteo API.
    
    Args:
        latitude: Location latitude
        longitude: Location longitude
    
    Returns:
        WeatherData with ambient_temp_c and humidity
    
    Falls back to sensible defaults if the API call fails.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                OPEN_METEO_URL,
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "current": "temperature_2m,relative_humidity_2m",
                }
            )
            response.raise_for_status()
            data = response.json()

            current = data.get("current", {})
            temp = current.get("temperature_2m", DEFAULT_AMBIENT_TEMP)
            humidity = current.get("relative_humidity_2m", DEFAULT_HUMIDITY)

            # Clamp to our model's expected bounds
            temp = max(-10.0, min(60.0, float(temp)))
            humidity = max(1.0, min(100.0, float(humidity)))

            return WeatherData(ambient_temp_c=temp, humidity=humidity)

    except Exception as e:
        print(f"Weather API error (using defaults): {e}")
        return WeatherData(
            ambient_temp_c=DEFAULT_AMBIENT_TEMP,
            humidity=DEFAULT_HUMIDITY
        )


async def get_weather_or_manual(
    latitude: Optional[float],
    longitude: Optional[float],
    manual_ambient_temp: Optional[float],
    manual_humidity: Optional[float],
) -> WeatherData:
    """
    Resolves weather data with priority:
    1. Manual overrides (if user provided both)
    2. Weather API (if lat/lon provided)
    3. Defaults
    """
    # If user manually provided both values, use those
    if manual_ambient_temp is not None and manual_humidity is not None:
        return WeatherData(
            ambient_temp_c=max(-10.0, min(60.0, manual_ambient_temp)),
            humidity=max(1.0, min(100.0, manual_humidity)),
        )

    # If lat/lon provided, fetch from API
    if latitude is not None and longitude is not None:
        weather = await get_weather(latitude, longitude)

        # Allow partial manual overrides
        if manual_ambient_temp is not None:
            weather.ambient_temp_c = max(-10.0, min(60.0, manual_ambient_temp))
        if manual_humidity is not None:
            weather.humidity = max(1.0, min(100.0, manual_humidity))

        return weather

    # Fall back to defaults
    return WeatherData(
        ambient_temp_c=manual_ambient_temp if manual_ambient_temp is not None else DEFAULT_AMBIENT_TEMP,
        humidity=manual_humidity if manual_humidity is not None else DEFAULT_HUMIDITY,
    )
