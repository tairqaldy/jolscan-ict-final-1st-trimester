# Anti-slop checklist (G-42)

"Slop" is design that looks generated instead of decided: defaults nobody chose, decoration that says nothing, numbers nobody measured. These rules come from the team's design rules (docs/HANDOFF-DAMELI.md, section 3) and the course: aesthetic and minimalist design (Lec3-HCI p21) and honest charts (Lec4-DMViz p31). Check them by search, not by taste. Run every check from the repository root in `bash`.

| # | Rule | How to check |
|---|---|---|
| R1 | No gradient heroes (the purple-to-blue default). Repeating stripes for road markings are allowed. | `grep -rnE --include='*.tsx' --include='*.css' 'gradient\(' web/app web/components \| grep -v repeating-linear-gradient` finds nothing |
| R2 | No glassmorphism by default. | `grep -rnE --include='*.tsx' --include='*.css' 'backdrop-blur\|backdrop-filter' web/app web/components` finds nothing |
| R3 | No emoji as icons. Icons come from lucide-react. | `python3 -c "import pathlib,re;e=re.compile('[\U0001F300-\U0001FAFF☀-➿]');print(sum(len(e.findall(p.read_text())) for p in pathlib.Path('web').rglob('*.tsx') if 'node_modules' not in str(p)))"` prints 0 |
| R4 | No fake testimonials, client logos or "trusted by" lines. | `grep -rniE --include='*.tsx' 'testimonial\|trusted by\|loved by\|as seen' web/app web/components` finds nothing |
| R5 | No lorem ipsum or placeholder copy. | `grep -rni --include='*.tsx' lorem web/app web/components` finds nothing |
| R6 | No number on screen without a source. Measured numbers come from the results files; typed ones name their source; invented ones carry the Demo badge. | `grep -rnE --include='*.tsx' '[0-9]{2}%' web/app web/components`, then check each hit |
| R7 | No motion that loops without reason or delays reading; everything stops under reduced motion. | `grep -rnE --include='*.tsx' 'repeat: ?Infinity\|setInterval\(' web/app web/components` and `grep -n infinite web/app/globals.css`, then check each hit |
| R8 | At most two type families. | `grep -n next/font/google web/app/layout.tsx` imports two |
| R9 | At most three corner radii plus `full`. | `grep -cE '^\s+--radius-(xs\|sm\|md\|lg\|xl):' web/app/tokens.css` prints 3 or less |
| R10 | No raw colours in components: everything comes from tokens. | `grep -rnE --include='*.tsx' '#[0-9a-fA-F]{6}\b' web/app web/components` finds nothing, or a reason is written |
| R11 | No generic AI copy (seamless, unlock, leverage, empower, cutting-edge, effortless, elevate, supercharge, game-changer). | `grep -rniowE --include='*.tsx' 'seamless(ly)?\|unlock\|leverag(e\|ing)\|empower\|cutting-edge\|effortless(ly)?\|elevate\|supercharge\|game-?changer' web/app web/components` finds nothing |
| R12 | One label style: no hand-written letter spacing (G-23). | `grep -rn 'tracking-\[' web/app web/components` finds nothing |
| R13 | The Demo badge is the honesty rule, not slop: pages with seeded or mock data must show it. | Open each page with seeded data and look for "Demo data" or "Includes demo data" |

Design pull requests tick "ANTI-SLOP.md checked" in the pull request template.

## First audit: `main`, 11 November 2026

| # | Result | Decision |
|---|---|---|
| R1 gradients | 0 | Passes. |
| R2 glass | 0 | Passes. The team cards were checked by eye: solid surfaces, no blur. |
| R3 emoji | 0 | Passes. |
| R4 fake proof | 0 | Passes. |
| R5 lorem | 0 | Passes. |
| R6 numbers | 2 typed percentages | **Keep, both sourced.** About page, "about 75%" per-sign gender: `docs/ML-EXPERIMENT-RESTROOM.md` line 81. Compare result, "90%" pairwise and "57%" per sign: `docs/RULES.md` line 99. Both belong to the restroom lane (Nazar); update them if the export changes. |
| R7 motion | 3 | **Fixed in G-54 (#288):** the hero demo replays every 7 s (`web/components/landing/hero-demo.tsx`) and the sign-pair demo cycles every 5 s (`web/components/landing/pair-demo.tsx`); both now have a Pause/Play button (`web/components/landing/demo-pause-button.tsx`) and do not loop under reduced motion. **Keep one:** the scan line on Analyze (`web/components/app/analyze-client.tsx` line 206) only runs while an analysis is in progress, as a progress indicator, and is off under reduced motion. |
| R8 families | 2 (Overpass, JetBrains Mono) | Passes, since G-4. |
| R9 radii | 5 tokens (`xs`, `sm`, `md`, `lg`, `xl`) plus `full` | **Fix in G-49 (#283):** three values plus `full`. |
| R10 raw colours | 2, in `web/app/layout.tsx` lines 28–29 | **Keep.** They set the browser's theme colour, and metadata cannot read CSS variables; the comment there says they mirror `--bg`. |
| R11 AI copy | 0 | Passes. |
| R12 letter spacing | 15 hand-written `tracking-[…]` values | **Fix in G-23 (#167):** one `stamp` label style. |
| R13 Demo badge | 46 uses | Passes. Keep it: it is the honesty rule. |

## Recheck: overnight polish, 13 November 2026

R1 to R12 rerun on the polish branch: no new hits. R12 is now 0: the Match page's "Its other door" label uses the `eyebrow` style instead of its own letter spacing. The one R1 hit (`web/app/globals.css`, an underline drawn as a background) and the two R10 hits (theme colour in `web/app/layout.tsx`) are the ones kept in the first audit. R13: the Severity breakdown, Confidence histogram and Latency by provider charts on Analytics are drawn from the seeded history and now carry "Includes demo data".
