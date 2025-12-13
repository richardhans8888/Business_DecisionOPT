def solve(periods, budgets, projects, risk_aversion):
    total_budget = budgets[0] if budgets else 0.0
    n = max(1, len(projects))
    alloc = total_budget / n if n else 0.0
    policy = [alloc for _ in range(n)]
    value = sum(p.expected_return for p in projects) - sum(p.cost for p in projects) - risk_aversion * 0.0
    return {"policy": policy, "value": value}
