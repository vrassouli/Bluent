# #418 — Chrome accessibility media probe

**Design source:** Penpot `Bluent v3 Design System` (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`), page 32 `acf5f619-7d81-80da-8008-c5ef1089ac94`, board `acf5f619-7d81-80da-8008-c5ef2f9a3158`.

**Research only:** [Opt-in accessibility CSS](issue-418-accessibility.preview.css) extends the [generated alias preview](issue-418-opt-in.preview.css). Neither belongs to stable bundles, v2 NuGet or the public v3 API.

Run:

```shell
python scripts/quality/generate_v3_token_preview.py --check
python scripts/quality/probe_v3_accessibility_media.py
```

## Observations (Dev01 Chrome, 2026-10-11)

- Six scenarios run for Default Light and Dark; **zero assertion failures**.
- Chromium `--force-high-contrast` activates real `(forced-colors: active)` CSS media handling. Inspecting the opted-in root confirms `ButtonFace`, `ButtonText`, `Highlight`, `GrayText` system-color token roles.
- `--force-prefers-reduced-motion=reduce` activates the reduced-motion rule and results in **0s** transition duration.
- Ordinary headless Chrome on Dev01 **already prefers reduced motion**. The non-reduced 150ms rule is **not covered**; the checker explicitly reports `nonReducedBranchCovered: false`.
- In headless forced-colors, programmatically focusing the sample button did **not** result in `:focus-visible`. This test **cannot certify focus visibility**; keyboard-driven focus needs real user interaction testing.
- This HTML/CSS fixture does **not** verify actual Blazor Button, Dialog/Popover portal ownership, keyboard behavior, screen readers, true OS high-contrast workflows, mobile/RTL, or WCAG conformance.

## Outstanding gates

Verify non-reduced 150ms behavior under a no-preference environment; keyboard-driven focus and system colors on a real High Contrast OS session; Blazor component states, modal portals and theme propagation; all ten brand and mode combinations; maintainer review of the proposed token names and contrast roles.

The original legacy source CSS, package assets and `bundleconfig.json` are unchanged. See [acceptance contract](HIGH-CONTRAST-MOTION-DESIGN.md).
