"""
Vehicles API Route

Serves the list of supported EV vehicles to the frontend for the Smart Mode vehicle picker.
"""

from fastapi import APIRouter
from app.data.ev_specs import get_all_vehicles

router = APIRouter(prefix="/api/vehicles")


@router.get("")
async def list_vehicles():
    """Returns all supported EV vehicles with their basic info."""
    vehicles = get_all_vehicles()
    return {
        "vehicles": vehicles,
        "total": len(vehicles),
    }
