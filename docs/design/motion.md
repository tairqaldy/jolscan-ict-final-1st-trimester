# Motion and micro-interactions (G-73)

Which micro-interactions Qarau uses, where, how fast and why. Read this before adding a hover, a press state, a reveal or a loading state. Tokens live in `web/app/tokens.css` (`--duration-*`, `--ease-*`) and `web/lib/motion.ts`; the Reduce motion switch is G-64. The Motion section of `docs/DESIGN-BRIEF.md` is the short version; this file is the long one.

## 1. Reference and how it was measured

Dameli's reference is the Refero style board "dope.security design system" (https://styles.refero.design/style/e1f18a7e-5af1-46b3-8f89-bce6c78b80d4). The board itself describes colour and type; most of the motion is on the site it was taken from, https://www.dope.security/ (built with Webflow). Both were opened on 11 November 2026 with Playwright (Chromium, 1440 × 900):

- every element's computed `transition` and `animation`, grouped by value;
- every `@keyframes` rule and every `prefers-reduced-motion` block in the style sheets;
- hover, mouse down and Tab focus on the main controls, reading computed styles every 40 to 300 ms for one second;
- a MutationObserver on inline styles while hovering the menu and while scrolling the page in 900 px steps (Webflow animates with JavaScript, so its timings are only visible that way).

The scripts and raw output (`probe.py`, `probe2.py`, `probe3.py` and their JSON) stayed in the scratchpad, outside git. We take the idea and the timing only, never their assets, text, colours or brand.

Easing names used below: `ease` is the CSS keyword, `cubic-bezier(0.25, 0.1, 0.25, 1)`. `cubic-bezier(0.4, 0, 0.2, 1)` and `cubic-bezier(0, 0, 0.2, 1)` are Tailwind's defaults for `transition-*` and `ease-out`. Where a row says "class", the value was read from the element's class and computed `transition`, not watched while it played.

## 2. Catalogue

Keep: Qarau should have the same interaction, with our tokens. Adapt: the idea fits, the timing or the animated property must change. Skip: we do not want it.

