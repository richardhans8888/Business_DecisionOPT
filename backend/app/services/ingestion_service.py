from typing import Dict, List, Iterable
from .simulation_service import run_simulation
from .optimizer_service import run_optimization
from ..schemas.requests import SimulationRequest, OptimizationRequest, ProjectInput

def _normalize_key(k: str) -> str:
    return k.strip().lower().replace(" ", "_")

def _get(row: Dict, key: str, default=0.0) -> float:
    for k in row.keys():
        if _normalize_key(k) == key:
            v = row[k]
            try:
                return float(v)
            except Exception:
                return default
    return default

def process_csv(reader: Iterable[Dict]) -> List[Dict]:
    items: List[Dict] = []
    for row in reader:
        year = int(_get(row, "year", 0))
        quarter_raw = None
        for k in row.keys():
            if _normalize_key(k) in ("quarter", "qtr"):
                quarter_raw = row[k]
                break
        quarter = str(quarter_raw or "Q1")
        marketing_revenue = _get(row, "marketing_revenue", 0.0)
        rnd_revenue = _get(row, "rnd_revenue", 0.0)
        ops_revenue = _get(row, "ops_revenue", 0.0)
        marketing_spend = _get(row, "marketing_spend", 0.0)
        rnd_spend = _get(row, "rnd_spend", 0.0)
        ops_spend = _get(row, "ops_spend", 0.0)
        budget = _get(row, "budget", 0.0)

        mean_profit = marketing_revenue + rnd_revenue + ops_revenue - (marketing_spend + rnd_spend + ops_spend)
        sim_req = SimulationRequest(
            periods=1,
            budgets=[budget],
            num_simulations=1000,
            mean_profit=mean_profit,
            profit_std=0.1 * max(1.0, marketing_revenue + rnd_revenue + ops_revenue),
            var_confidence=0.95,
        )
        sim_res = run_simulation(sim_req)

        projects = [
            ProjectInput(id="marketing", expected_return=marketing_revenue, cost=marketing_spend, risk=0.2),
            ProjectInput(id="rnd", expected_return=rnd_revenue, cost=rnd_spend, risk=0.3),
            ProjectInput(id="ops", expected_return=ops_revenue, cost=ops_spend, risk=0.25),
        ]
        opt_req = OptimizationRequest(periods=1, budgets=[budget], projects=projects, risk_aversion=0.5)
        opt_res = run_optimization(opt_req)

        items.append({
            "period_label": f"{year} {quarter}",
            "expected_profit": sim_res["expected_profit"],
            "variance": sim_res["variance"],
            "metrics": sim_res.get("metrics", {}),
            "policy": opt_res["policy"],
            "value": opt_res["value"],
        })
    return items

