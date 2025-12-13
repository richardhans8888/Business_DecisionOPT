import random

def run(num_simulations, periods, budgets, params):
    samples = []
    for _ in range(num_simulations):
        total = 0.0
        for _ in range(periods):
            total += random.gauss(params.get("mean_profit", 0.0), params.get("profit_std", 1.0))
        samples.append(total)
    mean = sum(samples) / len(samples) if samples else 0.0
    var = sum((x - mean) ** 2 for x in samples) / len(samples) if samples else 0.0
    return {"expected_profit": mean, "variance": var, "samples": samples}

