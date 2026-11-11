# Copy review (G-76)

A brand and copy pass over the user-facing text in `web/app` and `web/components` (headings, buttons, labels, empty states, errors, page titles, metadata) and over `docs/design/*.md`, in three rounds on 11 November 2026. The checklist is `ANTI-SLOP.md` (R5 placeholder copy, R6 numbers, R11 words), the voice in `PRINCIPLES.md` (Plain, Exact, Honest) and, for sentences, the patterns of the unslop writing guide (vague claim, slogan pair, colon reveal, link text that names no target). File and line refer to this branch after the rebase on `main` of 11 November, 19:35.

**Ownership.** Each string was traced with `git log -S '<text>'` and `git blame -w`. Dameli owns what her commits wrote: the landing hero and the sections she rewrote in G-8 (`ff4a0d2`), G-60 and G-61, her lines on `/design` and in `design-showcase.tsx`, the empty-state drawings (G-26 added the drawings only; the empty-state text is the teammates'), the social card alt text (G-5) and `docs/design/*`. A line that blame gives to `dkalikhan` only because G-8 re-indented it (the landing privacy and team sections, the Problem section restored in #382) stays with its first author, Tair. Dameli's rows are rewritten in this branch; every other row is a proposal for its owner and the code is untouched.

**Kept on purpose.** No honesty label changed: "Mock result", "Mock predictions", "Demo data", "Includes demo data", "Sample result" and "Placeholder numbers" read the same before and after, and so do all numbers and rule IDs.

## Round 1: audit

### Dameli's text, rewritten here

| # | Where | Before | Rule | After | Decision |
|---|---|---|---|---|---|
| D1 | `web/app/page.tsx` line 123 (hero heading) | "Inspect roads and signs with clarity." | Plain: "with clarity" fits any product and says nothing a visitor can check | "Inspect roads and signs from a photo." | Changed |
| D2 | `web/app/page.tsx` lines 128–129 (hero lead) | "Inspect road damage and compare door signs with computer vision. Qarau shows the evidence behind each result." | Exact: the road model finds only potholes ("The model only finds potholes", `web/app/app/roads/rules/page.tsx` line 13); "Inspect" repeats the heading; "the evidence" is vague | "Qarau finds potholes in road photos and compares restroom door signs with computer vision. Each result shows what the model found and which rules decided it." The name comes from `BRAND.name` | Changed |
| D3 | `web/app/page.tsx` line 157 (hero card) | "Why this priority?" | One name per thing: the result tab is "Why this priority" (`web/components/app/analysis-view.tsx` line 148) | "Why this priority" | Changed |
| D4 | `web/app/page.tsx` line 211 (section heading) | "One approach, two inspection tasks" | Slogan pair ("one X, two Y"); a heading names what the section holds (PRINCIPLES 4) | "Two inspection tasks" | Changed |
| D5 | `web/app/page.tsx` line 212 | "Choose a task to see how an image becomes an explainable result." | Plain: "explainable" is a label, not a fact; the cards show the steps ("Photo → detections → repair priority") | "Choose a task to see the steps from photo to result." | Changed |
| D6 | `web/app/page.tsx` lines 268–269 (Rules intro) | "The model produces predictions; the team's rules turn those predictions into an outcome. These examples use mock predictions and show rule hits computed by the app:" | Plain: "predictions" three times, "outcome" vague. Honest: keep "mock predictions" | "The model makes predictions; rules the team wrote turn them into a decision. Both examples are rule hits the app computed from mock predictions:" | Changed |
| D7 | `web/app/page.tsx` line 380 (toggle) | "Explore the course foundations" | Marketing verb and abstract noun; a toggle says what it opens | "Show the course topics behind the project" | Changed |
| D8 | `web/app/opengraph-image.alt.txt` | "Qarau: Computer vision inspection of public infrastructure from photos, with rules you can read." | Alt text describes the image (WCAG 1.1.1); the card also shows the logo and "қарау · Kazakh for “to inspect”", which the alt left out | "The Qarau logo and name, the Kazakh word қарау (“to inspect”), and the tagline “Computer vision inspection of public infrastructure from photos, with rules you can read.”" | Changed |
| D9 | `docs/design/PRINCIPLES.md` lines 35, 41, 60–61 and 71 | Quoted the old hero line; 7 line numbers had moved (`page.tsx` 120 and 130, `settings-client.tsx` 187, `settings.ts` 18–20, `analyze-client.tsx` 163, 265, 275, 312 and 316) | Exact: the page says each claim "can be checked by opening a page" | New hero quote; lines 123 and 134, 188, 18–21, 153, 236, 246, 283 and 287 | Changed |
| D10 | `docs/design/PRINCIPLES.md` Voice table | Three words with "In practice" only | Gap: D1, D4, D5 and T3, T4 passed the voice check because nothing in it named abstract nouns or slogan headings | A Do and a Don't from the app for each word, one added sentence per word | Changed |

Dameli's text checked and kept: the hero card ("INSPECTION 01 / ROADS", "From detection to priority", "Try this sample", `aria-label` "Example road inspection"), "Try a sign sample", "Preview a sign comparison", the eyebrow "The tools" and the header link "Tools"; her lines on `/design` (the intro sentence) and in `design-showcase.tsx` (token group titles, "Which colour token do I use?", which is the question the table answers, the drawing uses, the drop-zone strings); `docs/design/*.md`: R11 words 0 outside the list in `ANTI-SLOP.md` line 17, no em dash in prose (the one in `imagery.md` line 58 is an empty table cell), no exclamation mark, headings are noun labels. `ANTI-SLOP.md` line 3 ("generated instead of decided") is one contrast that defines the term, kept. The first-audit table in `ANTI-SLOP.md` cites `analyze-client.tsx` line 206 for the scan line (now 197); it is a dated record and stays as recorded.

### Teammates' text, proposals only

| # | Where | Text | Rule | Proposal | Owner |
|---|---|---|---|---|---|
| T1 | `web/app/page.tsx` lines 204–205 (The problem) | "{Qarau} makes that job faster and more consistent, and shows how every decision was made." | Honest, R6 in spirit: no timing stands behind "faster" | "Qarau applies the same written rules to every photo and shows how each decision was made." | Tair (`9782b6f`, restored in #382) |
| T2 | `web/app/page.tsx` lines 186 and 191 | "Most inspection is still done by eye"; "Most are reported by drivers after they damage a car." | Honest: "most" with no source | Name the source (a city road-service figure), or drop "Most": "Inspection is still done by eye"; "Many are reported by drivers…" | Tair |
| T3 | `web/app/page.tsx` line 266 (eyebrow) | "Explainable by design" | Slogan; the heading under it already says "Rules you can read" | "The rules" | Tair |
| T4 | `web/app/page.tsx` line 369 (heading) | "Six students, one platform" | Slogan pair, the same shape as D4 | "Who built Qarau" | Tair |
| T5 | `web/components/landing/rule-hit-card.tsx` line 69 (link) | "Change the thresholds and watch the result move" | Link text should name its target (WCAG 2.4.4); "watch the result move" is vague | "Change these thresholds on the Rules page" | Tair's wording (`9782b6f`), moved into Dameli's card in G-61; left as his |
| T6 | `web/components/app/platform-overview-client.tsx` line 52 | "Both modules at a glance: the 30 days to …" | Stock phrase; the sentence works without it | "Both modules: the 30 days to …" (the "Includes demo data" badge stays) | Tair |
| T7 | Page titles: `web/app/app/analytics/page.tsx` line 8, `web/app/app/restrooms/match/page.tsx` line 9, `web/app/app/roads/rules/page.tsx` line 5 | Tab "Analytics", heading "Monitoring"; tab "Find the counterpart", heading "Find the other door"; tab "Rules" while the restroom tab says "Signage rules" | One name per page (WCAG 2.4.2: the tab, the history and a screen reader announce the title) | Make each tab title a short form of its heading: "Monitoring", "Find the other door", "Repair rules" | Tair |
| T8 | `analyze-client.tsx` 283 "Analysing…" next to 287 "Analyze photo"; "Analysed" in `analysis-view.tsx` 122, `report-detail-client.tsx` 54, `web/app/app/roads/map/page.tsx` 16 (with "coloured"); "analysed" in `dashboard-client.tsx` 67, 79, 98 and `platform-overview-client.tsx` 63; `web/app/api/analyze/route.ts` 104 | Two spellings in one interface | One spelling (already open in PRINCIPLES, R-12) | Pick US or British once; routes such as `/app/roads/analyze` stay | Team decision, R-12 |
| T9 | `web/app/api/analyze/route.ts` line 104, `web/app/api/restroom/route.ts` line 119 | "Something went wrong while …" | No cause, no next step (already in the PRINCIPLES Don't table) | "The photo could not be analysed. Try again, or switch to the mock provider in Settings." | Tair |
| T10 | `web/components/design/design-showcase.tsx` lines 401, 405, 431–432, 472, 481 | "Info callout" / "Neutral information.", "Empty state" / "Shown when there is nothing yet.", "Card title" / "Card description.", "First panel.", "Dialog title" | R5: placeholder copy on a public page | Real strings from the app, e.g. "Recent analyses" / "Newest first. Open a row for the full report." (`dashboard-client.tsx` lines 111–112) and the "Reset demo data?" dialog | Tair (`abecc25`); the G-6 agent is editing these sections now |
| T11 | `web/app/design/page.tsx` line 21 | "Asphalt, markings and signs" | The heading names a mood; the page holds colours, type and components | "Colours, type and components" (optional: the eyebrow already says "Design system") | Tair (`9782b6f`) |
| T12 | `web/app/not-found.tsx` line 7 | "Nothing to inspect here" | The first thing a screen reader announces is a pun, not the state | "Page not found", keeping "The page you asked for is not here." | Tair |
| T13 | `web/components/app/map-view.tsx` line 67 | "Map tiles could not load (offline?)." | A guess in brackets instead of a next step | "Map tiles could not load. Check the internet connection; markers are still shown and listed below." | Tair |

Teammates' text checked and kept: the error and hint pairs in `web/lib/providers/http.ts`, `restroom-http.ts` and `web/lib/upload.ts` (cause, limit and next step), the empty states (each says what to press and what appears), the rule texts on both Rules pages, the chart titles on Analytics (they state the number they show), "Uncertain cases go to a review queue instead of being hidden." (`web/app/page.tsx` line 79, the contrast is the honesty point) and "cannot tell the gender at a glance" (`restroom-rules-client.tsx` line 17, literal). R11 over `web/app` and `web/components`: 0. R5 lorem: 0. The "—" in metric cells (`web/app/page.tsx` lines 314–315, `web/app/app/model/page.tsx`) marks a missing value, not a dash in prose.

### Design lab (Dameli's, proposals only)

The G-41 lab agent is editing `web/app/design/lab/` and `web/lib/design-lab.ts` in parallel, so these stay as proposals to avoid a conflict.

| # | Where | Text | Rule | Proposal |
|---|---|---|---|---|
| L1 | `web/app/design/lab/type-specimen.tsx` lines 51–55 | The Kazakh line says "Qarau inspects roads and signs by photo"; the Russian line adds "and explains each rule" | The two specimen lines should say the same thing; PRINCIPLES (Open) asks for a native speaker before any translated text is shown | One sentence in both languages, checked by a native speaker |
| L2 | `web/lib/design-lab.ts` line 156 | "a darker amber that carries a white label" | "Carries" stands in for a measured claim | "a darker amber with a white label" (the contrast table below the columns gives the ratio) |

## Round 2: re-read as a critic

## Round 3: re-read as a critic
