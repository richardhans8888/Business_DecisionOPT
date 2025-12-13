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
    expected_profit = sum(combined) / len(combined) if combined else 0.0
    variance = statistics.pvariance(combined) if len(combined) > 1 else 0.0
    return {"policy": [alloc_pct[0], alloc_pct[1], alloc_pct[2]], "value": float(best_score), "expected_profit": expected_profit, "variance": variance}
