# Worklog: Roma

**Lane:** Deck, AI audit, QA. Tasks suggested for Roma: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

- Executed the two-model vision-language audit (Task R-6, CLO 7) comparing Google Gemini Auto against Anthropic Claude 3.5 Sonnet across 20 IOAI restroom sign benchmarks with strict session isolation and anonymized naming.
- Discovered and documented interface metadata leakage in Gemini (`A07.png`, `A17.png`), demonstrating the necessity of protocol-level file anonymization.
- Synthesized quantitative findings (both models 85.0% overall, consensus 93.8%) and failure modes for Slide 10 and defense oral presentation.

## Entries

### 2026-11-12 00:20 · R-6 (#85) · Audit two vision-language models on restroom signs (CLO 7)
- **Status:** done
- **What I did:** Performed a structured comparative evaluation of Google Gemini (Auto) and Anthropic Claude (3.5 Sonnet) on 20 balanced restroom sign images (10 male, 10 female) from the IOAI benchmark. Downloaded and anonymized all filenames to opaque IDs (A01–A20) to eliminate label contamination. Executed all 40 queries across isolated browser chat sessions with an identical single-word prompt, captured full audit screenshots, and compiled the evaluation report and Slide 10 defense briefing.
- **Result:** Report in [`docs/research/vlm-evaluation.md`](../research/vlm-evaluation.md). Both models scored 17/20 (85.0%). Gemini had an asymmetric female bias (70% men, 100% women); Claude had 80% men, 90% women. Both failed on A17 (abstract robot figure).
- **Decisions and why:** Used restroom sign icons rather than road photos to comply with course privacy guidelines (Syllabus p.9) because road photos contain license plates and pedestrian faces. Anonymized all filenames before testing; this proved critical because Gemini explicitly reflected client filenames in 2 of 20 responses.
- **What I learned / can explain at the defense:** How multi-modal Vision-Language Models (vision encoder + connector + LLM) process visual iconography versus dedicated lightweight pipelines; why fluent generation does not guarantee visual grounding on abstract silhouettes; and how to design a rigorous zero-contamination audit protocol.
- **AI use:** Claude Sonnet / Gemini assistant for scripting data retrieval and calculating statistical metrics; all 40 benchmark evaluations were run manually in live browser sessions.
- **Open questions / next:** Integrate Slide 10 summary into the main slide deck (R-3) and prepare backup slide for CLO 7 (R-26).
