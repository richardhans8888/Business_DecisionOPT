from ..algorithms.evaluation.risk_adjusted_objective import score

def evaluate(request):
    return {"score": score(request.expected_profit, request.variance, request.risk_aversion)}

