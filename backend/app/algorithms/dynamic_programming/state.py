from dataclasses import dataclass
from typing import List

@dataclass
class State:
    period: int
    cash: float
    allocations: List[float]

