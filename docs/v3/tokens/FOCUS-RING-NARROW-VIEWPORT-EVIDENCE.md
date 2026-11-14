# #418 Focus2: real narrow-viewport Button matrix and Penpot review

**Date:** 2026-10-13
**State:** Research/opt-in design and browser evidence, not product implementation, accessibility certification or a release.

## Live editable design evidence

- Real source-owned Penpot `Bluent v3 Design System`: file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- Actual existing foundation page `32 · High contrast and reduced motion policy · #418`: `acf5f619-7d81-80da-8008-c5ef1089ac94`.
- **New native editable board** `#418 · Focus2 contrast candidate — light / dark review, unapproved`: `cd054205-a525-80d8-8008-c87438620de4`. It contains 24 editable Penpot text/vector shapes. The PNG was **actually exported and visually inspected**. Live read-back after correcting a *test wording error* verified the Light/Dark source hue, canvas, Focus ring/gap positions and geometry: **8/8 checks, zero errors**. The detailed reproducible audit is `scripts/quality/penpot_v3_focus2_proposal_audit.js` (syntax-checked; its full 30-check version was not yet verified live, so do not claim it was).
- Illustrative design: candidate `--colorStrokeFocus2` black `#000000` on Light `#FFFFFF`, white `#FFFFFF` on Dark `#292929`; 2px outer stroke with separately editable contrast gap, example Primary face `#0F6CBD`.
- **Important parity gap:** the *visual Penpot proposal has two ring layers*, whereas the current browser opt-in Focus2 test maps the token to **one `outline` stroke**. Neither is the final v3 Button style; designing and testing the two-stroke CSS parity remains open under #418/#501. The Penpot colors in this board are **literal vector values**, not linked library TokenSet aliases, brand-variable bindings or a source-wide approval. No existing native variant was overwritten.

## Reproducible real browser reflow coverage

The existing `scripts/quality/probe_v3_blazor_runtime.mjs` now adds **80 real narrow CSS viewport scenarios per browser/host** with `Emulation.setDeviceMetricsOverride`: 10 emitted brands × Light/Dark × LTR/RTL × viewport widths 320 and 400 CSS pixels. Each scenario inspects all **six genuine Blazor Button appearances** (Default, Primary, Danger, Outline, Subtle and Transparent). Thus there are **480 Button-specific observations per host** (1,920 over four hosts). The test uses the opt-in Focus2 ring on the real existing Styling Lab and reports:

- the actual `window.innerWidth` and `document.documentElement.clientWidth`; tolerates the native scrollbar's up-to-20px width difference (the first harness run falsely rejected all 80 cases by demanding exact clientWidth equality, without Button geometry failures);
- `:focus-visible`, solid outline at least 2px, candidate ring contrast at least 3:1 against the local host background, all six buttons and text/icon inside their own Button face;
- each button horizontally inside its live viewport, and no label text overflow or clipped icon;
- preservation of original brand and mode scope. All temporary device metrics, candidate attributes and focus state are cleaned up.

The first version of the added viewport test had **81 harness-level failed assertions**, although its 80 scenarios explicitly found no individual Button geometry failures. 80 were from treating `documentElement.clientWidth` as equal to full browser viewport width despite scrollbar; the remaining case was from leaving focus on the last appearance instead of returning to the Default Button used by the later forced-colors check. Corrected, then reran full suites (do not hide the initial harness fault).

## Dev01 execution

| Browser and rendering mode | Full suite after harness fix | 80 narrow viewport scenarios | Native appearance observations |
| --- | ---: | ---: | ---: |
| Chrome / WebAssembly | 481/481, 0 failed | 80/80 | 480 |
| Edge / WebAssembly | 481/481, 0 failed | 80/80 | 480 |
| Chrome / published InteractiveServer | 484/484, 0 failed | 80/80 | 480 |
| Edge / published InteractiveServer | 484/484, 0 failed | 80/80 | 480 |

**Combined:** 1,930/1,930 full-suite assertions across four hosts, 320/320 narrow viewport scenarios, and 1,920 native Button observations. The underlying separate 80-case CSS-zoom matrix also remains part of every suite.

This work builds upon the preceding 80 CSS `zoom:2/4` scenarios per host. **Neither viewport emulation nor CSS zoom is real browser UI zoom.** An isolated attempt to send Chromium headless Ctrl+Plus through CDP did *not* change `devicePixelRatio`, `innerWidth` or Button bounds, and **must not be reported as a successful genuine browser zoom test**. Dedicated browser/native OS zoom, visual proof at 200/400%, Windows High Contrast, Safari/Firefox and assistive technology remain separate review gates.

## Branch, public API and release boundary

- Issue #418 stays In progress; draft PR #500 targets `bluent-v3`.
- This adds a **research-only** browser probe, design-board audit and documentation. It does not alter the shipping Button implementation, semantic values, theme bundles, NuGet or `Dev`/2.x.
- Known inherited gaps remain: unapproved Focus2/two-stroke token decision, ten Dark brands' old ring below 3:1 adjacent review target, and #428 Toggled `aria-pressed` absence.
