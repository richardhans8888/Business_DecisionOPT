import random
import statistics

def monte_carlo(row: dict, iterations: int = 1000):
    marketing_results = []
    rnd_results = []
    ops_results = []

    for _ in range(iterations):
        m_rev = row["Marketing_Revenue"] * random.uniform(0.9, 1.15)
        r_rev = row["RnD_Revenue"] * random.uniform(0.85, 1.20)
        o_rev = row["Ops_Revenue"] * random.uniform(0.95, 1.10)

        m_effect = (row["Marketing_Spend"] / row["Budget"]) * 0.10 if row["Budget"] else 0.0
        r_effect = (row["RnD_Spend"] / row["Budget"]) * 0.12 if row["Budget"] else 0.0
        o_effect = (row["Ops_Spend"] / row["Budget"]) * 0.05 if row["Budget"] else 0.0

        m_rev *= (1 + m_effect)
        r_rev *= (1 + r_effect)
        o_rev *= (1 + o_effect)

        marketing_results.append(m_rev)
        rnd_results.append(r_rev)
        ops_results.append(o_rev)

    return {
        "expected": {
            "Marketing_Revenue": sum(marketing_results) / iterations,
            "RnD_Revenue": sum(rnd_results) / iterations,
            "Ops_Revenue": sum(ops_results) / iterations,
        },
        "risk": {
            "Marketing_Revenue": statistics.stdev(marketing_results) if iterations > 1 else 0.0,
            "RnD_Revenue": statistics.stdev(rnd_results) if iterations > 1 else 0.0,
            "Ops_Revenue": statistics.stdev(ops_results) if iterations > 1 else 0.0,
        },
        "raw_data": {
            "Marketing": marketing_results,
            "RnD": rnd_results,
            "Ops": ops_results,
        },
    }

