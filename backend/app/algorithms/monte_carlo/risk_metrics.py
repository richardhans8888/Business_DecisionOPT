def var(samples, alpha):
    if not samples:
        return 0.0
    s = sorted(samples)
    k = max(0, min(len(s) - 1, int((1.0 - alpha) * len(s))))
    return s[k]

def cvar(samples, alpha):
    if not samples:
        return 0.0
    s = sorted(samples)
    k = max(0, min(len(s) - 1, int((1.0 - alpha) * len(s))))
    tail = s[:k + 1]
    return sum(tail) / len(tail) if tail else 0.0

