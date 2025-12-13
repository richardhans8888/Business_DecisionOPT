from fastapi import APIRouter
from ...services.evaluation_service import evaluate
from ...schemas.requests import EvaluationRequest
from ...schemas.responses import EvaluationResponse

router = APIRouter()

@router.post("/score", response_model=EvaluationResponse)
def score_route(request: EvaluationRequest):
    return evaluate(request)

