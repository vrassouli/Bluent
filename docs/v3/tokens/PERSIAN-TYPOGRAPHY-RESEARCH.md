# #418 — Persian typography, mixed direction and real reflow probe

**Date:** 2026-10-11. **Status:** executable research and demo-only reflow mitigation; **not** a shipping typography design/token decision, native accessibility certification, or a new bundled font.

## Design source and remaining approval

Existing design source: *Bluent v3 Design System* Penpot file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 32 `acf5f619-7d81-80da-8008-c5ef1089ac94` (accessible motion/high-contrast policy), and design-first #418 foundations in [issue-418-token-schema.preview.json](issue-418-token-schema.preview.json). Current demo builds on these **prior design decisions only**. **No newly approved Persian font/type ramp or Penpot typography board was created in this checkpoint**: the Penpot browser plugin was suspended, and the authorized Figma fallback reported an MCP Starter-plan tool call limit. Do not claim design parity or put a new font in Bluent.UI until the typography design can be reviewed in the connected v3 working file.

## Live sample content

The research-only `/v3/styling-lab` contains a semantic `<section lang="fa" dir="rtl">` with:
- Persian words including real ZWNJ (e.g. `گزارش‌های`), Persian numerals and a date;
- mixed `ABC-123` and `2026/10/11` identifiers isolated in separate semantic `<bdi>` elements;
- three actual Bluent `Button` controls with real `FluentIcons.CursorClick`: short Persian, mixed Persian/Latin and long Persian;
- a real `TextField` with Persian placeholder.

No external font files are bundled, fetched or redistributed.

## What the browser actually observed

`node scripts/quality/probe_v3_blazor_runtime.mjs` launches an actual Chrome session against Blazor WebAssembly. Running it with `BLUENT_V3_LAB_MODE=server` launches a **local Release-published Interactive Server** and checks the same DOM and real Blazor controls.

| Exact scope | WebAssembly | Interactive Server |
| --- | --- | --- |
| Full suite including brand, portal, motion, typography | **139/139** | **139/139** |
| Persian paragraph actual reported platform font via `CSS.getPlatformFontsForNode` | Tahoma (50 glyphs) | Segoe UI (50 glyphs) |
| Real Button icon/text center separation for short/mixed/long initial samples | 0 CSS px | 0 CSS px |
| `<bdi>` for Latin identifiers | computed `unicode-bidi:isolate`, LTR | same |
| 320px CSS viewport, RTL, root `font-size:200%` | reflow passed | reflow passed |
| 320px CSS viewport, **component Button text = 28px (200%)** | no clipping or host escape | same |
| 320px CSS viewport, **component Button text = 56px (400%)** | no clipping or host escape after demo-only mitigation | same |

### Important correction: the original 320px test was not strict enough

The earlier CDP viewport command used `mobile:true`. In Chrome without an effective mobile viewport declaration, this may yield a ~980px layout viewport despite a 320px device metric. The new test uses `Emulation.setDeviceMetricsOverride({width:320,height:700,deviceScaleFactor:1,mobile:false})` and explicitly asserts `window.innerWidth === 320`; similarly, the 390px RTL test asserts CSS viewport width 390. This is a **real CSS narrow viewport** test, not a claim about an actual physical mobile browser.

With that stricter test and a true **400% per-Button text override**, the long Persian button initially extended beyond the v3 lab host boundary. This failure was measured, **not inferred from screenshot heuristics**. The demo-only `V3StylingLab.razor.css` now constrains hosted controls with `min-width:0`, `max-width:100%`, a wrapping text area (`white-space:normal;overflow-wrap:anywhere`) and an RTL-friendly stacked flex group. All three actual Fluent-icon Bluent buttons fit at 400%, with their icon/text geometric centers aligned to within 2 CSS pixels, and the 200% test also passes. **Production Button SCSS has not been modified.**

### Actual font-family selection remains unresolved

The CSS-visible `font-family` on the control reads the existing stack beginning with `Segoe UI`; actual platform glyphs differed across WASM and Interactive Server runs. These observations alone do not explain why fallback changed or establish any font as the approved v3 Persian choice. Browser rasterization, fallback selection, font-loading timing, OS/browser availability, glyph shaping and visual alignment need actual side-by-side design and human review. A zero difference between CSS icon/text box centers proves geometric alignment, **not** optical baseline or perceived centering for Persian glyphs.

## What this does *not* certify

No full-page zoom at 400%, native Windows high-contrast OS, macOS/Safari, Android, iOS, screen reader interaction, keyboard focus trap, all hover/error/disabled states, screenshot regression or assistive-technology approval was performed. The typography mitigation applies **only** inside the opt-in v3 demo and should not silently become a public Bluent v3 Button contract.

Final API/RTL typography approval, visual tests on real devices and migration documentation remain open on #418. Keep PR #500 Draft, target `bluent-v3` only; never merge to stable `Dev` or publish stable NuGet from this work.

## Additional browser host matrix
Repeated the identical 139-assertion browser script with CHROME_PATH set to the installed Microsoft Edge browser on Dev01. **Edge + Blazor WebAssembly: 139/139; Edge + published Interactive Server: 139/139**. Existing Google Chrome tests independently pass 139/139 on both hosts. Edge and Chrome are both Chromium-based and this does NOT certify Firefox, Safari, actual mobile browsers, native OS forced-colors or screen readers. Reproduction with Edge: set CHROME_PATH to C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe; optionally set BLUENT_V3_LAB_MODE=server; run node scripts/quality/probe_v3_blazor_runtime.mjs. The script tears down the isolated browser and local app after the run.


