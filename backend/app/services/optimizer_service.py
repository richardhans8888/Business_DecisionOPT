from ..algorithms.dynamic_programming.memoized_solver import solve

def run_optimization(request):
    result = solve(request.periods, request.budgets, request.projects, request.risk_aversion)
    return {"policy": result["policy"], "value": result["value"]}

