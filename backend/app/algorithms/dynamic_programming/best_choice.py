def dp_best_choice(mc_results: dict):
    exp = mc_results["expected"]

    best_score = float("-inf")
    best_alloc = (0, 0, 0)

    for m in range(0, 101, 5):
        for r in range(0, 101 - m, 5):
            o = 100 - m - r

            if m < 20 or r < 20 or o < 20:
                continue
            if m > 50 or r > 50 or o > 50:
                continue

            score = (
                exp["Marketing_Revenue"] * (m / 100)
                + exp["RnD_Revenue"] * (r / 100)
                + exp["Ops_Revenue"] * (o / 100)
            )

            if score > best_score:
                best_score = score
                best_alloc = (m, r, o)

    return best_alloc, best_score

