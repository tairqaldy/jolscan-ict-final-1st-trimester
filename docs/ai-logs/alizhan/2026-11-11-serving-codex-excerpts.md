# Serving and preparation: Codex prompt excerpts

This is a **partial prompt and result record**, not a full exported transcript. The full session transcript was not available as an export in this work session. Personal paths and audio recordings are omitted. The exact prompts below are retained as written, including spelling.

## Selected prompts and resulting work

1. **Prompt:** "короче, я Алижан ты можешь уже начать выполнять мои таски?"
   - Codex helped prepare local API checks and documentation; the stock-model result was a serving smoke test, not an evaluation of pothole accuracy (S-1, PR #71).
2. **Prompt:** "хорошо, выпонли s4"
   - Codex documented local web/API integration checks; the early check used stock weights and a synthetic response for rendering. Tair later verified team weights in the real flow (S-4, PR #350 and `docs/TASKS.md`).
3. **Prompts:** "тогда начни выполнять таски, которые можно сделать сейчас" and "так, мне нужно, чтобы ты выполнил таски, потому что ишшьюс будет ревьюить Таир".
   - Codex prepared serving, readiness, testing and documentation changes in separate PRs. Issues were left for team review; see `docs/worklog/alizhan.md` for per-task evidence and limitations.
4. **Prompt:** "покажи мне саму шпаргалку и продолжай выполнять остальные таски, которые назначены мне".
   - Codex drafted the serving study card and tests. The study card was a preparation aid, not evidence that the user had personally passed an oral assessment (S-13, PR #354).
5. **Prompt:** "начни это все выполнять".
   - Codex prepared S-30 and S-31 API changes and a partial S-10 Lighthouse pass. Tests and measurement limits are recorded in the corresponding PRs #357, #356 and #358.
6. **Prompt:** "исследуй" (after a discussion of a third Lighthouse improvement).
   - Codex inspected unused JavaScript and identified Motion as a candidate; it did not claim that removing it would safely improve performance.
7. **Prompt:** "выполняй issues, можешь сам выбрать, что подходит именно под мою задачу".
   - Codex added API response schemas and OpenAPI documentation, verified with fake models (S-29, PR #359).
8. **Prompt:** "сделай таски, которые находятся в issues, by wed 11 nov 23:00(code freeze) и отмечай. делай перепроверку, rebase доделывай до моментка, пока не будет ошибок".
   - Codex prepared call logging and a validation-only model gate, reran checks and rebased branches; PRs #407 and #409 contain the detailed status. Verification with fake models does not prove model accuracy.
9. **Prompt:** "x-7, d-29 r-21 выполни эти три таска".
   - Codex prepared contribution-log evidence, a size-band reproduction script and slide rehearsal notes. D-29 still needs the real training labels; personal contribution review also remains necessary. R-21 includes three recordings supplied by Alizhan and his confirmation of the handover (PR #424).

## Verification and limits

The linked PRs, `docs/worklog/alizhan.md` and the corresponding entries in `docs/AI-USAGE-LOG.md` record task-specific checks. This excerpt does not replace the full conversation or other team members' logs. Alizhan should review the entries, understand the code and correct anything inaccurate before the defense.
