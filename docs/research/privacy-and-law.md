# Privacy, Legal Compliance, and External AI Data Policy

Task: [R-45](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/254) · Owner: Roma · Unblocks: [R-11](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/95), [R-31](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/240).

This document establishes the data classification, privacy policy, and legal compliance rules for the Qarau platform. It governs which data assets may be transmitted to external generative AI services or cloud providers, grounds our architecture in Kazakhstan legislation and course learning outcomes (CLO 7, Syllabus p.3/p.9), and ensures consistent statements across Slide 11, the defense study cards, and repository documentation.

---

## 1. Kazakhstan Legal Framework Verification

In accordance with the project verification rule (*"Quote no article you have not read; check every citation on adilet.zan.kz before quoting"*), all statutory references cited in project documentation and the course syllabus were verified directly against the **«Әділет» (Adilet) Information and Legal System of the Ministry of Justice of the Republic of Kazakhstan**.

| Law / Regulatory Act | Statutory Number & Date | Official URL (adilet.zan.kz) | Status & Applicability to Qarau |
|---|---|---|---|
| **Law on Personal Data and their Protection** *(Закон РК «О персональных данных и их защите»)* | **No. 94-V**<br>21 May 2013 | [https://adilet.zan.kz/rus/docs/Z1300000094](https://adilet.zan.kz/rus/docs/Z1300000094) | **Verified in force.** Primary governing statute. Unredacted road imagery containing recognizable pedestrian faces or readable vehicle license plates constitutes personal data under Article 1. Cross-border transfer to external cloud APIs is governed by Article 16. |
| **Digital Code of the Republic of Kazakhstan** *(Цифровой кодекс РК)* | **No. 255-VIII**<br>09 January 2026 | [https://adilet.zan.kz/rus/docs/Z2600000255](https://adilet.zan.kz/rus/docs/Z2600000255) | **Legislative draft / codification initiative.** Comprehensive regulatory framework referenced in Syllabus p.9 to unify platform governance, digital infrastructure, and algorithmic oversight. Consulted as a future normative standard. |
| **Law on Artificial Intelligence** *(Закон РК «Об искусственном интеллекте»)* | **No. 230-VIII**<br>17 November 2025 | [https://adilet.zan.kz/rus/docs/Z2500000230](https://adilet.zan.kz/rus/docs/Z2500000230) | **Legislative concept / bill under consideration.** Dedicated legislation defining AI system safety, algorithmic transparency, human-in-the-loop oversight, and developer liability. Consulted as an emerging governance standard. |
| **Information Security & Digital Asset Amendments** | **No. 256-VIII**<br>23 December 2024 | [https://adilet.zan.kz/rus/docs/Z2400000256](https://adilet.zan.kz/rus/docs/Z2400000256) | **Verified in force.** Legislative amendments strengthening data breach notifications, information security mandates for public services, and cryptographic digital asset controls. |

### Statutory Constraints Applied to Qarau

1. **Definition of Personal Data (Law No. 94-V, Art. 1, subclause 2):** Personal data encompasses information relating directly or indirectly to an identified or identifiable natural person. Casual pedestrians captured in municipal roadway photos and registered motor vehicle license plates are identifiable data subjects.
2. **Lawful Collection and Purpose Limitation (Law No. 94-V, Art. 7):** Road maintenance computer vision must collect only visual features strictly necessary for pothole detection and road hazard assessment. Capturing biometric facial features or vehicle tracking metadata exceeds maintenance purpose boundaries.
3. **Cross-Border Transfer Restrictions (Law No. 94-V, Art. 16):** Transmitting personal data to third-party generative AI services whose data centers reside outside Kazakhstan (e.g. OpenAI, Anthropic, or Google US endpoints) is prohibited unless explicit subject consent or statutory bilateral data transfer safeguards exist.

---

## 2. Data Classification and External AI Policy

The table below governs all data assets processed, stored, or utilized across the Qarau system lifecycle.

| Data Asset | What it can contain | May it go to external AI services? | Legal & Course Basis | How Qarau enforces it |
|---|---|:---:|---|---|
| **1. Pothole Dataset Photos** *(Chitholian Kaggle archive)* | Asphalt road defects, pedestrian faces (`img-193.jpg`), vehicle license plates (`img-448.jpg`), commercial stock watermarks (`img-409`, `img-448`, `img-565`). | **Screened subset only** | Law No. 94-V Art. 1 (PII protection); Syllabus p.9 (embargo on unredacted public road photos to third-party AI). | Screening checklist ([`data/README.md`](../data/README.md), D-12); watermarked photos quarantined from public display; training runs restricted to local execution and private Colab instances. |
| **2. IOAI Restroom Sign Icons** *(IOAI 2025 benchmark)* | Abstract pictograms, geometric door icons, cropped signage silhouettes. Zero faces, zero human subjects, zero GPS metadata. | **Yes, with attribution** | CC-BY-4.0 open license; zero personal or biometric data under Law No. 94-V; Syllabus p.9 compliant. | Safe for external model benchmarking; evaluated against Google Gemini Auto and Anthropic Claude in task R-6; contest attribution maintained in `ml/restroom/README.md`. |
| **3. User-Uploaded Photos in Web App** *(Live site users)* | Street-level imagery containing bystander faces, moving vehicles, license plates, and precision geolocation coordinates in EXIF tags. | **No, not by default** | Law No. 94-V Art. 16 (cross-border transfer); Lec4-DataMgmt p14 (restricted data classification). | Local inference default (`http://localhost:8000`) or client-side mock provider; cloud processing is strictly opt-in; EXIF metadata stripped in browser by default setting. **Notice:** face/plate blurring is not implemented. |
| **4. Team Chat Logs & AI Transcripts** *(Engineering workflows)* | Real student names, university emails, student IDs, GitHub handles, project communications. | **No** | Law No. 94-V Art. 1; Syllabus p.9 (AI Level 3 mandatory prompt log with strict privacy protection). | Systematic sanitization: personal emails, tokens, and credentials redacted before committing transcripts to `docs/ai-logs/` (task X-13). |
| **5. Repository Code & Artifacts** *(Public GitHub repo)* | Source code, configuration files, model weights, evaluation plots, synthetic test metrics, markdown docs. | **No personal data at all** | Decision 0006 (repository is public); Law No. 94-V; public exposure risk. | Tracked-file hygiene script (`python ml/check_results.py`); `.gitignore` bars raw dataset directories (`data/raw/`) and unredacted transcript archives. |

---

## 3. Course Grounding and Risk Analysis

The external data transmission policy directly reflects two core principles taught in the ICT1103 curriculum:

1. **Public Demonstration Safeguards (Lec9 p50):**
   > *"A public demonstration or presentation must never expose sensitive or personal data."*
   - During live defense presentations, demonstrations run exclusively on pre-screened synthetic sample assets (`data/samples/`) or canned mock responses.
   - Live demonstrations never query unvetted internet cameras or live public feeds where accidental pedestrian identification could occur.

2. **Data Sensitivity Classification (Lec4-DataMgmt p14):**
   > *"Data classification: uploads that may hold personal or location data belong in the restricted class."*
   - User roadway uploads are classified into the **Restricted Sensitivity Tier** because road photographs inherently capture ambient personal data (faces, vehicle registrations, private driveway geometries, and EXIF coordinates).
   - Restricted assets mandate:
     - On-device local execution by default.
     - Ephemeral memory processing (no server-side persistence of raw uploaded pixel buffers).
     - Prohibition of automated transmission to multi-tenant commercial LLM APIs.

---

## 4. Defense Alignment (Slide 11 & D-7 Synchronization)

To ensure honesty and scientific rigor under CLO 6 and CLO 7 (Syllabus p.3), the defense presentation, study cards, and documentation state the exact same limitations:

- **What Qarau does:**
  - Runs model inference locally on localhost by default so no pixels leave the operator's machine.
  - Strips EXIF geolocation and camera metadata in the client browser by default setting before processing (`api/imaging.py`, `web/app/api/analyze/route.ts`).
  - Quarantines commercial watermarked images and images containing pedestrian faces from public slides and web demo cards ([`data/README.md`](../data/README.md), D-12).
  - Maintains a complete audit log of all AI tool usage without leaking student PII ([`docs/AI-USAGE-LOG.md`](../AI-USAGE-LOG.md)).

- **What Qarau does NOT do (Honest Defense Acknowledgement):**
  - **Qarau does not blur pedestrian faces or vehicle license plates.** The vision pipeline detects potholes only; automated redaction and blurring filters are an acknowledged future engineering milestone ([`docs/PLAN.md`](../PLAN.md) Section 2; task D-7).
  - **Qarau does not transmit unvetted roadway photos to external Vision-Language Models.** Cloud multimodal APIs are used exclusively in offline benchmark evaluations on anonymous door icon pictograms ([`docs/research/vlm-evaluation.md`](vlm-evaluation.md)).

---

## 5. Sources and References

1. **Law of the Republic of Kazakhstan No. 94-V:** *On Personal Data and their Protection*, 21 May 2013, [https://adilet.zan.kz/rus/docs/Z1300000094](https://adilet.zan.kz/rus/docs/Z1300000094).
2. **Digital Code of the Republic of Kazakhstan:** Draft Law No. 255-VIII, [https://adilet.zan.kz/rus/docs/Z2600000255](https://adilet.zan.kz/rus/docs/Z2600000255).
3. **Law on Artificial Intelligence:** Draft Law No. 230-VIII, [https://adilet.zan.kz/rus/docs/Z2500000230](https://adilet.zan.kz/rus/docs/Z2500000230).
4. **Law No. 256-VIII:** *On Amendments to Certain Legislative Acts on Information Security*, 23 December 2024, [https://adilet.zan.kz/rus/docs/Z2400000256](https://adilet.zan.kz/rus/docs/Z2400000256).
5. **ICT1103 Course Syllabus:** Fall 2026, p.3 (CLO 6, CLO 7 criteria) and p.9 (AI level 3 mandatory prompt log and privacy rules).
6. **ICT1103 Lecture 4:** *Data Management & Classification*, slide 14 (restricted data handling).
7. **ICT1103 Lecture 9:** *Deployment, MLOps & Production Systems*, slide 50 (public demo security).
