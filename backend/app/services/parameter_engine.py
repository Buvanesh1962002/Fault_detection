"""
Parameter Derivation Engine

Core logic that takes user-friendly inputs (vehicle model, battery SOC, driving mode, etc.)
and derives the 7 ML features required by the fault prediction model.

Derivation logic:
  - voltage_v:       Directly from EV spec database (motor operating voltage)
  - current_a:       base_current × load_factor × soc_derating
  - motor_speed_rpm: rated_rpm × mode_factor
  - temperature_c:   ambient + power_thermal_rise + age_degradation
  - vibration_g:     base_vibration × age_wear × mode_intensity
  - ambient_temp_c:  From weather API or manual entry
  - humidity:        From weather API or manual entry
"""

from app.data.ev_specs import get_vehicle_spec, EVSpec


# ──────────────────────────────────────────────────────────────────────────────
# DRIVING MODE FACTORS
# ──────────────────────────────────────────────────────────────────────────────
# These multiply against rated values to simulate how different driving modes
# affect the motor's electrical and mechanical operating point.

DRIVING_MODE_FACTORS = {
    "eco": {
        "rpm_factor": 0.40,       # Motor runs at ~40% of rated RPM
        "current_factor": 0.35,   # Very low current draw
        "vibration_factor": 0.60, # Less aggressive = less vibration
        "thermal_factor": 0.50,   # Less heat generated
    },
    "normal": {
        "rpm_factor": 0.65,       # Motor runs at ~65% of rated RPM
        "current_factor": 0.55,   # Moderate current draw
        "vibration_factor": 1.00, # Baseline vibration
        "thermal_factor": 0.75,   # Moderate heat
    },
    "sport": {
        "rpm_factor": 0.90,       # Motor runs at ~90% of rated RPM
        "current_factor": 0.85,   # High current draw
        "vibration_factor": 1.40, # Aggressive driving = higher vibration
        "thermal_factor": 1.20,   # Significant heat
    },
}


def _get_soc_derating(battery_soc: float) -> float:
    """
    Computes a current derating factor based on battery State of Charge.
    
    - Very low SOC (< 20%): Battery management system limits current → 0.6x
    - Normal SOC (20-80%): Optimal operating range → 1.0x
    - High SOC (> 80%): Slight limitation from regenerative braking limits → 0.9x
    """
    if battery_soc < 10:
        return 0.50
    elif battery_soc < 20:
        return 0.65
    elif battery_soc < 30:
        return 0.80
    elif battery_soc <= 80:
        return 1.00
    elif battery_soc <= 90:
        return 0.95
    else:
        return 0.90


def _get_soc_voltage_shift(battery_soc: float) -> float:
    """
    Voltage sags slightly under low SOC conditions.
    Returns a voltage adjustment in Volts.
    """
    if battery_soc < 15:
        return -8.0  # Significant sag at very low SOC
    elif battery_soc < 30:
        return -4.0
    elif battery_soc <= 80:
        return 0.0  # Nominal
    else:
        return 2.0  # Slightly elevated at full charge


def _get_age_wear_factor(odometer_km: float) -> float:
    """
    Computes a degradation/wear factor based on odometer reading.
    
    - New vehicle (< 5,000 km): 1.0 (baseline)
    - Moderate use (5k-50k km): slight increase in vibration/thermal
    - Heavy use (50k-100k km): noticeable degradation
    - Very heavy use (> 100k km): significant wear
    """
    if odometer_km < 5000:
        return 1.00
    elif odometer_km < 20000:
        return 1.05
    elif odometer_km < 50000:
        return 1.12
    elif odometer_km < 100000:
        return 1.25
    elif odometer_km < 150000:
        return 1.40
    else:
        return 1.55


def _get_charging_adjustments(is_charging: bool) -> dict:
    """
    When the vehicle is charging, motor is not spinning but electrical
    parameters still have values from the charging circuit.
    """
    if is_charging:
        return {
            "rpm_override": 15.0,      # Motor essentially idle
            "current_factor": 0.15,    # Small parasitic current
            "vibration_override": 0.02, # Near-zero vibration
            "thermal_factor": 0.30,    # Minimal heat from motor (charger heat is separate)
        }
    return None


class DerivedParameters:
    """Container for the 7 derived ML parameters with source metadata."""

    def __init__(
        self,
        voltage_v: float,
        current_a: float,
        motor_speed_rpm: float,
        temperature_c: float,
        vibration_g: float,
        ambient_temp_c: float,
        humidity: float,
        derivation_notes: dict | None = None,
    ):
        self.voltage_v = voltage_v
        self.current_a = current_a
        self.motor_speed_rpm = motor_speed_rpm
        self.temperature_c = temperature_c
        self.vibration_g = vibration_g
        self.ambient_temp_c = ambient_temp_c
        self.humidity = humidity
        self.derivation_notes = derivation_notes or {}

    def to_ml_dict(self) -> dict:
        """Returns the 7 parameters as a dict matching the ML model's expected feature names."""
        return {
            "voltage_v": self.voltage_v,
            "current_a": self.current_a,
            "motor_speed_rpm": self.motor_speed_rpm,
            "temperature_c": self.temperature_c,
            "vibration_g": self.vibration_g,
            "ambient_temp_c": self.ambient_temp_c,
            "humidity": self.humidity,
        }

    def to_display_dict(self) -> dict:
        """Returns a user-friendly summary of derived values with units."""
        return {
            "voltage": f"{self.voltage_v:.1f} V",
            "current": f"{self.current_a:.2f} A",
            "motor_speed": f"{self.motor_speed_rpm:.0f} RPM",
            "motor_temperature": f"{self.temperature_c:.1f} °C",
            "vibration": f"{self.vibration_g:.3f} g",
            "ambient_temperature": f"{self.ambient_temp_c:.1f} °C",
            "humidity": f"{self.humidity:.1f} %",
        }


