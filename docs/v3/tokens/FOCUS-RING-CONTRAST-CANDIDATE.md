# Bluent v3 — Focus ring contrast, ten brands x Light/Dark (#418 / #501)

> Design and code research only. No approved native Penpot Focus ring replacement, no stable Bluent 2.x change, and no WCAG certification.

## Reproduction with real rendered Button

On Dev01 the opt-in Styling Lab navigates by real CDP Tab to the original Bluent Default Button with keyboard :focus-visible active. It cycles an isolated lab host through all 10 supported source brands and Light/Dark modes, reads computed outlineColor and host backgroundColor from the actual DOM, and computes the sRGB ratio of those two adjacent colors. The standard lab ring uses the candidate --bui-v3-border-focus / existing --colorBrandStroke1 path.

| Brand | Current Dark ring-to-surface ratio |
| --- | ---: |
| Default | 2.04:1 |
| Excel | 2.15:1 |
| Office | 1.96:1 |
| Outlook | 2.04:1 |
| Power Apps | 2.02:1 |
| Power BI | 2.10:1 |
| PowerPoint | 1.95:1 |
| Stream | 1.94:1 |
| Teams | 1.98:1 |
| Word | 2.04:1 |

All ten Dark samples are below the 3:1 adjacent-color review threshold; none of the ten Light samples are. This is a measurable **design risk**, not by itself a formal WCAG focus-appearance failure. Outline area, adjacency, anti-aliasing, background layers, pointer/keyboard distinctions, focus-ring thickness, and native operating-system colors all require separate visual/a11y acceptance.

## Opt-in alternative — reuse Fluent's existing token

The preexisting Bluent theme source token **--colorStrokeFocus2** is #000000 in Light and #FFFFFF in Dark for each brand. Rather than inventing new brand values or silently changing #418 approved mappings, the opt-in lab stylesheet contains this experimental alternative:

- Only when the host has attribute data-bui-v3-focus-contrast-candidate, map --v3-lab-focus to var(--colorStrokeFocus2).
- Under forced-colors: active, use the OS system color Highlight instead.
- Otherwise the v3 lab remains at its original focus appearance; the attribute is set and removed by test only. No global tokens, shipping Button stylesheet, NuGet, or public APIs change.

The exact same **20 browser-rendered brand/mode combinations** all passed the experimental 3:1 ring-to-surface test. The **minimum measured candidate ratio was 14.55:1**. Emulated forced colors retained a visible 2px ring with custom property Highlight. This is useful evidence for choosing the final paired focus strokes; it is **not** final stylistic approval of a monochrome focus ring.

## Tests and implementation decision

Source: scripts/quality/probe_v3_blazor_runtime.mjs and src/Bluent.UI.Demo.Pages/Pages/Scenarios/V3StylingLab.razor.css.

Dev01, 2026-10-12: Chrome & Edge WebAssembly **320/320** each; Chrome & Edge published InteractiveServer **323/323** each. One initial Chrome Server execution exited nonzero; full rerun passed. The reason for that initial transient failure was not conclusively isolated; repeat stability needs CI evidence. Every passing summary still reports the separate #428 Toggled/aria-pressed accessibility gap and the **unmodified** original ring contrast risk.

Before resolving #418/#501: choose and apply a native Penpot double-stroke focus treatment for all six legacy Bluent appearances (including Danger), ensure visual contrast on every real brand/theme host, verify ring size and non-reflow at 200/400% zoom and RTL, test Windows forced colors/Safari/Firefox and real assistive technologies. Map chosen design tokens into the approved new v3 component APIs only after maintainer acceptance. **Keep these candidate-only CSS rules off stable Dev and NuGet.**

## 2026-10-13 — CSS zoom/RTL stress and host parity

See [browser zoom/RTL evidence](FOCUS-RING-ZOOM-RTL-BROWSER-EVIDENCE.md) for the repeatable Chrome/Edge and WebAssembly/InteractiveServer script, 80 opt-in candidates per host (320 new measurements across four runs), and why CSS zoom must not be called native browser zoom. All four browser/host runs passed their extra zoom/RTL assertions with no face, label or icon layout change at the Focus2 candidate attribute boundary; the existing low-contrast Dark ring remains **unchanged** and is still a known design review problem. This does not approve the alternate token or the double-stroke Penpot design.
