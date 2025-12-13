from fastapi import APIRouter
from ...services.optimizer_service import run_optimization, run_best_choice
from ...schemas.requests import OptimizationRequest, BestChoiceRequest
from ...schemas.responses import OptimizationResponse, BestChoiceResponse

router = APIRouter()

@router.post("/run", response_model=OptimizationResponse)
def run(request: OptimizationRequest):
    return run_optimization(request)

@router.post("/best_choice", response_model=BestChoiceResponse)
def best_choice(request: BestChoiceRequest):
    row = request.model_dump()
    return run_best_choice(row)
