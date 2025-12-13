from fastapi import APIRouter
from ...services.optimizer_service import run_optimization
from ...schemas.requests import OptimizationRequest
from ...schemas.responses import OptimizationResponse

router = APIRouter()

@router.post("/run", response_model=OptimizationResponse)
def run(request: OptimizationRequest):
    return run_optimization(request)

