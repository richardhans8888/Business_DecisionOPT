from ..algorithms.dynamic_programming.memoized_solver import solve
from ..algorithms.monte_carlo.predictor import monte_carlo
from ..algorithms.dynamic_programming.best_choice import dp_best_choice
import statistics

def run_optimization(request):
    result = solve(request.periods, request.budgets, request.projects, request.risk_aversion)
    return {"policy": result["policy"], "value": result["value"]}

def run_best_choice(row):
    mc = monte_carlo(row, iterations=1000)
    alloc_pct, best_score = dp_best_choice(mc)
    combined = [
        (mc["raw_data"]["Marketing"][i] + mc["raw_data"]["RnD"][i] + mc["raw_data"]["Ops"][i])
        for i in range(len(mc["raw_data"]["Marketing"]))
    ]
    avg_revenue = sum(combined) / len(combined) if combined else 0.0
    total_spend = float(row.get("Marketing_Spend", 0.0)) + float(row.get("RnD_Spend", 0.0)) + float(row.get("Ops_Spend", 0.0))
    expected_profit = avg_revenue - total_spend
    variance = statistics.pvariance(combined) if len(combined) > 1 else 0.0
    b = row.get("Budget", 0.0) or 0.0
    policy_amounts = [b * alloc_pct[0] / 100.0, b * alloc_pct[1] / 100.0, b * alloc_pct[2] / 100.0]
    explain = {
        "expected": mc.get("expected", {}),
        "risk": mc.get("risk", {}),
        "risk_weight": 0.3,
        "allocation_pct": {"marketing": alloc_pct[0], "rnd": alloc_pct[1], "ops": alloc_pct[2]},
        "budget": b,
        "avg_revenue": avg_revenue,
        "total_spend": total_spend,
        "net_profit": expected_profit,
    }
    return {"policy": policy_amounts, "value": float(best_score), "expected_profit": expected_profit, "variance": variance, "explain": explain}
