def reward(state, decision):
    return sum(decision) if isinstance(decision, list) else float(decision)

