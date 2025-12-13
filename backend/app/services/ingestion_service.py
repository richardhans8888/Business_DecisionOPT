from typing import Dict, List, Iterable
from ..algorithms.monte_carlo.predictor import monte_carlo
from ..algorithms.dynamic_programming.best_choice import dp_best_choice
import statistics

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

        row = {
            "Marketing_Revenue": marketing_revenue,
            "RnD_Revenue": rnd_revenue,
            "Ops_Revenue": ops_revenue,
            "Marketing_Spend": marketing_spend,
            "RnD_Spend": rnd_spend,
            "Ops_Spend": ops_spend,
            "Budget": budget,
        }
        mc = monte_carlo(row, iterations=1000)
        alloc_pct, best_score = dp_best_choice(mc)

        combined = [
            (mc["raw_data"]["Marketing"][i] + mc["raw_data"]["RnD"][i] + mc["raw_data"]["Ops"][i])
            for i in range(len(mc["raw_data"]["Marketing"]))
        ]
        avg_revenue = sum(combined) / len(combined) if combined else 0.0
        total_spend = marketing_spend + rnd_spend + ops_spend
        expected_profit = avg_revenue - total_spend
        variance = statistics.pvariance(combined) if len(combined) > 1 else 0.0

        explain = {
            "expected": mc.get("expected", {}),
            "risk": mc.get("risk", {}),
            "risk_weight": 0.3,
            "allocation_pct": {"marketing": alloc_pct[0], "rnd": alloc_pct[1], "ops": alloc_pct[2]},
            "budget": budget,
            "avg_revenue": avg_revenue,
            "total_spend": total_spend,
            "net_profit": expected_profit,
        }
        items.append({
            "period_label": f"{year} {quarter}",
            "expected_profit": expected_profit,
            "variance": variance,
            "metrics": {},
            "policy": [budget * alloc_pct[0] / 100.0, budget * alloc_pct[1] / 100.0, budget * alloc_pct[2] / 100.0],
            "value": float(best_score),
            "explain": explain,
        })
    return items
