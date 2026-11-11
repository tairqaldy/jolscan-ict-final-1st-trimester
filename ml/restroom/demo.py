"""Local demo: pick a sign from the IOAI data, and the two-step pipeline finds its pair.

Choose the validation set (10 queries, 20 originals) or the test set (30 queries, 60 originals),
click a query crop, and see each step of the final pipeline (`sift_combo_hungarian` in pipeline.py):

    step 1  SIFT and a pixel check find the original the crop was cut from
    step 2  the most similar other original (colour histogram + zero-shot CLIP ViT-B/32) is its pair

with the IOAI answer, the zero-shot CLIP baseline's pick for comparison, and the step-2 ranking.
It runs the same code as pipeline.py, on the IOAI images, nothing is precomputed or typed in.
The pipeline assigns all queries of a set at once, so no two queries get the same original.

Usage, from the repository root (needs data/raw/ioai-restroom from get_data.py, and gradio):
    python ml/restroom/demo.py            # then open http://127.0.0.1:7861
"""

from __future__ import annotations

import json
import os
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
os.chdir(ROOT)  # the data and results paths in common.py are relative to the repository root
sys.path.insert(0, str(Path(__file__).resolve().parent))

import gradio as gr  # noqa: E402
import numpy as np  # noqa: E402

import common as C  # noqa: E402
import pipeline as P  # noqa: E402

W_HIST = json.loads(P.OUT.read_text()).get("histogram_weight", 0.3) if P.OUT.exists() else 0.3
SPLITS = {"Validation (10 queries, 20 originals)": "val", "Test (30 queries, 60 originals)": "test"}
TOP_K = 5


@dataclass
class SplitState:
    query: list[Path]
    gallery: list[Path]
    answer: np.ndarray      # 0-based gallery index of the correct pair, per query
    scores: P.Scores
    own: np.ndarray         # step 1 pick per query
    partner: np.ndarray     # step 2 pick per query (the pipeline's answer)
    baseline: np.ndarray    # IOAI zero-shot CLIP baseline's answer
    pair: np.ndarray        # gallery x gallery step-2 score


def build(split: str, clip) -> SplitState:
    query, gallery = C.load_split(split)
    s = P.compute_scores(query, gallery, clip)
    own, partner = P.run_approach(s, "sift_ncc", W_HIST, hungarian=True)
    return SplitState(query, gallery, C.load_answers(split) - 1, s, own, partner, P.ioai_baseline(s),
                      P.step2_score(s, W_HIST))


def mark(ok: bool) -> str:
    return "✓ right" if ok else "✗ wrong"


print("Loading CLIP ViT-B/32 and scoring the validation and test sets (about 20 s)...", flush=True)
CLIP = C.load_clip("ViT-B-32")[:2]
STATE = {split: build(split, CLIP) for split in SPLITS.values()}
print("Ready.", flush=True)


def summary(split: str) -> str:
    st = STATE[split]
    n = len(st.query)
    pipe = int((st.partner == st.answer).sum())
    base = int((st.baseline == st.answer).sum())
    return (f"**On this set:** the two-step pipeline gets **{pipe}/{n}** right; the IOAI zero-shot CLIP baseline "
            f"gets {base}/{n}. Click any query crop below.")


def query_items(split: str) -> list[tuple[str, str]]:
    return [(str(p), f"query {i + 1}") for i, p in enumerate(STATE[split].query)]


def show(split: str, i: int):
    st = STATE[split]
    g = st.gallery
    own, part, ans, base = int(st.own[i]), int(st.partner[i]), int(st.answer[i]), int(st.baseline[i])
    ncc, inl = float(st.scores.ncc[i, own]), int(st.scores.inliers[i, own])
    tick = lambda ok: "✓" if ok else "✗"  # noqa: E731
    steps = [
        (str(st.query[i]), f"Query {i + 1}"),
        (str(g[own]), f"1. Original: {own + 1}"),
        (str(g[part]), f"2. Pair: {part + 1} {tick(part == ans)}"),
        (str(g[ans]), f"IOAI answer: {ans + 1}"),
        (str(g[base]), f"CLIP only: {base + 1} {tick(base == ans)}"),
    ]
    order = [int(k) for k in np.argsort(-st.pair[own]) if k != own][:TOP_K]
    cands = [(str(g[k]), f"#{r + 1}: {k + 1} · {st.pair[own, k]:.2f}" + (" ← chosen" if k == part else ""))
             for r, k in enumerate(order)]
    note = ""
    if part != order[0]:
        note = (" The top-ranked candidate was given to another query by the global assignment, so this query "
                "got the next free one.")
    text = (f"**Query {i + 1}.** Step 1 found the crop's original, gallery {own + 1} "
            f"(pixel correlation after alignment {ncc:.2f}, {inl} SIFT matches). Step 2 ranked the other "
            f"originals by {W_HIST:.0%} colour histogram + {1 - W_HIST:.0%} CLIP similarity to it and took "
            f"gallery {part + 1}: **{mark(part == ans)}** (IOAI answer: gallery {ans + 1}). Zero-shot CLIP "
            f"alone, the IOAI baseline, picked gallery {base + 1}: {mark(base == ans)}.{note} Numbers under the "
            f"images are gallery files; in the ranking, the number after · is the step-2 score.")
    return steps, text, cands


def on_split(label: str):
    split = SPLITS[label]
    return summary(split), query_items(split), [], "Pick a query crop.", []


def on_pick(label: str, evt: gr.SelectData):
    return show(SPLITS[label], int(evt.index))


with gr.Blocks(title="Restroom pair finder") as demo:
    gr.Markdown("# Find the other door\nIOAI 2025 Restroom Icon Matching: each query is a crop of one door "
                "sign; the task is to find the sign of the **other gender from the same restroom** among the "
                "originals. This runs our final two-step pipeline live (no training).")
    first = next(iter(SPLITS))
    split_in = gr.Radio(list(SPLITS), value=first, label="Image set")
    info = gr.Markdown(summary(SPLITS[first]))
    queries = gr.Gallery(query_items(SPLITS[first]), label="Query crops: click one", columns=10, height=300,
                         allow_preview=False, object_fit="contain")
    steps_out = gr.Gallery(label="What the pipeline did", columns=5, height=300, allow_preview=False,
                           object_fit="contain")
    text_out = gr.Markdown("Pick a query crop.")
    cands_out = gr.Gallery(label=f"Step 2 ranking: the top {TOP_K} candidates for the pair", columns=TOP_K,
                           height=260, allow_preview=False, object_fit="contain")
    gr.Markdown("Images: IOAI 2025 Restroom Icon Matching, CC-BY-4.0. Code: `ml/restroom/pipeline.py`.")

    split_in.change(on_split, split_in, [info, queries, steps_out, text_out, cands_out])
    queries.select(on_pick, split_in, [steps_out, text_out, cands_out])


if __name__ == "__main__":
    demo.launch(server_name="127.0.0.1", server_port=int(os.environ.get("PORT", 7861)),
                allowed_paths=[str((ROOT / C.DATA).resolve())])
