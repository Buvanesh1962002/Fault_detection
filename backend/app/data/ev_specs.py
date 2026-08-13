"""
EV Vehicle Specification Database

Static lookup table of common EV models with their electrical/mechanical spec-sheet values.
These values are used by the parameter derivation engine to compute ML model inputs
from user-friendly information (vehicle model, battery SOC, driving mode, etc.).
"""

from typing import TypedDict, List


class EVSpec(TypedDict):
    display_name: str
    category: str  # "car" | "scooter" | "bike" | "bus"
    motor_voltage_operating: float  # V — motor-level operating voltage (what our ML model expects: 180-260V range)
    max_current_draw: float  # A — maximum current the motor draws under peak load
    rated_rpm: float  # RPM — rated motor speed at nominal load
    motor_type: str  # "permanent_magnet" | "induction" | "bldc"
    max_power_kw: float  # kW — peak motor power
    base_vibration_g: float  # g — typical vibration level at normal operation (from spec/testing)
    thermal_rise_factor: float  # °C above ambient per kW of power dissipated (simplified thermal model)
    image_emoji: str  # Emoji for the frontend card display


# ──────────────────────────────────────────────────────────────────────────────
# EV DATABASE
# ──────────────────────────────────────────────────────────────────────────────
# Voltages are mapped to the motor-controller operating range (180-260V) that
# the ML model was trained on, NOT the raw pack voltage.
# ──────────────────────────────────────────────────────────────────────────────

