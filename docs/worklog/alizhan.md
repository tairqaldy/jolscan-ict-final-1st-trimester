# Worklog: Alizhan

**Lane:** Serving and performance. Tasks suggested for Alizhan: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 · S-10 (#33) · Lighthouse pass
- **Status:** in progress; two issues addressed, a third still needs investigation.
- **What I did:** Measured the production build of the landing page and dashboard in Lighthouse, reduced unnecessary font preloads, and corrected inaccessible labels on animated statistics.
- **Result:** On the local production build, `/app` accessibility improved from 96 to 100 on mobile and desktop. Both pages loaded 7 font files (126,044 bytes) instead of 13 (185,522 bytes). Performance was 100 in both local runs; these single runs do not establish a latency improvement. See the S-10 pull request for all scores and measurement conditions.
- **Decisions and why:** Preload only Latin glyphs; other font ranges remain available when needed. Expose the final number to assistive technology while hiding the animated visual copy.
- **What I learned / can explain at the defense:** Preloading font subsets consumes network bandwidth even if a page does not use those glyphs; accessible text should be exposed once without unsupported ARIA attributes.
- **AI use:** Codex desktop, GPT-6, for measurement and changes; personal review pending.
- **Open questions / next:** Identify and validate a third meaningful improvement and repeat measurements on the deployed site after review and deployment.
