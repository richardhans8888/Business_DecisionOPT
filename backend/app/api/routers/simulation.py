from fastapi import APIRouter
from ...services.simulation_service import run_simulation
from ...schemas.requests import SimulationRequest
from ...schemas.responses import SimulationResponse

router = APIRouter()

@router.post("/run", response_model=SimulationResponse)
def run(request: SimulationRequest):
    return run_simulation(request)

