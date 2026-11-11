"""How sure are the restroom scores? Exact intervals and paired tests (task C-20).

Every number comes from stored predictions (ml/results/restroom/runs/R*.json, pipeline.json and,
if present, pipeline_per_query.json) and the IOAI answer files. Nothing is re-run on test.

    interval   exact (Clopper-Pearson) 95 % interval of k correct out of n
    paired     all methods answer the same queries, so two methods are compared only on the queries
               where exactly one of them is right: b = only the first is right, c = only the second;
               exact McNemar p = min(1, 2 * P(Binomial(b + c, 0.5) <= min(b, c))), and p = 1 if b + c = 0.
               In words: if both methods were equally good, how likely is a split at least this lopsided?

Writes  ml/results/restroom/intervals.json

Usage, from the repository root:
    python ml/restroom/intervals.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from scipy import stats

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402

RES = Path("ml/results/restroom")
OUT = RES / "intervals.json"


def load_predictions() -> dict[str, dict[str, np.ndarray]]:
    """method name -> split -> 1-based predictions."""
    out: dict[str, dict[str, np.ndarray]] = {}
    for p in sorted((RES / "runs").glob("R*.json")):
        if "-" in p.stem:
            continue
        r = json.loads(p.read_text())
        if r.get("smoke") or not r.get("isReal"):
            continue
        out[r["run"]] = {sp: np.array(v) for sp, v in r["predictions"].items()}
    pipe = json.loads((RES / "pipeline.json").read_text())
    for name in pipe["approaches"]:
        out[f"pipeline:{name}"] = {sp: np.array(pipe["predictions"][sp][name]) for sp in ("val", "test")}
    pq = RES / "pipeline_per_query.json"
    if pq.exists():
        d = json.loads(pq.read_text())
        for name, preds in d.get("predictions", {}).items():
            out[f"per_query:{name}"] = {sp: np.array(v) for sp, v in preds.items()}
    return out


def interval(k: int, n: int) -> dict:
    ci = stats.binomtest(k, n).proportion_ci(confidence_level=0.95, method="exact")
    return {"k": k, "n": n, "accuracy": round(k / n, 4), "ci95": [round(ci.low, 4), round(ci.high, 4)]}


def mcnemar(a_ok: np.ndarray, b_ok: np.ndarray) -> dict:
    b = int(np.sum(a_ok & ~b_ok))
    c = int(np.sum(~a_ok & b_ok))
    p = 1.0 if b + c == 0 else min(1.0, 2 * float(stats.binom.cdf(min(b, c), b + c, 0.5)))
    return {"only_first_right": b, "only_second_right": c, "p_exact_mcnemar": round(p, 4)}


def main() -> None:
    preds = load_predictions()
    answers = {sp: C.load_answers(sp) for sp in ("val", "test")}
    correct = {m: {sp: preds[m][sp] == answers[sp] for sp in preds[m] if sp in answers} for m in preds}

    scores = {m: {sp: interval(int(ok.sum()), len(ok)) for sp, ok in sp_ok.items()} for m, sp_ok in correct.items()}

    pipe = json.loads((RES / "pipeline.json").read_text())
    headline = [f"pipeline:{pipe['champion']}"]
    if any(m.startswith("per_query:") for m in preds):
        headline += [m for m in preds if m.startswith("per_query:") and "combo" in m]
    against = ["R0", "R3", "pipeline:ioai_baseline_clip"]
    paired = []
    for h in headline:
        for o in against:
            if h in correct and o in correct:
                paired.append({"first": h, "second": o, "split": "test", **mcnemar(correct[h]["test"], correct[o]["test"])})

    out = {
        "protocol": ("Exact (Clopper-Pearson) 95 % intervals of stored predictions against the IOAI answers; exact "
                     "McNemar tests on the test queries where exactly one method is right. No method was re-run."),
        "scores": scores,
        "paired_test": paired,
    }
    OUT.write_text(json.dumps(out, indent=2) + "\n")
    for h in headline:
        print(h, scores[h]["test"])
    for row in paired:
        print(row)


if __name__ == "__main__":
    main()
