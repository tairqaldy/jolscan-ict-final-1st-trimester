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
| 5 | Button press | dope.security "Book a demo" (mouse down) | Fills with the accent colour and gets a light ring | Same 150 ms transition; part way at 50 ms, nearly there at 100 ms, done by 200 ms | Adapt: a darker fill at `--duration-fast`, no ring (the ring is our focus style). Refero showed no press change. |
| 6 | Keyboard focus | Both | Refero: browser outline on links, a `ring` shadow on buttons inside their 150 ms `transition-all`. dope.security: browser default 1 px outline; the menu toggles have `outline: none`, so Tab shows nothing on them | No animation of its own | Keep a visible ring that appears at once; skip the hidden one. |
| 7 | Segmented control | Refero "Preview / DESIGN.md / Tailwind v4" | Selected segment changes colour, border and shadow | 150 ms, `cubic-bezier(0, 0, 0.2, 1)` (class) | Keep. |
| 8 | Card hover | Refero style cards | Card background tints and the preview grows to 102 % | Background 200 ms, scale 300 ms, `cubic-bezier(0.4, 0, 0.2, 1)` (class; the hover did not fire in my run) | Adapt: tint and border only, no scale (scaling blurs text). |
| 9 | Menu open and close | dope.security "Products" | Menu fades in on hover, fades out on leave | Open: opacity 0 to 1 in about 150 ms. Close: about 100 ms | Keep. Closing faster than opening matches NN/g. |
| 10 | Menu item hover | dope.security dropdown links | Tint | 100 ms `ease` (small links), 300 ms `ease` (large links with text) | Keep the 100 ms one; 300 ms is slower than rule 4 allows for feedback. |
| 11 | Tooltip | dope.security "Coming soon", hint tips, info chip | Fades in and moves a few pixels | 300 ms `cubic-bezier(0.19, 1, 0.22, 1)`; 250 ms `ease`; chip 200 ms `ease-out` | Adapt: fade and 4 px move at `--duration-base` (200 ms). |
| 12 | Hint card appears | Refero discovery hint | Fades in from 4 px above | Keyframe from `opacity: 0; translateY(-4px)`; duration not captured | Keep the shape for status messages. |
| 13 | Panel switch on scroll | dope.security sticky "scroller" section | Panels cross-fade; the step label goes from 40 % to full opacity | Inline `transition: opacity 0.2s` | Adapt for result stages: fade at `--duration-base`, triggered by the result, not by scroll. |
| 14 | Line drawn by scroll | dope.security plane path | Stroke draws as the page scrolls | Scroll-linked, no duration | Keep the idea once: G-60 already does it on the landing. |
| 15 | Text typed in | dope.security headlines (`span.char`) | Characters appear one by one, for at least the 2 s I watched after each scroll step | JavaScript, per character | Skip: delays reading. |
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

Summary: on the reference, UI feedback mostly takes 100 to 200 ms and ends slowly. Most of the other motion on dope.security runs on its own (rows 15 to 19); that is what we leave out.

## 3. Rules for Qarau

These start from the rules in the swarm notes of 11 November. Where a source asks for more or for less, the change is marked "Changed".