EV_DATABASE: dict[str, EVSpec] = {
    # ── Indian Market — Cars ──────────────────────────────────────────────
    "tata_nexon_ev_max": {
        "display_name": "Tata Nexon EV Max",
        "category": "car",
        "motor_voltage_operating": 230.0,
        "max_current_draw": 25.0,
        "rated_rpm": 2500,
        "motor_type": "permanent_magnet",
        "max_power_kw": 105.0,
        "base_vibration_g": 0.15,
        "thermal_rise_factor": 0.35,
        "image_emoji": "🚙",
    },
    "tata_nexon_ev_lr": {
        "display_name": "Tata Nexon EV Long Range",
        "category": "car",
        "motor_voltage_operating": 225.0,
        "max_current_draw": 22.0,
        "rated_rpm": 2400,
        "motor_type": "permanent_magnet",
        "max_power_kw": 100.0,
        "base_vibration_g": 0.14,
        "thermal_rise_factor": 0.33,
        "image_emoji": "🚙",
    },
    "tata_tiago_ev": {
        "display_name": "Tata Tiago EV",
        "category": "car",
        "motor_voltage_operating": 210.0,
        "max_current_draw": 18.0,
        "rated_rpm": 2200,
        "motor_type": "permanent_magnet",
        "max_power_kw": 55.0,
        "base_vibration_g": 0.12,
        "thermal_rise_factor": 0.30,
        "image_emoji": "🚗",
    },
    "tata_punch_ev": {
        "display_name": "Tata Punch EV",
        "category": "car",
        "motor_voltage_operating": 215.0,
        "max_current_draw": 19.0,
        "rated_rpm": 2300,
        "motor_type": "permanent_magnet",
        "max_power_kw": 60.0,
        "base_vibration_g": 0.13,
        "thermal_rise_factor": 0.32,
        "image_emoji": "🚗",
    },
    "mg_zs_ev": {
        "display_name": "MG ZS EV",
        "category": "car",
        "motor_voltage_operating": 235.0,
        "max_current_draw": 24.0,
        "rated_rpm": 2600,
        "motor_type": "permanent_magnet",
        "max_power_kw": 130.0,
        "base_vibration_g": 0.16,
        "thermal_rise_factor": 0.36,
        "image_emoji": "🚙",
    },
    "mg_comet_ev": {
        "display_name": "MG Comet EV",
        "category": "car",
        "motor_voltage_operating": 200.0,
        "max_current_draw": 14.0,
        "rated_rpm": 1800,
        "motor_type": "permanent_magnet",
        "max_power_kw": 30.0,
        "base_vibration_g": 0.10,
        "thermal_rise_factor": 0.25,
        "image_emoji": "🚗",
    },
    "hyundai_ioniq5": {
        "display_name": "Hyundai Ioniq 5",
        "category": "car",
        "motor_voltage_operating": 245.0,
        "max_current_draw": 28.0,
        "rated_rpm": 2800,
        "motor_type": "permanent_magnet",
        "max_power_kw": 160.0,
        "base_vibration_g": 0.18,
        "thermal_rise_factor": 0.38,
        "image_emoji": "🚘",
    },
    "mahindra_xuv400": {
        "display_name": "Mahindra XUV400",
        "category": "car",
        "motor_voltage_operating": 220.0,
        "max_current_draw": 20.0,
        "rated_rpm": 2400,
        "motor_type": "permanent_magnet",
        "max_power_kw": 110.0,
        "base_vibration_g": 0.15,
        "thermal_rise_factor": 0.34,
        "image_emoji": "🚙",
    },
    "byd_atto3": {
        "display_name": "BYD Atto 3",
        "category": "car",
        "motor_voltage_operating": 240.0,
        "max_current_draw": 26.0,
        "rated_rpm": 2700,
        "motor_type": "permanent_magnet",
        "max_power_kw": 150.0,
        "base_vibration_g": 0.17,
        "thermal_rise_factor": 0.37,
        "image_emoji": "🚘",
    },
    "citroen_ec3": {
        "display_name": "Citroën ëC3",
        "category": "car",
        "motor_voltage_operating": 205.0,
        "max_current_draw": 16.0,
        "rated_rpm": 2000,
        "motor_type": "permanent_magnet",
        "max_power_kw": 57.0,
        "base_vibration_g": 0.12,
        "thermal_rise_factor": 0.29,
        "image_emoji": "🚗",
    },

    # ── Indian Market — Two-Wheelers ─────────────────────────────────────
    "ather_450x": {
        "display_name": "Ather 450X",
        "category": "scooter",
        "motor_voltage_operating": 192.0,
        "max_current_draw": 12.0,
        "rated_rpm": 1800,
        "motor_type": "bldc",
        "max_power_kw": 6.2,
        "base_vibration_g": 0.20,
        "thermal_rise_factor": 0.45,
        "image_emoji": "🛵",
    },
    "ola_s1_pro": {
        "display_name": "Ola S1 Pro",
        "category": "scooter",
        "motor_voltage_operating": 195.0,
        "max_current_draw": 14.0,
        "rated_rpm": 2000,
        "motor_type": "bldc",
        "max_power_kw": 8.5,
        "base_vibration_g": 0.22,
        "thermal_rise_factor": 0.48,
        "image_emoji": "🛵",
    },
    "tvs_iqube": {
        "display_name": "TVS iQube",
        "category": "scooter",
        "motor_voltage_operating": 190.0,
        "max_current_draw": 10.0,
        "rated_rpm": 1600,
        "motor_type": "bldc",
        "max_power_kw": 4.4,
        "base_vibration_g": 0.18,
        "thermal_rise_factor": 0.42,
        "image_emoji": "🛵",
    },
    "bajaj_chetak": {
        "display_name": "Bajaj Chetak",
        "category": "scooter",
        "motor_voltage_operating": 188.0,
        "max_current_draw": 9.0,
        "rated_rpm": 1500,
        "motor_type": "bldc",
        "max_power_kw": 4.0,
        "base_vibration_g": 0.17,
        "thermal_rise_factor": 0.40,
        "image_emoji": "🛵",
    },
    "vida_v1_pro": {
        "display_name": "Vida V1 Pro (Hero)",
        "category": "scooter",
        "motor_voltage_operating": 191.0,
        "max_current_draw": 11.0,
        "rated_rpm": 1700,
        "motor_type": "bldc",
        "max_power_kw": 6.0,
        "base_vibration_g": 0.19,
        "thermal_rise_factor": 0.44,
        "image_emoji": "🛵",
    },
    "revolt_rv400": {
        "display_name": "Revolt RV400",
        "category": "bike",
        "motor_voltage_operating": 196.0,
        "max_current_draw": 13.0,
        "rated_rpm": 1900,
        "motor_type": "bldc",
        "max_power_kw": 3.0,
        "base_vibration_g": 0.25,
        "thermal_rise_factor": 0.50,
        "image_emoji": "🏍️",
    },

    # ── Global Market ─────────────────────────────────────────────────────
    "tesla_model3": {
        "display_name": "Tesla Model 3",
        "category": "car",
        "motor_voltage_operating": 250.0,
        "max_current_draw": 29.0,
        "rated_rpm": 2900,
        "motor_type": "permanent_magnet",
        "max_power_kw": 208.0,
        "base_vibration_g": 0.12,
        "thermal_rise_factor": 0.30,
        "image_emoji": "🚘",
    },
    "tesla_model_y": {
        "display_name": "Tesla Model Y",
        "category": "car",
        "motor_voltage_operating": 248.0,
        "max_current_draw": 28.0,
        "rated_rpm": 2850,
        "motor_type": "permanent_magnet",
        "max_power_kw": 220.0,
        "base_vibration_g": 0.13,
        "thermal_rise_factor": 0.31,
        "image_emoji": "🚘",
    },
    "byd_seal": {
        "display_name": "BYD Seal",
        "category": "car",
        "motor_voltage_operating": 245.0,
        "max_current_draw": 27.0,
        "rated_rpm": 2750,
        "motor_type": "permanent_magnet",
        "max_power_kw": 230.0,
        "base_vibration_g": 0.14,
        "thermal_rise_factor": 0.33,
        "image_emoji": "🚘",
    },
    "nissan_leaf": {
        "display_name": "Nissan Leaf",
        "category": "car",
        "motor_voltage_operating": 230.0,
        "max_current_draw": 22.0,
        "rated_rpm": 2400,
        "motor_type": "permanent_magnet",
        "max_power_kw": 110.0,
        "base_vibration_g": 0.14,
        "thermal_rise_factor": 0.33,
        "image_emoji": "🚗",
    },
}


def get_all_vehicles() -> List[dict]:
    """Returns a list of all vehicles with their id, display name, and category."""
    vehicles = []
    for vehicle_id, spec in EV_DATABASE.items():
        vehicles.append({
            "id": vehicle_id,
            "display_name": spec["display_name"],
            "category": spec["category"],
            "image_emoji": spec["image_emoji"],
            "motor_type": spec["motor_type"],
            "max_power_kw": spec["max_power_kw"],
        })
    return vehicles


def get_vehicle_spec(vehicle_id: str) -> EVSpec | None:
    """Returns the full spec for a given vehicle ID, or None if not found."""
    return EV_DATABASE.get(vehicle_id)
