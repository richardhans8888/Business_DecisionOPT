from pydantic import BaseModel
from typing import List, Optional

class ProjectInput(BaseModel):
    id: str
    expected_return: float
    cost: float
    risk: float

class OptimizationRequest(BaseModel):
    periods: int
    budgets: List[float]
    projects: List[ProjectInput]
    risk_aversion: float

class SimulationRequest(BaseModel):
    periods: int
    budgets: List[float]
    num_simulations: int
    mean_profit: float
    profit_std: float
    var_confidence: Optional[float] = 0.95

class EvaluationRequest(BaseModel):
    expected_profit: float
    variance: float
    risk_aversion: float

class BestChoiceRequest(BaseModel):
    Marketing_Revenue: float
    RnD_Revenue: float
    Ops_Revenue: float
    Marketing_Spend: float
    RnD_Spend: float
    Ops_Spend: float
    Budget: float