1. **Timing comes from tokens.** Durations and easings come only from `--duration-*` and `--ease-*` in `web/app/tokens.css` and from `duration`, `ease`, `stagger`, `timing` and `demo` in `web/lib/motion.ts` (G-59); `web/lib/motion.test.ts` keeps the two in sync. A new value is a new named token in both files. Material 3 works the same way, with a fixed set of duration and easing tokens [M3]. The last bare value, `.jelly-nav__link` (320 ms with its own overshoot curve), moved to `--duration-base` and `--ease-emphasized` in the motion grill of 11 November.
2. **Reduce motion means nothing moves.** With the device setting (`prefers-reduced-motion: reduce`) or the Settings switch (G-64, `<html data-motion="reduce">`) on, the end state shows at once. CSS gets this from `globals.css`; JavaScript animation reads `useReducedMotionConfig()` from motion/react, as `components/motion/count-up.tsx` does, instead of its own media query. WCAG 2.3.3 asks that "Motion animation triggered by interaction can be disabled" [WCAG]; MDN describes the setting as a wish for an interface that removes, reduces or replaces motion [MDN]. Not changed, although the sources allow more than we do. WCAG counts only changes of position, size or shape as motion, and MDN's example swaps a scale for a fade. We still stop fades too, because `globals.css` already does and one rule is easier to test.
3. **Motion explains a change.** Every animation answers one question: where did this come from, what changed, what is selected, what is still working. NN/g calls a microinteraction a trigger with "a narrowly targeted response" [NNg-micro]; Vercel says to animate only when it clarifies cause and effect [Vercel]; Apple: "Add motion purposefully" [Apple]. So: no loops without a reason (ANTI-SLOP R7), at most one short reveal on page load, a Pause button on anything that plays on its own for more than 5 s (G-54; WCAG 2.2.2). Changed: added "the more often it happens, the less it moves" (Apple advises against motion on frequent interactions; NN/g says frequent animations should be shorter and subtler). Hover and press change colour only.
4. **Short, and shorter on the way out.** Feedback (hover, press, toggle) 100 to 200 ms. Content that enters 200 to 300 ms. A staged reveal ends within 600 ms of the trigger. NN/g: "most animations should be in the range of 100–500 ms", about 100 ms for simple feedback, 200 to 300 ms for larger changes, 400 ms already very slow [NNg-dur]; M3: duration grows with the distance and area that change [M3]. Changed: added "leaving is faster than entering" (NN/g; the dope.security menu opens in about 150 ms and closes in about 100 ms).
5. **Animate transform, opacity and colour; name the properties.** Use `transition-colors`, `transition-opacity`, `transition-transform` or an explicit property list. Never `transition: all`, never animate width, height, top, left, margin or padding, never scale text the user is reading. Vercel asks for compositor-friendly properties and an explicit property list instead of `all` [Vercel]. Both reference sites break this (dope.security has `transition: all` on about 40 elements, Refero on its buttons). No known exceptions left in Qarau: until the motion grill of 11 November, `.jelly-nav__link` animated padding (its pill is now a pseudo-element that scales) and the scan line on Analyze (`components/app/analyze-client.tsx`) animated `top` (it now moves a photo-sized layer by transform).
6. **CSS first, no new dependency.** CSS transitions and keyframes first; motion/react (already installed) and `web/components/motion/` only where CSS cannot do it: exit animations, SVG path drawing, a number counting. Vercel's order is CSS, then the Web Animations API, then a JavaScript library [Vercel].
7. **Never make people wait for motion.** Animations can be interrupted: a hover that ends half way reverses from where it is (CSS transitions do this), a button works during its own animation, the next step never waits for an animation to finish. Vercel: "Animations are cancelable by user input." [Vercel]; Apple: let people cancel motion [Apple]. Changed: new rule, the swarm notes did not cover it.
8. **The same information without motion and without sight; motion changes no content.** The focus ring appears at once (`globals.css` `:focus-visible`, 2 px, 3 px in high contrast). A new status or result is announced with `role="status"` or `aria-live="polite"` (WCAG 4.1.3). Motion is never the only signal [Apple]. Adding motion never changes a value, a label, an honesty badge ("Mock result", "Demo") or the demo Pause button.

## 4. Map to Qarau

"Today" is `main` at 20:35 on 11 November: G-74 had merged, G-6 and G-75 were still open.