| # | Interaction | Seen on | What happens | Duration and easing | Verdict for Qarau |
|---|---|---|---|---|---|
| 1 | Text link hover | Refero, 34 links and table rows | Muted text turns full colour | 150 ms, `cubic-bezier(0.4, 0, 0.2, 1)`; colour at its end value by the 160 ms sample | Keep. Our `transition-colors` default is the same idea at 160 ms. |
| 2 | Link hover by dimming | Refero, 23 breadcrumb and logo links (`hover:opacity-70`) | Link fades to 70 % opacity | 150 ms, same curve | Skip. Dimming lowers contrast of the thing being pointed at. |
| 3 | Primary button hover | Refero "Connect to your AI" | Opacity 1 to 0.8 | 200 ms, same curve; 0.87 at 80 ms, 0.80 at 220 ms | Adapt: change the fill colour, not the opacity (same reason as 2). |
| 4 | Secondary button hover | Refero "Copy" buttons; dope.security "Book a demo" | Background tint; on dope.security also the border turns violet | Refero `all` 150 ms; dope.security `all` 150 ms `ease`, settled by 160 ms | Keep the tint and the time; never `transition: all` (rule 5). |
| 5 | Button press | dope.security "Book a demo" (mouse down) | Fills with the accent colour and gets a light ring | Same 150 ms transition; half way at 100 ms, done at 200 ms | Adapt: a darker fill at `--duration-fast`, no ring (the ring is our focus style). Refero showed no press change. |
| 6 | Keyboard focus | Both | Refero: browser outline on links, a `ring` shadow on buttons inside their 150 ms `transition-all`. dope.security: browser default 1 px outline; the menu toggles have `outline: none`, so Tab shows nothing on them | No animation of its own | Keep a visible ring that appears at once; skip the hidden one. |
| 7 | Segmented control | Refero "Preview / DESIGN.md / Tailwind v4" | Selected segment changes colour, border and shadow | 150 ms, `cubic-bezier(0, 0, 0.2, 1)` (class) | Keep. |
| 8 | Card hover | Refero style cards | Card background tints and the preview grows to 102 % | Background 200 ms, scale 300 ms, `cubic-bezier(0.4, 0, 0.2, 1)` (class; the hover did not fire in my run) | Adapt: tint and border only, no scale (scaling blurs text). |
| 9 | Menu open and close | dope.security "Products" | Menu fades in on hover, fades out on leave | Open: opacity 0 to 1 in about 150 ms. Close: about 100 ms | Keep. Closing faster than opening matches NN/g. |
| 10 | Menu item hover | dope.security dropdown links | Tint | 100 ms `ease` (small links), 300 ms `ease` (large links with text) | Keep the 100 ms one; 300 ms feels slow for a list. |
| 11 | Tooltip | dope.security "Coming soon", hint tips, info chip | Fades in and moves a few pixels | 300 ms `cubic-bezier(0.19, 1, 0.22, 1)`; 250 ms `ease`; chip 200 ms `ease-out` | Adapt: fade and 4 px move at `--duration-base` (200 ms). |
| 12 | Hint card appears | Refero discovery hint | Fades in from 4 px above | Keyframe from `opacity: 0; translateY(-4px)`; duration not captured | Keep the shape for status messages. |
| 13 | Panel switch on scroll | dope.security sticky "scroller" section | Panels cross-fade; the step label goes from 40 % to full opacity | Inline `transition: opacity 0.2s` | Adapt for result stages: fade at `--duration-base`, triggered by the result, not by scroll. |
| 14 | Line drawn by scroll | dope.security plane path | Stroke draws as the page scrolls | Scroll-linked, no duration | Keep the idea once: G-60 already does it on the landing. |
| 15 | Text typed in | dope.security headlines (`span.char`) | Characters appear one by one, for about 2 s after each scroll step | JavaScript, per character | Skip: delays reading. |
| 16 | Words or names that rotate | Refero headline sweep; "Connect to your AI" name reel | Outgoing word wipes out, the next wipes in; the reel moves 16 px up every 2.5 s | Headline 3 s `linear`; reel 10 s loop, about 300 ms per move, `cubic-bezier(0.22, 1, 0.36, 1)` | Skip: a loop with no new information. |
| 17 | Floating logos, marquee, sparkle, card follows pointer | dope.security | Logos bob up and down, a strip slides by changing `margin-left`, a sparkle pulses, the hero card shifts a few px with the pointer | Continuous; sparkle 1.5 s `ease-in-out` loop | Skip: decoration (ANTI-SLOP R7); the marquee animates layout. |
| 18 | Attention pulse | dope.security CTA keyframes | Button scales 1 to 1.045 and back; a ring grows to 18 px and fades | Keyframes `ds-cta-pulse`, `pulse-click-now` | Skip. |
| 19 | Split-flap tiles | dope.security feature tiles | Background colour change, fill bar grows by width on scroll | 600 ms `cubic-bezier(0.23, 1, 0.32, 1)` | Skip: slow, and it animates width. |
| 20 | Loading | Refero | Shimmer skeleton, spinner, pulse; the page video fades in when loaded | Shimmer 2 s `ease-in-out` loop; video opacity 500 ms | Keep spinner and skeleton while waiting only; adapt the image fade to 200 ms. |
| 21 | Menus and dialogs (library) | Refero (`data-open:animate-in`) | Fade and zoom in on open | 150 ms `ease` default (class) | Keep for our dialog, at our tokens. |
| 22 | First-visit reveal | Refero, dark scheme only | Colour wash over the whole page | 1.75 s `linear`, once | Skip: delays reading. |
| 23 | Number change | Neither page | No counters seen; the dope.security headline did not change in 3 s | None | Ours (count-up on KPI tiles) stays; no reference to copy. |
| 24 | Page change | Neither page | dope.security does full page loads; on Refero I did not follow a link | Not measured | Ours (200 ms fade) stays. |
| 25 | Reduced motion | Refero: one rule sets every transition and animation to 0.01 ms, plus `animation: none` for the reel, headline and reveal. dope.security: no `prefers-reduced-motion` rule at all | | Keep Refero's pattern; ours already works the same way (G-64). |

Summary: the reference keeps UI feedback between 100 and 200 ms and decelerates at the end. What makes the dope.security site feel busy is the large amount of motion that runs on its own (rows 15 to 19), and that is what we leave out.

