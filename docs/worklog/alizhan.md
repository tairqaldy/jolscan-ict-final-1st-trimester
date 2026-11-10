# Worklog: Alizhan

**Lane:** Serving and performance. Tasks suggested for Alizhan: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 · S-4 (#23) · Local web/API integration
- **Status:** in progress; blocked on the team-trained E0 weights for the final real-detection check.
- **What I did:** Ran the local Next.js app and FastAPI on Windows; selected Local and checked health in Settings. Uploaded the screened `img-7.jpg` test-set photo locally, with EXIF removed, and received a real `yolo26n` response. Stopped FastAPI and verified the page showed the actionable `unreachable` message and retry option.
- **Result:** Next.js `/api/analyze` and FastAPI `/predict` returned HTTP 200; the stock model reported zero detections on this pothole image. With an explicitly synthetic local response containing one box, the page drew the box and displayed one detection and R1/R2 rule hits. This fixture verifies rendering only, not model accuracy. No test image or weights were committed.
- **Decisions and why:** COCO weights are not trained on potholes; did not mark S-4 done or interpret its empty result as a valid pothole prediction.
- **What I learned / can explain at the defense:** The browser sends to a Next.js route, which forwards the image to local FastAPI. Rules run on the returned normalized boxes. The site gives a readable message if the service is down.
- **AI use:** Codex assisted with setup and checks; see AI-USAGE-LOG.md. Alizhan has not yet personally reviewed this draft.
- **Open questions / next:** After S-2 supplies E0, rerun the same flow on a screened test image and verify actual boxes and model name. C-8 is separate and needs Nazar's selected restroom pipeline.