| Kept or adapted interaction (catalogue #) | Qarau component or screen | Today | Issue |
|---|---|---|---|
| Link and nav hover colour (1) | Site header links `web/components/landing/site-header.tsx` (`.jelly-nav__link` in `globals.css`); app rail and module switch `web/components/app/app-shell.tsx` | G-74 merged while this was written: the rail's active bar and the Roads / Restrooms thumb slide (transform, `--duration-base`, `--ease-emphasized`), text links get an underline that grows (`background-size`, `--duration-base`). Header: padding grew in 320 ms with overshoot (broke rules 1 and 5) until the motion grill; now a pill scales behind the link, see section 5 | G-74 (#433) |
| Button hover tint and press (4, 5) | `web/components/ui/button.tsx` | `transition-colors` at `--duration-fast`; no separate press colour | G-6 (#124) |
| Focus ring at once (6) | `web/app/globals.css` `:focus-visible` | Done | G-6 (#124) checks primitives keep it |
| Segmented control and tabs (7) | `web/components/ui/segmented.tsx`, `web/components/ui/tabs.tsx`, `web/components/ui/switch.tsx` | `transition-colors`; switch thumb moves at `--duration-fast` | G-6 (#124) |
| Card hover, tint only (8) | Overview link cards on `/app`, `/app/roads`, `/app/restrooms` (`web/components/app/platform-overview-client.tsx`, `dashboard-client.tsx`, `web/components/restrooms/restroom-overview-client.tsx`) | Varies by card | G-9 (#126) |
| Menu open and close (9, 10) | Mobile menu in `site-header.tsx` (`.public-menu__toggle`) | No open animation | G-74 (#433) |
| Tooltip and dialog enter (11, 21) | `web/components/ui/tooltip.tsx`, `web/components/ui/dialog.tsx` | No enter animation | G-6 (#124) |
| Result stages and status message (12, 13) | Road result `web/components/app/analysis-view.tsx` (with `detection-overlay.tsx`), restroom result in `web/components/restrooms/compare-client.tsx` and `match-client.tsx` | Boxes draw in; no staged reveal of the verdict, no toast component | G-75 (#434) |
| Spinner and skeleton while waiting (20) | `LoaderCircle` with `animate-spin` in `analyze-client.tsx`, `compare-client.tsx`, `match-client.tsx`; `web/components/ui/skeleton.tsx` (`animate-pulse`) | Done | G-6 (#124) for the skeleton |
| Scan line while analysing | `analyze-client.tsx` | Loops while loading (kept in ANTI-SLOP R7 as a progress sign); moves by transform since the motion grill | Done |
| Result photo fade when loaded (20) | Analyze and Compare photos | None | Later |
| Line drawn by scroll (14) | Landing "How it works", `app/page.tsx` `.how-steps` | Done | G-60 (done) |
| Number change | KPI tiles `web/components/app/kpi.tsx` via `components/motion/count-up.tsx` | Done | G-9 (#126) keeps it |
| Page change (24) | `web/components/motion/page-transition.tsx` via `app/template.tsx`, `app/app/template.tsx` | Done, 200 ms fade (and 8 px lift in the app) | G-74 (#433) |
| Reduced motion (25) | `globals.css`, `lib/theme-script.ts`, `components/motion/motion-preference.tsx` | Done | G-64 (done) |

## 5. Durations: our tokens against the measurements

| Token | Value | Measured on the reference | Use it for |
|---|---|---|---|
| `--duration-fast` / `duration.fast` | 120 ms | 100 ms: dope.security menu links, card opacity, menu close | Press, switch thumb, closing a menu or tooltip |
| `--duration-ui` / `timing.ui` (default for every `transition-*`) | 160 ms | 150 ms: Refero links, buttons and segments; dope.security buttons; menu open | Hover, segment and tab state, opening a menu |
| `--duration-base` / `duration.base` | 200 ms | 200 ms: Refero card tint and primary button; dope.security hero buttons, info chip, panel switch | Card hover, tooltip and dialog enter, page fade, one result stage |
| (none) | 250 to 300 ms | Refero card scale; dope.security tooltips, large menu links, tab button shadow | Nothing yet. If G-75 needs one, add a named token in both files (rule 1), no bare number |
| `--duration-slow` / `duration.slow` | 420 ms | Nothing in the reference's UI feedback; NN/g calls 400 ms very slow | Entry of landing and dashboard sections only (`.stagger`) |
| `--duration-draw` / `duration.draw` | 300 ms (700 ms until the motion grill) | Refero card scale and dope.security tooltips, 300 ms | One detection box outline drawing in, the landing similarity bar: content, not feedback |
| `--stagger-step` / `stagger` | 45 ms (60 ms until the motion grill) | Nothing comparable | Delay between items of `.stagger` and of `staggerDelay()` in `lib/motion.ts`, capped so the last item ends by 600 ms |
| `timing.countUp` | 800 ms | Nothing comparable | A KPI that changes after load; the real value renders first |
| `timing.scanSweep` | 2.2 s loop | Refero shimmer 2 s loop | The scan line while an analysis runs, nothing else |

Easing: `--ease-standard`, `cubic-bezier(0.2, 0, 0, 1)`, is exactly Material 3's standard curve, and `--ease-exit`, `cubic-bezier(0.4, 0, 1, 1)`, is M3's legacy accelerate curve. `--ease-emphasized`, `cubic-bezier(0.3, 0, 0, 1)`, is our own and not an M3 token. The reference uses Tailwind's `cubic-bezier(0.4, 0, 0.2, 1)`, `ease`, and the ease-out curves `cubic-bezier(0.165, 0.84, 0.44, 1)`, `cubic-bezier(0.19, 1, 0.22, 1)` and `cubic-bezier(0.23, 1, 0.32, 1)`. All of them end slowly, as ours do, so no new easing is needed.

Where we broke our own rules on 20:35, and what the motion grill (11 November, later that evening) changed:

- `.stagger` (`globals.css`): each item rose for 420 ms after a delay of 60 ms per position, so the 5th item ended at 660 ms and the 7th and later at 780 ms. Now the step is `--stagger-step` (45 ms) and the delay stops growing at the 5th item, so the last item ends at 600 ms. `lib/motion.test.ts` reads the CSS and fails if it ends later.
- `distribution-bars.tsx`: bars grew for 630 ms (`duration.slow * 1.5`) plus 60 ms per bar. Now 420 ms each, started by `staggerDelay()`, so the last bar ends by 600 ms with any number of bars.
- `detection-overlay.tsx`: each box drew for 700 ms (`duration.draw`), starting 250 ms in and 180 ms apart, while the Motion table in `DESIGN-BRIEF.md` said 300 ms. Now `--duration-draw` is 300 ms, boxes start one `stagger` step apart (`boxTiming()`), and the last tag is in by 600 ms. A test reads the brief's Motion row and fails if the two disagree again. The landing demos' result line (`demo.resultDelay`) moved from 1.4 s to 1.0 s, when the shorter similarity bar ends.
- Landing car (`.landing-road__car`): drove in for 2.4 s after 0.4 s on page load. Now `--duration-slow` after `--duration-fast` with `--ease-emphasized`, parked by 540 ms, together with the hero's `.stagger` entry.
- Analyze scan line: animated `top`, which the browser reports as a layout shift on every frame (CLS 0.0024 per run at 1440 px). Now a photo-sized layer moves by `transform`; the sweep looks the same and CLS is 0.
- Compare at 375 px: the "Saved to this browser" line wrapped under the Result heading and pushed the result down when it appeared (CLS 0.034). An invisible copy of the line now holds its place before a result exists; CLS 0 at 375, 600 and 1440 px.
- `transition: all` on the landing roads demo card and the team cards: replaced by `transition-colors` and by a list of the changed properties.
- `.jelly-nav__link`: bare 320 ms, overshoot curve, animated padding, so hovering a header link pushed the links after it along. Now the link box never changes size; a pill behind it (`::before`) fades in at `--duration-fast` and scales from 88 % at `--duration-base` with `--ease-emphasized`. No overshoot: there is no overshoot token, and rule 3 keeps hover small.

## Known gaps (11 Nov)

Found in the motion grill and not fixed tonight, because the fix belongs to someone else's code or is not safe before the defense.

| Gap | Where | Why not tonight | Owner |
|---|---|---|---|
| At 375 px on `/app/roads` the bottom bar highlights More, not a tab of its own. The active logic is right: Roads Overview has no `mobile: true` in `MODULE_NAV`, so it lives in the More sheet, and More is lit because the current page is inside it. Restrooms Overview does have a tab. The fix is a navigation decision (give Roads Overview a tab, which means dropping Analyze, Reports or Map from the bar, or a sixth column) | `web/components/app/nav.ts` | Navigation structure, not a class or match bug | Tair |
| Overpass draws `·` with no advance width, so outside page headings the dot still sits against the next word (the landing roads demo's action and repair time line, card meta lines). Headings are fixed in `PageHeader` | Every `·` set in Overpass | A global fix needs a font-face override for one character or a shared separator component, which touches many teammates' files | Dameli |
| Team cards on the landing lift 4 px, grow a shadow and scale the initial on hover, but they are not links, so the motion promises a click that does nothing (rule 3). The `transition-all` on them is replaced by a property list; the lift itself is kept | `web/components/landing/team-grid.tsx` (#13) | The hover is a teammate's design | Dameli with dyharonking (#13) |
| `/design` shows spinners and pulsing skeletons that loop with nothing loading (rule 3). They are the specimens of the loading state, and they stop under Reduce motion | `web/components/design/` states grid | A static specimen would no longer show the state it documents; to be decided | Dameli |
| `/settings` is a 404; Settings lives at `/app/settings`. A redirect would help people who type the short path | `web/next.config.ts` redirects | Routing, not design | Tair |

## Sources

Read on 11 November 2026. One short quote per source; the rest is summarised.

- [WCAG] W3C, WCAG 2.2 Success Criterion 2.3.3 Animation from Interactions (AAA), https://www.w3.org/TR/WCAG22/#animation-from-interactions, and Understanding 2.3.3, https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html. Also SC 2.2.2 Pause, Stop, Hide and SC 4.1.3 Status Messages.
- [MDN] MDN, `prefers-reduced-motion`, https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion.
- [M3] Material Design 3 motion tokens. m3.material.io renders only with JavaScript, so the values come from Google's sources: material-web `tokens/versions/v0_192/_md-sys-motion.scss` (https://github.com/material-components/material-web) and Material Components Android `docs/theming/Motion.md` (https://github.com/material-components/material-components-android), which says "duration should increase as the area/traversal of an animation increases". Durations: short 50 to 200 ms, medium 250 to 400 ms, long 450 to 600 ms, extra long 700 to 1000 ms.
- [Apple] Apple Human Interface Guidelines, Motion, https://developer.apple.com/design/human-interface-guidelines/motion.
- [Vercel] Vercel, Web Interface Guidelines, Animations, https://vercel.com/design/guidelines.
- [NNg-micro] NN/g, "Microinteractions in User Experience" (Kendrick, 2018), https://www.nngroup.com/articles/microinteractions/.
- [NNg-dur] NN/g, "Executing UX Animations: Duration and Motion Characteristics" (Laubheimer, 2020), https://www.nngroup.com/articles/animation-duration/.