## 3. Rules for Qarau

These start from the rules in the swarm notes of 11 November. Where a source asks for more or for less, the change is marked "Changed".

1. **Timing comes from tokens.** Durations and easings come only from `--duration-*` and `--ease-*` in `web/app/tokens.css` and from `duration`, `ease`, `stagger`, `timing` and `demo` in `web/lib/motion.ts` (G-59); `web/lib/motion.test.ts` keeps the two in sync. A new value is a new named token in both files. Material 3 works the same way, with a fixed set of duration and easing tokens [M3]. Known exception: `.jelly-nav__link` in `web/app/globals.css` uses a bare `320ms` and its own overshoot curve.
2. **Reduce motion means nothing moves.** With the device setting (`prefers-reduced-motion: reduce`) or the Settings switch (G-64, `<html data-motion="reduce">`) on, the end state shows at once. CSS gets this from `globals.css`; JavaScript animation reads `useReducedMotionConfig()` from motion/react, as `components/motion/count-up.tsx` does, instead of its own media query. WCAG 2.3.3 asks that "Motion animation triggered by interaction can be disabled" [WCAG]; MDN describes the setting as a wish for an interface that removes, reduces or replaces motion [MDN]. Changed: none in the rule, but the sources allow more than we do. WCAG counts only changes of position, size or shape as motion, and MDN's example swaps a scale for a fade. We still stop fades too, because `globals.css` already does and one rule is easier to test.
3. **Motion explains a change.** Every animation answers one question: where did this come from, what changed, what is selected, what is still working. NN/g calls a microinteraction a trigger with "a narrowly targeted response" [NNg-micro]; Vercel says to animate only when it clarifies cause and effect [Vercel]; Apple: "Add motion purposefully" [Apple]. So: no loops without a reason (ANTI-SLOP R7), at most one short reveal on page load, a Pause button on anything that plays on its own for more than 5 s (G-54; WCAG 2.2.2). Changed: added "the more often it happens, the less it moves" (Apple advises against motion on frequent interactions; NN/g says frequent animations should be shorter and subtler). Hover and press change colour only.
4. **Short, and shorter on the way out.** Feedback (hover, press, toggle) 100 to 200 ms. Content that enters 200 to 300 ms. A staged reveal ends within 600 ms of the trigger. NN/g: "most animations should be in the range of 100–500 ms", about 100 ms for simple feedback, 200 to 300 ms for larger changes, 400 ms already very slow [NNg-dur]; M3: duration grows with the distance and area that change [M3]. Changed: added "leaving is faster than entering" (NN/g; the dope.security menu opens in about 150 ms and closes in about 100 ms).
5. **Animate transform, opacity and colour; name the properties.** Use `transition-colors`, `transition-opacity`, `transition-transform` or an explicit property list. Never `transition: all`, never animate width, height, top, left, margin or padding, never scale text the user is reading. Vercel: compositor-friendly properties and "Never `transition: all`" [Vercel]. Both reference sites break this (dope.security has `transition: all` on about 40 elements, Refero on its buttons). Known exceptions in Qarau: `.jelly-nav__link` animates padding, and the scan line on Analyze (`components/app/analyze-client.tsx`) animates `top`.
6. **CSS first, no new dependency.** CSS transitions and keyframes first; motion/react (already installed) and `web/components/motion/` only where CSS cannot do it: exit animations, SVG path drawing, a number counting. Vercel's order is CSS, then the Web Animations API, then a JavaScript library [Vercel].
7. **Never make people wait for motion.** Animations can be interrupted: a hover that ends half way reverses from where it is (CSS transitions do this), a button works during its own animation, the next step never waits for an animation to finish. Vercel: "Animations are cancelable by user input." [Vercel]; Apple: let people cancel motion [Apple]. Changed: new rule, the swarm notes did not cover it.
8. **The same information without motion and without sight; motion changes no content.** The focus ring appears at once (`globals.css` `:focus-visible`, 2 px, 3 px in high contrast). A new status or result is announced with `role="status"` or `aria-live="polite"` (WCAG 4.1.3). Motion is never the only signal [Apple]. Adding motion never changes a value, a label, an honesty badge ("Mock result", "Demo") or the demo Pause button.
