from pydantic import BaseModel
from typing import Any, List, Dict

class OptimizationResponse(BaseModel):
    policy: List[Any]
    value: float

class SimulationResponse(BaseModel):
    expected_profit: float
    variance: float
    metrics: Dict[str, float]

class EvaluationResponse(BaseModel):
    score: float

class BatchItem(BaseModel):
    period_label: str
    expected_profit: float
    variance: float
    metrics: Dict[str, float]
    policy: List[Any]
    value: float
    explain: Dict[str, Any] | None = None

class BatchUploadResponse(BaseModel):
    items: List[BatchItem]

class BestChoiceResponse(BaseModel):
    policy: List[float]
    value: float
    expected_profit: float
    variance: float
    explain: Dict[str, Any] | None = None
