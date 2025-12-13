from .distributions import normal

def generate(periods, mean_profit, profit_std):
    return [normal(mean_profit, profit_std) for _ in range(periods)]