def derive_parameters(
    vehicle_id: str,
    battery_soc: float,
    driving_mode: str,
    ambient_temp_c: float,
    humidity: float,
    odometer_km: float = 10000.0,
    is_charging: bool = False,
) -> DerivedParameters:
    """
    Derives the 7 ML model features from user-friendly inputs.
    
    Args:
        vehicle_id: ID of the vehicle in the EV database
        battery_soc: Battery state of charge (0-100%)
        driving_mode: "eco", "normal", or "sport"
        ambient_temp_c: Ambient temperature in °C (from weather API or manual)
        humidity: Relative humidity in % (from weather API or manual)
        odometer_km: Total kilometers driven (for age/wear estimation)
        is_charging: Whether the vehicle is currently charging
    
    Returns:
        DerivedParameters object with the 7 ML features
    
    Raises:
        ValueError: If vehicle_id is not found in the database
    """
    spec = get_vehicle_spec(vehicle_id)
    if spec is None:
        raise ValueError(f"Vehicle '{vehicle_id}' not found in database")

    # Resolve driving mode factors (default to "normal" if unrecognized)
    mode = DRIVING_MODE_FACTORS.get(driving_mode.lower(), DRIVING_MODE_FACTORS["normal"])
    mode_name = driving_mode.lower() if driving_mode.lower() in DRIVING_MODE_FACTORS else "normal"

    # Age/wear factor
    age_factor = _get_age_wear_factor(odometer_km)

    # SOC factors
    soc_derating = _get_soc_derating(battery_soc)
    voltage_shift = _get_soc_voltage_shift(battery_soc)

    # Check for charging state overrides
    charging = _get_charging_adjustments(is_charging)

    notes = {
        "vehicle": spec["display_name"],
        "driving_mode": mode_name,
        "age_factor": f"{age_factor:.2f}x",
        "soc_derating": f"{soc_derating:.2f}x",
        "data_source": "derived_from_specs",
    }

    # ── 1. VOLTAGE ────────────────────────────────────────────────────────
    voltage_v = spec["motor_voltage_operating"] + voltage_shift
    # Clamp to model bounds
    voltage_v = max(180.0, min(260.0, voltage_v))

    # ── 2. CURRENT ────────────────────────────────────────────────────────
    if charging:
        current_a = spec["max_current_draw"] * charging["current_factor"]
    else:
        current_a = spec["max_current_draw"] * mode["current_factor"] * soc_derating
    # Add small age-related parasitic increase
    current_a *= (1 + (age_factor - 1) * 0.3)
    current_a = max(0.1, min(30.0, current_a))

    # ── 3. MOTOR SPEED ───────────────────────────────────────────────────
    if charging:
        motor_speed_rpm = charging["rpm_override"]
    else:
        motor_speed_rpm = spec["rated_rpm"] * mode["rpm_factor"]
        # SOC affects speed capability slightly at very low charge
        if battery_soc < 15:
            motor_speed_rpm *= 0.75
        elif battery_soc < 25:
            motor_speed_rpm *= 0.90
    motor_speed_rpm = max(10.0, min(3000.0, motor_speed_rpm))

    # ── 4. MOTOR TEMPERATURE ─────────────────────────────────────────────
    if charging:
        thermal_factor = charging["thermal_factor"]
    else:
        thermal_factor = mode["thermal_factor"]

    # Power dissipated ≈ current × voltage × loss_factor
    power_dissipated_kw = (current_a * voltage_v * 0.08) / 1000  # ~8% loss as heat
    thermal_rise = power_dissipated_kw * spec["thermal_rise_factor"] * 100  # Scale factor
    temperature_c = ambient_temp_c + (thermal_rise * thermal_factor * age_factor)

    # High ambient temp compounds the issue
    if ambient_temp_c > 40:
        temperature_c += (ambient_temp_c - 40) * 0.3

    temperature_c = max(1.0, min(120.0, temperature_c))

    # ── 5. VIBRATION ─────────────────────────────────────────────────────
    if charging:
        vibration_g = charging["vibration_override"]
    else:
        vibration_g = spec["base_vibration_g"] * mode["vibration_factor"] * age_factor
        # High humidity can slightly increase vibration due to moisture effects on bearings
        if humidity > 80:
            vibration_g *= 1.05
    vibration_g = max(0.01, min(5.0, vibration_g))

    # ── 6 & 7. AMBIENT TEMP & HUMIDITY ────────────────────────────────────
    # These are pass-through from weather API / manual entry, already clamped
    ambient_temp_c = max(-10.0, min(60.0, ambient_temp_c))
    humidity = max(1.0, min(100.0, humidity))

    return DerivedParameters(
        voltage_v=round(voltage_v, 2),
        current_a=round(current_a, 2),
        motor_speed_rpm=round(motor_speed_rpm, 1),
        temperature_c=round(temperature_c, 1),
        vibration_g=round(vibration_g, 4),
        ambient_temp_c=round(ambient_temp_c, 1),
        humidity=round(humidity, 1),
        derivation_notes=notes,
    )
