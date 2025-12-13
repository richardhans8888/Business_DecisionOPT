def apply(state, decision):
    next_cash = state.cash - sum(decision) if isinstance(decision, list) else state.cash - decision
    next_period = state.period + 1
    return state.__class__(period=next_period, cash=next_cash, allocations=decision if isinstance(decision, list) else [decision])

