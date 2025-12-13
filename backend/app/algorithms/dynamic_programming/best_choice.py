def dp_best_choice(mc_results: dict, risk_weight: float = 0.3):
    exp = mc_results.get("expected", {})
    risk = mc_results.get("risk", {})
    m_eff = float(exp.get("Marketing_Revenue", 0.0)) - risk_weight * float(risk.get("Marketing_Revenue", 0.0))
    r_eff = float(exp.get("RnD_Revenue", 0.0)) - risk_weight * float(risk.get("RnD_Revenue", 0.0))
    o_eff = float(exp.get("Ops_Revenue", 0.0)) - risk_weight * float(risk.get("Ops_Revenue", 0.0))

    best_score = float("-inf")
    best_alloc = (0, 0, 0)

    for m in range(0, 101, 5):
        for r in range(0, 101 - m, 5):
            o = 100 - m - r

            if m < 20 or r < 20 or o < 20:
                continue
            if m > 50 or r > 50 or o > 50:
                continue

            score = m_eff * (m / 100) + r_eff * (r / 100) + o_eff * (o / 100)

            if score > best_score:
                best_score = score
                best_alloc = (m, r, o)

    return best_alloc, best_score
