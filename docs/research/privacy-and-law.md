# Privacy, the law, and what may go to external AI services

Task: [R-45](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/254) · Owner: Roma · Unblocks: [R-11](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/95), [R-31](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/240).

This page says which of our data may be sent to external AI services or cloud providers, and which laws and course rules that rests on. Slide 11, the study cards and the other documents should say the same thing.

---

## 1. Kazakhstan laws we cite

The project rule is to quote no article we have not read, and to check every citation on adilet.zan.kz first. The four acts below were opened on Adilet on 12 November 2026. The checks cover the title, number, date and the article titles named here, not a legal reading of each article.

| Act | Number and date | Adilet | What was checked, and why it matters to Qarau |
|---|---|---|---|
| Law "On Personal Data and Their Protection" (Закон РК «О персональных данных и их защите») | No. 94-V, 21 May 2013 | [Z1300000094](https://adilet.zan.kz/rus/docs/Z1300000094) | Opens. Art. 7 is titled "conditions of collection and processing of personal data", Art. 16 "cross-border transfer of personal data". A road photo with a recognisable face or a readable licence plate holds personal data. |
| Digital Code of the Republic of Kazakhstan (Цифровой кодекс РК) | No. 255-VIII, 9 January 2026 | [K2600000255](https://adilet.zan.kz/rus/docs/K2600000255) | Opens; an adopted code, not a draft. The syllabus names it in its data security rule (Syl p.9). Codes use the `K` prefix: the `Z2600000255` link does not open. |
| Law "On Artificial Intelligence" (Закон РК «Об искусственном интеллекте») | No. 230-VIII, 17 November 2025 | [Z2500000230](https://adilet.zan.kz/rus/docs/Z2500000230) | Opens; an adopted law, not a bill. Its commencement is set in Art. 31. The syllabus names it next to the Digital Code (Syl p.9). |
| Law No. 256-VIII (amendment on cybersecurity, as cited in the course) | 9 January 2026 according to Lec5 p4 | not found | Lec5 p4 cites it as an amendment to the cybersecurity rules and says to verify it. The link `Z2400000256` does not open, and we did not find the act on Adilet, so we do not rely on it. |

What this means for Qarau:

1. A road photo can hold personal data: people and licence plates are in the pothole dataset (`img-193.jpg` shows people, `img-448.jpg` a plate; `data/README.md`). EXIF can also hold GPS.
2. Collect and keep only what the task needs (Law No. 94-V, Art. 7). We need the road surface, not people, cars or locations.
3. Sending personal data to a service abroad is a cross-border transfer (Law No. 94-V, Art. 16). Most AI services run abroad. The course rule is stricter and simpler: "Personal, medical, biometric, financial or confidential data must never be uploaded to external AI services or public repositories" (Syl p.9).

---

## 2. What may go to external AI services

| Data | What it can contain | May it go to external AI services? | Basis | How Qarau enforces it |
|---|---|:---:|---|---|
| **1. Pothole dataset photos** (Chitholian, Kaggle) | Road surface; people (`img-193.jpg`), a licence plate (`img-448.jpg`), stock-photo watermarks (`img-409.jpg`, `img-448.jpg`, `img-565.jpg`) | **Screened photos only** | Law No. 94-V; Syl p.9 | The D-12 screening checklist ([`data/README.md`](../../data/README.md)); a photo that fails it is never shown publicly and is only analysed with the local model ([`docs/design/imagery.md`](../design/imagery.md)). Training ran on a team laptop (Apple M5, `ml/results/experiments.csv`). |
| **2. IOAI restroom sign icons** (IOAI 2025) | Pictograms and door icons; no people, no GPS | **Yes, with attribution** | CC-BY-4.0 ([`ml/restroom/README.md`](../../ml/restroom/README.md)); no personal data | Used in the R-6 audit with Gemini and Claude ([`vlm-evaluation.md`](vlm-evaluation.md)). |
| **3. Photos uploaded in the web app** | Faces, cars, licence plates, GPS in EXIF | **No** | Law No. 94-V, Art. 16; Syl p.9 | The default provider is the mock (canned results, no model). `local` sends the photo to our API on the same laptop. `cloud` is opt-in and sends it to a hosted model service (our API on a Hugging Face Space, or Roboflow's hosted API; `web/lib/providers/cloud.ts`), which is a transfer abroad, so it is only for screened dataset photos ([`api/README.md`](../../api/README.md): "Public Spaces only ever receive images from the public dataset, screened in task D-12"). The browser re-encodes each upload, which drops EXIF and GPS; this is on by default and can be switched off in Settings (`web/lib/store/settings.ts`, `web/lib/image.ts`). The API keeps no image (`api/main.py`, `_log_prediction`). **Face and plate blurring is not built.** |
| **4. Team chats and AI transcripts** | Names, emails, student IDs, GitHub handles | **No** | Law No. 94-V; Syl p.9 | Personal data, tokens and passwords are removed before a transcript is committed to `docs/ai-logs/` (task X-13, still open). One early session did get the team's Telegram chat export; that entry in [`docs/AI-USAGE-LOG.md`](../AI-USAGE-LOG.md) says so and says not to repeat it. |
| **5. The public repository** | Code, docs, result files, plots | **Holds no personal data** | Decision 0006 (the repository is public) | No weights, datasets or `.env` files in git (`.gitignore`: `api/weights/`, `datasets/`, `data/raw/`); `python ml/check_results.py` checks the result files and tracked-file hygiene in CI. |

---

## 3. What the course says

1. "Do not expose sensitive data through a public demo" (Lec9 p50, on Gradio share links). The defense demo uses the mock provider or our local API with the screened sample photos.
2. EXIF holds geolocation and camera settings (Lec4-DataMgmt p12–14, as cited in [`docs/COURSE-GROUNDING.md`](../COURSE-GROUNDING.md); not re-checked here, the deck is not in our course folder). We treat uploads as restricted data: processed on our own machine, not stored as images, and never sent to an external AI service.
3. "Verify important claims" (Lec7 p64). This is why every law above was opened on Adilet before it was cited.

---

## 4. What we say at the defense (slide 11, D-7)

What Qarau does:

- Sends no uploaded photo to an external AI service. Real analysis at the defense runs on our API on the presenting laptop; the hosted `cloud` provider is opt-in and only for screened dataset photos.
- Drops EXIF and GPS in the browser before upload, on by default (a Settings switch).
- Keeps photos with people, plates or watermarks off slides and public pages (D-12, `docs/design/imagery.md`).
- Logs every AI use with its check ([`docs/AI-USAGE-LOG.md`](../AI-USAGE-LOG.md)).

What Qarau does not do:

- **It does not blur faces or licence plates.** The detector finds potholes only; blurring is future work ([`docs/PLAN.md`](../PLAN.md); task D-7).
- **External AI services saw only IOAI door icons**, in the R-6 audit ([`vlm-evaluation.md`](vlm-evaluation.md)).

---

## 5. Sources

1. Law of the Republic of Kazakhstan No. 94-V of 21 May 2013 "On Personal Data and Their Protection", <https://adilet.zan.kz/rus/docs/Z1300000094>.
2. Digital Code of the Republic of Kazakhstan No. 255-VIII of 9 January 2026, <https://adilet.zan.kz/rus/docs/K2600000255>.
3. Law of the Republic of Kazakhstan No. 230-VIII of 17 November 2025 "On Artificial Intelligence", <https://adilet.zan.kz/rus/docs/Z2500000230>.
4. ICT1103 syllabus, p.3 (CLO 7) and p.9 (data security rule, AI level 3).
5. ICT1103 Lec5 p4 (Law No. 256-VIII, "verify scope and publication date"); Lec7 p64; Lec9 p50.
