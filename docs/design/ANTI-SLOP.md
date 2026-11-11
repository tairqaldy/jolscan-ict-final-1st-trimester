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
