# Qarau web

Next.js prototype for Qarau (working name; Kazakh қарау, "to inspect"): computer vision inspection of public
infrastructure from photos, with rules you can read. Two modules:

- **Roads, pothole detection.** A YOLO detector finds potholes; six rules turn the boxes into a repair priority.
- **Restrooms, sign matching.** A CLIP image encoder reads restroom door signs (gender and similarity); three rules
  turn a pair of signs into clear, review or confusing. Based on the IOAI 2025 "Restroom Icon Matching" task.

It runs fully on mock data until the real model service (`api/`) is connected. The contract it implements is in
[`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) (section 2 roads, 2b restrooms), the rules in
[`docs/RULES.md`](../docs/RULES.md) (Part 1 and Part 2).

## Run it

Needs Node 22 and pnpm.

```bash
pnpm install
pnpm dev                  # http://localhost:3000 (check the port is free first)
```

| Command | What it does |
|---|---|
| `pnpm build` then `pnpm start` | Production build and server |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `next typegen && tsc --noEmit` |
| `pnpm test` | Both rules engines (`vitest run`): RULES.md worked examples, boundaries, sample manifests |
| `pnpm draw-samples` | Redraws the six road scenes from `public/samples/samples.json` |
| `pnpm draw-restroom-samples` | Redraws the twelve restroom sign icons in `public/samples/restrooms/` |

## Renaming the product

Product name, tagline and module names live in **one file, `lib/brand.ts`**. The logo wordmark, page titles,
metadata, landing copy and navigation all read from it. `storagePrefix` there is the localStorage key prefix;
leave it alone on a rename unless you want every browser to start empty.

## Routes

| Route | What |
|---|---|
| `/` | Landing: problem, two modules with live mini-demos, how it works, rules, privacy, results, course, team |
| `/about`, `/design` | Method, limits, privacy, credits, AI-use statement, team · living design system |
| `/app` | Home: both modules side by side |
| `/app/roads` | Roads overview (KPIs, severity distribution, recent, review queue, hotspots) |
| `/app/roads/analyze`, `/reports`, `/reports/[id]`, `/map`, `/rules` | Pothole flow, history, map, rule editor |
| `/app/restrooms` | Restrooms overview (KPIs, verdicts, review queue, recent comparisons) |
| `/app/restrooms/compare` | Two signs → genders, similarity, verdict, rule checks, raw JSON (`?a=&b=` preselects samples) |
| `/app/restrooms/match` | One sign → ranked gallery, best opposite-gender match (the IOAI task) (`?q=` preselects) |
| `/app/restrooms/rules`, `/app/restrooms/checks/[id]` | S1–S3 editor with live preview · one stored comparison |
| `/app/analytics`, `/app/model`, `/app/settings` | Shared by both modules |
| `POST /api/analyze`, `POST /api/restroom`, `GET /api/health` | API routes (server side, call the model service) |

The old pothole URLs (`/app/analyze`, `/app/reports`, `/app/reports/:id`, `/app/map`, `/app/rules`) redirect to
their `/app/roads/...` pages (`next.config.ts`, query strings kept).

## Where things live

```
app/
  tokens.css            design tokens: colours, type scale, radii, shadows, motion (THE re-skin file)
  globals.css           base styles, CSS entry animations, imports Tailwind and tokens.css
  layout.tsx            fonts (next/font) + theme bootstrap script + metadata from lib/brand.ts
  page.tsx              landing          about/  design/
  app/                  the app: home, roads/*, restrooms/*, analytics, model, settings
  api/analyze           POST: file or sampleId + provider -> scored pothole Analysis
  api/restroom          POST: mode=compare|match, signs or sample ids + provider -> SignageAnalysis | MatchResult
  api/health            GET ?provider=: calls the provider's /health on the server
components/
  ui/                   hand-written primitives (button, card, badge, switch, slider, tabs, select, dialog ...)
  app/                  shell (module switcher), roads pages, shared pieces (KPI tile, distribution bars)
  restrooms/            compare, match, rules, overview, result view, sign slot, verdict and gender tags
  charts/               Recharts wrappers (all colours are CSS variables)
  landing/              header, footer, team grid, the two mini-demos
lib/
  brand.ts              product and module names (rename here)
  types.ts              contract types for both modules (ARCHITECTURE.md 2 and 2b)
  rules/                pothole rules engine (pure, tested) + default config
  signage/              signage rules engine S1–S3 + matching helpers (pure, tested) + default config
  providers/            mock | local | cloud behind one interface, for potholes and for restrooms (server only)
  mock/                 seeded demo analyses and sign checks, sample manifests, experiments loaders
  store/                localStorage stores: settings, rules (both), history (both), theme, last module
data/experiments.json             pothole experiment results (placeholder until ml/export_results.py runs)
data/restroom-experiments.json    restroom experiment results (placeholder rows R0–R6)
public/samples/                   six SVG road scenes + samples.json
public/samples/restrooms/         twelve SVG sign icons + samples.json
```

## Re-skinning (for the lead designer)

Everything visual comes from `app/tokens.css`:

- Light values sit on `:root, [data-theme="light"]`, dark values on `[data-theme="dark"]`.
- The `@theme inline` block maps them to Tailwind utilities (`bg-surface`, `text-muted`, `bg-sev-high`,
  `bg-verdict-review`, `text-gender-male-ink` ...). Tailwind's default palette is switched off, so components cannot
  use anything that is not a token.
- Restroom tokens: `--verdict-{clear,review,confusing}` (default to the severity scale) and
  `--gender-{male,female}` (teal and indigo: distinct for colour-blind readers, deliberately not pink/blue, and
  always paired with the Mars/Venus icon and the word).
- Fonts are set in `app/layout.tsx` (Barlow, Barlow Condensed, JetBrains Mono); keep the variable names.
- JS animation timings mirror the CSS motion tokens in `lib/motion.ts`.
- Check the result on `/design`, which shows every token and primitive in both themes side by side.

Motion never hides content: entry animations are CSS (`.stagger`, `.page-enter` in `globals.css`) that start from
visible content, page fades run only on client-side navigation, KPI numbers are rendered at their real value on the
server and only count when they change in the browser, and boxes, bars and demos rendered on the server are drawn
complete. All of it is off under `prefers-reduced-motion`.

## Switching the model provider

The provider is chosen per browser in **Settings** (mock / local / cloud) and drives **both** modules. "Check
connection" calls `/api/health?provider=...`, which calls the provider's own `GET /health` on the server.

1. Copy `.env.example` to `.env.local` (never commit `.env.local`).
2. Local: start the FastAPI service from `api/` (default `MODEL_API_URL=http://localhost:8000`).
3. Cloud: set `CLOUD_MODEL_API_URL`, restart.

Roads: local and cloud POST `multipart/form-data` (`file`, `conf`) to `<url>/predict` and expect an
`InferenceResult` (a Roboflow-style response is also accepted). Restrooms: they POST `a`, `b` to
`<url>/restroom/compare` and `query` plus repeated `gallery` to `<url>/restroom/match` (ARCHITECTURE.md 2b); the
match gallery is the bundled sample set, and the service's candidate ids `"0"`, `"1"`, … are mapped back to sample
ids. URLs and keys are read only on the server (`lib/providers/env.ts` imports `server-only`).

Errors are clean JSON `{ error: { code, message, hint } }`: `503 unreachable` when the service is down (the pages
offer a one-click switch to mock), `504 timeout`, `400` for a bad upload, and `422 unsupported_input` when a bundled
**SVG** sample would be sent to a real model (a real model cannot read the drawings; upload a real image instead).

## Deploying on Vercel

Root Directory `web`, default provider mock, no environment variables needed: `pnpm build` passes with none.
Nothing writes to disk at runtime; history lives in each browser. The API routes read bundled sample images from
`public/` only when a real model is asked to analyse a sample; `outputFileTracingIncludes` in `next.config.ts`
ships those image folders with the route functions.

## Adding or replacing sample images

**Road photos:** put the image in `public/samples/`, edit `public/samples/samples.json` (`file`, size, `meta`,
`location`, `detections` from the real model). `pnpm draw-samples` only redraws the SVG scenes.

**Restroom signs:** put the image in `public/samples/restrooms/` and edit `public/samples/restrooms/samples.json`:
`file`, `set` (the design set, i.e. the restroom), `trueGender`, and under `mock` the real model's `gender` and
`confidence`. Real pair similarities can go in `similarity.pairs` (`"idA|idB"`, ids in alphabetical order);
otherwise the deterministic mock similarity is used (high within a set, lower across sets). The `presets` list the
example pairs shown on Compare. The twelve shipped icons are original drawings; their predictions and similarities
are invented placeholders.

**If you use real IOAI images:** the IOAI 2025 Restroom data is licensed **CC-BY-4.0**. Keep the attribution
(task name, "IOAI 2025 committee", licence and a link to
https://github.com/IOAI-official/IOAI-2025/tree/main/Individual-Contest/Restroom) on the About page and in the
footer (`lib/credits.ts`), and say that the images were not changed, or how they were. Never add images with people.

## Pasting in real experiment results

- **Roads:** `ml/export_results.py` writes `data/experiments.json` in the ExperimentsFile shape (ARCHITECTURE.md 2).
  The loader (`lib/mock/experiments.ts`) accepts that shape and the placeholder shape, and fills missing metadata
  (protocol, dataset card) with labelled defaults. `"isMock": false` removes the "Demo data" badges on the pothole
  results (Pothole runs on the model page, the chart, the landing results card).
- **Restrooms:** `ml/restroom/export_results.py` writes `data/restroom-experiments.json` (RestroomExperimentsFile,
  ARCHITECTURE.md 2b). Rows with `isReal: true` show without a placeholder badge; `null` metrics read "not run yet";
  the IOAI reference points (0.77 / 0.90) are always labelled as published by IOAI, not ours.

The seeded demo histories (`lib/mock/analyses.ts`, 40 road analyses; `lib/mock/restroom-checks.ts`, 30 sign checks)
cover the 30 days before a fixed anchor date, 10 Nov 2026. They are deterministic (seeded PRNG, no
`Math.random`/`Date.now` at render), so server and client render the same. Items made in the browser are stored in
localStorage and merged with them. They stay demo data, so every page that shows them passes `show` to its
`DemoBadge` and keeps the badge whatever the results files say (`components/app/demo-badge.tsx`, test in
`lib/demo-badges.test.ts`). A single result made by the mock provider shows a "Mock result" badge.

## Rules

- Roads: `lib/rules/engine.ts`, defaults in `lib/rules/config.ts`, tests in `lib/rules/engine.test.ts`. Rule-hit
  points always add up to the score.
- Restrooms: `lib/signage/engine.ts`, defaults in `lib/signage/config.ts` (S1 0.80, S3 0.75), tests in
  `lib/signage/engine.test.ts`. Every result lists S1, S2 and S3 with passed true/false.

Each Rules page edits a copy saved in localStorage and sends it with every request, so the server scores with the
same values. If you change a default, change `docs/RULES.md` too.

## Known rough edges

- `/api/analyze` returns the contract `Analysis` plus a `photo` block; `/api/restroom` returns the contract
  `SignageAnalysis` plus an `inputs` block (and `place`), or a `MatchResult` plus `queryInput`.
- History made in a browser only exists in that browser (no database by design).
- Number fields beside sliders always use a dot as the decimal separator, whatever the browser language.
- On `/design`, dialogs and tooltips open in a portal and follow the page theme, not the panel's.
- RU/KZ languages are listed as "coming soon"; only English is wired.