## 2026-10-11 state and source typography audit
[Exact 17-token typography source inventory across 10 brands and two modes](TYPOGRAPHY-SOURCE-AUDIT.md) and the new real semantic disabled/invalid Persian samples extend the opt-in demo. The updated Chrome/Blazor WebAssembly and InteractiveServer probes each pass **144/144**. Disabled Button cannot acquire focus; the invalid TextField has associated visible label and aria-describedby; its demo-only danger border is measurably distinct from the normal field and its error role persists in simulated forced-colors. Do not read this as screen-reader or complete state conformance.


## Connected editable Penpot board (2026-10-11)
Penpot MCP connection resumed. Created and PNG-reviewed actual native page #35 Persian validation states and reflow in the exact Bluent v3 Design System, page 916ee53e-8991-8009-8008-c61c0754ce9d, board 916ee53e-8991-8009-8008-c61c075e54cc. The 44 native elements stay within their board (geometry checked after edits; final PNG re-exported and visually reviewed) and schematically show Light/Dark Persian invalid TextField, disabled Button, 320px constrained wrapped long label and semantic status notes. The draft uses locally available Noto Sans Arabic *for an editable comparison preview only*. Existing CSS --fontFamilyBase remains Segoe UI-first; no production font files or font changes are introduced. Separate Dialog/Popover D5 defects are in D5-PORTAL-ACCESSIBILITY-AUDIT.md.

## 2026-10-15 CI/CDP Persian platform-font telemetry classification

The full **Chrome / published InteractiveServer** GitHub Actions run on
head 075f98f4 reached **868/869 successful assertions**. Its sole failure
was the CDP CSS.getPlatformFontsForNode returning an **empty list** on
the hosted Windows CI runner, while the identical real Server interaction
probe passed **869/869 on Dev01**. No evidence currently proves whether
the CI browser lacked Persian font coverage or whether this platform-font
instrumentation was simply unavailable; do not assert the text rendered
correctly from the fact that its DOM exists.

A separate deterministic, fail-closed evidence policy is now implemented in
scripts/quality/v3_persian_font_evidence.mjs and guarded by five Node
positive/negative tests in test_v3_persian_font_evidence.mjs.
The real browser always requests actual platform-font glyph data. If a
nonempty family with positive glyph counts is present **and** the Persian
semantic/layout contract passes, evidence level is platform-glyph-observed.
If the browser reports an **empty** platform-font array, the test instead
requires visible nonzero Persian paragraph text/layout, correct semantic
lang=fa, RTL, ZWNJ and font-family CSS; it records
semantic-layout-only and an explicit unresolved font/glyph **visual
acceptance gap** in the JSON outcome. Malformed partial font telemetry
does **not** qualify for this fallback; neither does invisible, empty,
incorrectly directed, zero-sized or missing semantic text.
This does not download or redistribute fonts, override the browser font
stack, or silently claim WCAG/AT/Persian shaping approval.

Dev01 rerun with the new policy: actual **Chrome / published InteractiveServer 869/869** passed, and genuine **Segoe UI / 50 platform glyphs** were reported with evidence level platform-glyph-observed. The prior GitHub CI failure is still an independent failed execution, not retroactively green.

The dedicated Node policy test is part of the v3 Browser Lab workflow on
every matrix job, with source paths explicitly triggering the workflow.
A previously failing CI run must not be relabeled green; check the new
commit's exact GitHub Actions result independently.

## 2026-10-15 — Native editable Penpot font acceptance study

The correct Penpot tab was reactivated on VHD-PC4; confirmed the authoritative
Bluent v3 Design System file ID b64f6665-c9ab-80b5-8008-c4ac99d9d000.
The concurrently open PuyaStudio Runner project was NOT edited.

- Native page: 42 · Persian font evidence and acceptance · #418, ID
  e775e67c-d9da-804b-8008-cb84059cbdab.
- Independent editable board: #418 · Persian font evidence and approval matrix
  · DRAFT, ID e775e67c-d9da-804b-8008-cb8405b790a5;
  observed revision 377, 1500 x 1120 px, 29 editable shapes.
- Eight real native text-size token links: four Latin/LTR and four
  Persian/RTL at 12, 14, 16 and 20px. Sizes 12/16/20 use
  bluent.type.size.200/.400/.500. The body 14px case binds to semantic
  bluent.semantic.type.bodySize. Source line-height pairs shown:
  12/16, 14/20, 16/22, 20/28.
- Actual exported PNG visually inspected: both language columns and three
  research/acceptance columns visible, Persian right-aligned, bilingual ID
  and ZWNJ example present; no Penpot shape bounds overflow detected.
- Font measurements are reported, not silently selected: the source CSS
  begins with Segoe UI; Dev01 Chrome Server reported Segoe UI (50 glyphs),
  prior WASM reported Tahoma (50 glyphs), and Windows CI may omit CDP
  font-family telemetry. Inter and Noto Sans Arabic are ONLY Penpot preview
  fonts, not proposed runtime dependencies or distributed font files.
- Still require maintainer review of final font-family stacks, glyph
  shaping/optical baseline on actual target hosts, native Windows Contrast
  Themes, screen readers, 200/400% reflow and final token/API migration.
  This research board does NOT authorize merging to stable Dev or shipping.

Repeatable read-only design-source audit:
scripts/quality/penpot_v3_persian_font_evidence_audit.js
(run its body via Penpot execute_code in the correct file).
First live readback: 8/8 passes; 29 shapes, zero bounds overflow.
This is editable design evidence, NOT final typography/AT certification.
