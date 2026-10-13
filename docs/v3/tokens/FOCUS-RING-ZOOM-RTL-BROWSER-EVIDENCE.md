# #418 / #501 — Browser focus contrast under CSS zoom and RTL

**Date:** 2026-10-13
**Status:** Research evidence and opt-in focus-color candidate ONLY. No product CSS change, no sign-off on #418 or #501, no accessibility certification.

## Design source and styling boundary

- Project-owned Penpot `Bluent v3 Design System` file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- Foundation accessibility board: page `acf5f619-7d81-80da-8008-c5ef1089ac94`, board `acf5f619-7d81-80da-8008-c5ef2f9a3158` (#418).
- Native Button Focus families and split research: page `535db143-a732-807e-8008-c64d2fb91b9a` (#501).
- The original shared `--bui-v3-border-focus` / brand stroke source fails the 3:1 adjacent contrast *review* threshold in 10/10 Dark brands (1.94:1–2.15:1) on the existing real Blazor lab Button. This is a design risk, **not proof of a specific WCAG failure**.
- The opt-in alternative `--colorStrokeFocus2` maps to black on Light and white on Dark; existing real rendered 20 brand-mode samples show minimum adjacent ring-to-canvas ratio **14.55:1**. This is one candidate, **not** accepted final focus contrast/two-stroke design. Forced Colors prefers the OS `Highlight` role.

## Exact repeatable setup

Run from the **`v3/issue-418-design-tokens`** checkout on Dev01. The existing `scripts/quality/probe_v3_blazor_runtime.mjs` itself starts the Blazor WebAssembly demo, or publishes and starts real InteractiveServer for the server mode, launches an isolated browser instance, then cleans it up. Environment switches:

```powershell
# Real WASM Chrome
node scripts/quality/probe_v3_blazor_runtime.mjs

# Real WASM Edge
$env:CHROME_PATH='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
node scripts/quality/probe_v3_blazor_runtime.mjs

# Published InteractiveServer Chrome (reset CHROME_PATH to Chrome)
$env:BLUENT_V3_LAB_MODE='server'
$env:CHROME_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
node scripts/quality/probe_v3_blazor_runtime.mjs

# Published InteractiveServer Edge
$env:CHROME_PATH='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
node scripts/quality/probe_v3_blazor_runtime.mjs
```

Use a fresh terminal or unset `BLUENT_V3_LAB_MODE` to return to WebAssembly mode.

## What the additional browser checks establish

The preexisting CDP suite already covers actual keyboard `:focus-visible` and six Button appearances (Default, Primary, Danger, Outline, Subtle, Transparent), disabled skip, selected+hover+focused cases, RTL Persian icon placement, reduced motion and emulated Forced Colors. The additional **80 per browser/host** checks exercise **the same actual keyboard-focused Default Button with Persian text and a Fluent icon** in:

- 10 emitted, source-backed Bluent brands.
- Light and Dark modes.
- Both LTR and RTL.
- CSS `zoom` values `2` and `4`, under a browser viewport of 1280×900 CSS pixels.

The opt-in Focus2 ring is toggled on/off **without losing keyboard focus**, comparing Button face, Fluent icon and Persian label bounding boxes before vs after. Each sample verifies `focus-visible`, solid ring at least 2 CSS pixels wide, ratio at least 3:1 against the computed host background, real applied zoom factor, stable geometry (tolerance 0.6 px), no text overflow/clipping, and fully contained icon and label. The test resets only the temporary DOM attributes, `zoom` and emulated viewport. The actual component CSS, token defaults and Blazor public API do not change.

**Important limitation:** CSS `zoom` changes layout and scales elements, but is **not a substitute for browser UI zoom (Ctrl+/Ctrl− or browser zoom menu)**, Windows display scaling, true 320-CSS-pixel reflow, a screen reader or native operating system High Contrast. Browser CDP Forced Colors is emulated, not a Windows user session. The new 80-case measurement probes **Default Button only**; the wider appearance keyboard matrix remains a separate existing test. No screenshots or human optical/font shaping review are replaced by DOM geometry.

## Actual Dev01 results

| Browser + Blazor host | Full suite (2026-10-13) | Additional CSS zoom/RTL candidates | Failed |
| --- | ---: | ---: | ---: |
| Chrome WebAssembly | 401 / 401 | 80 / 80 | 0 |
| Edge WebAssembly | 401 / 401 | 80 / 80 | 0 |
| Chrome published InteractiveServer | 404 / 404 | 80 / 80 | 0 |
| Edge published InteractiveServer | 404 / 404 | 80 / 80 | 0 |

**Total: 1,610 passing assertions (320 new CSS zoom/RTL checks), zero failures.** The repeatability summary was subsequently enhanced to include the actual browser name and explicit zoom/failure counters. A post-edit Chrome WebAssembly rerun also passed **401/401**, reporting `focusZoomSamples: 80` and `focusZoomFailures: 0`. Browser-host runs using the final summary formatter remain subject to CI repeatability; the actual interaction/body checks are unchanged.

## Pending gates

1. Accept source/semantic/component token values and final native two-stroke ring geometry in Penpot, including all appearances, Split adjacency, brand and dark surfaces; the current Focus2 is an isolated candidate.
2. True browser zoom at 200% and 400%, actual narrow viewports, Firefox/Safari, OS/assistive-technology verification, native Windows High Contrast review, and visual snapshots.
3. The #428 Button rewrite remains **Backlog** until ready gates are met; `aria-pressed` for `Toggled` is a known runtime issue to fix there.
4. All current v3 changes remain on the isolated #418 task branch and draft PR #500 targeting `bluent-v3`, not `Dev` or v2 NuGet.
