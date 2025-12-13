from ..algorithms.monte_carlo.simulation import run
from ..algorithms.monte_carlo.risk_metrics import var, cvar

def run_simulation(request):
    summary = run(request.num_simulations, request.periods, request.budgets, {"mean_profit": request.mean_profit, "profit_std": request.profit_std})
    metrics = {}
    metrics["VaR"] = var(summary["samples"], request.var_confidence) if "samples" in summary else 0.0
    metrics["CVaR"] = cvar(summary["samples"], request.var_confidence) if "samples" in summary else 0.0
    return {"expected_profit": summary["expected_profit"], "variance": summary["variance"], "metrics": metrics}

