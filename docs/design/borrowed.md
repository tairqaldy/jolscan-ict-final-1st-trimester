# Borrowed components and effects

What we looked at from outside component libraries, under which licence, what it would add, and what is in the repository. Rule: no copied source that the licence forbids us to redistribute (the repository is public), no new dependency for an effect, and every effect stops under reduced motion (the OS setting and the Settings switch, G-64).

## G-60: one landing moment, "How it works" (11 November 2026)

Compared on a temporary route that was deleted before the pull request. Screenshots: `docs/design/landing-effect-g60/` (`compare-1440-light.png`, `compare-1440-dark.png`, `compare-375-light.png`, `compare-375-dark.png`, the frame strips `strip-c-*.png` and `strip-b-375-light.png`).

| Variant | Source and licence | Dependencies | Result |
|---|---|---|---|
| A: no effect | what `main` had | none | Baseline. |
| B: animated beam | Magic UI Animated Beam, MIT. Rewritten by hand, not copied. | `motion/react` (already in the app) plus a client component with a ResizeObserver | **Rejected.** At 375 px the line runs down through the step text. The section becomes client JS to measure the path, and the path was measured while the cards were still rising, so it came out tilted. The original repeats forever and has no reduced-motion check. |
| C: step line | our own CSS, nothing copied | none (CSS scroll timeline) | **Kept.** A 2 px accent line on top of each step fills in step order as the list scrolls in. |
| D: spotlight card | React Bits Spotlight Card, MIT + Commons Clause. Rewritten by hand, not copied. | none | **Rejected.** It follows the pointer only, so phones see nothing, and it says nothing about the pipeline: decoration. |

Not tried: Aceternity (its licence forbids redistributing the source), React Bits Blur Text and Count Up (their registry pins `motion@^12`, the app has 14.10.1; the app already has its own count-up).

Why C: the four steps are a pipeline, and the line fills photo, model, rules, action in that order, so the order is read once. It is tied to scrolling, so it never plays on its own and never loops (ANTI-SLOP.md R7), and it adds no JavaScript. Easing is `--ease-standard` (`lib/motion.ts` `ease.standard`). Without scroll timelines (Firefox today) and under reduced motion the line is simply drawn. Copy, the Demo badges and the two demo players are unchanged.

Code: `web/app/globals.css` (block "G-60"), the class `how-steps` on the list in `web/app/page.tsx`, test `web/lib/how-steps-motion.test.ts`.
