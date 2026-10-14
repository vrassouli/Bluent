# #418 — Focus-ring contrast depends on the surrounding host

**2026-10-14. Foundation design research, NOT approved public CSS/tokens, a release or universal accessibility certification.** The maintainer prefers a single brand-colored Button focus ring and a TextField with its original animated bottom underline only. Existing v2 and the published NuGet packages remain untouched.

## Crucial geometry and real browser validation

The actual opt-in Blazor Button focus CSS uses a 2px outline at 2px outline-offset. This paints the ring OUTSIDE the control, separated from the face by a gap. A low contrast ratio between the ring and the Button's OWN Primary/Danger fill is thus a diagnostic, not by itself a contrast failure against the OUTER host container. But if the parent card itself is brand-colored, the ring may be invisible.

Actual Chromium/WASM probe: 10 emitted brands x Light/Dark x all six native Button appearances, 120 actual Button computed-style observations. It checks a genuine keyboard focus-visible state, 2px ring width, 2px offset, matching source role, no control-layout movement, and >=3:1 against both examined neutral and neutral-hover host surfaces. First expanded six-appearance run **673/673 passed**, zero failures; see 753/753 host-color run below. Some opaque Primary/Danger Button FACE contrasts were low, and were recorded as such rather than incorrectly rejecting the ring. This is computed CSS, not native OS/AT/pixel certification.

## Reproducible audit: 100 source-host combinations

Run python scripts/quality/audit_v3_focus_host_surface_matrix.py. It reads the ACTUAL emitted Fluent theme source CSS files (10 brands x Light/Dark x 5 background roles). The five HOST roles are colorNeutralBackground1, colorBrandBackground, colorBrandBackgroundHover, colorPaletteRedBackground3 and colorNeutralBackgroundInverted.

The candidate normal-role ring is the selected visual source colorBrandBackground in Light and the earlier experimental colorBrandForeground2 in Dark. The inverse source is the existing colorNeutralForegroundOnBrand.

- Neutral hosts: colored ring passes 3:1 in all **20/20** source cases.
- Colored brand, brand-hover and danger hosts: same-hue ring FAILS 3:1 in all **60/60** source cases. Default Light ring #1267B4 versus same-colored outer host #1267B4 is **1.00:1**; Dark candidate #6790CF versus brand host #18599B is **2.20:1**.
- The existing white inverse brand foreground source passes on the same colored brand/hover/danger hosts in all **60/60** source cases. But it FAILS in **10/10** Dark inverted hosts, which are white. This PROVES a universal white outline is not sufficient either.
- Exact mode/context contrast min/max and failed counts are emitted by the source auditor. Five new contract tests preserve this distinction and ensure the design assumptions are revisited if emitted source values change.

These five source roles are examples; they do NOT cover all actual nested containers, transparency, gradients, overlays, pressed/selected surface states or true browser/OS rendering.

## Actual source-owned Penpot artifacts

Editable file **Bluent v3 Design System**, ID b64f6665-c9ab-80b5-8008-c4ac99d9d000.
Page **07 · Accessibility & RTL**, ID 07c521b9-e441-80bd-8008-c4b24ce6f58c.

Two separate, native editable comparison boards were created; BOTH were exported as PNG and visually inspected.

1. **RESEARCH · Branded Focus Ring on Filled Host Surfaces · #418**, board ID 94a03b1b-8cb6-8091-8008-c96c96ea484f, 29 actual native shapes: Light neutral host PASS, Light same-brand filled host FAIL, Dark brand-filled host FAIL.
2. **RESEARCH · Inverse Ring by Host Context · #418**, board ID 94a03b1b-8cb6-8091-8008-c96d09329a0b, 29 actual native shapes: Light/Dark brand-filled host inverse-color rings PASS, white inverted Dark host white ring FAIL.

All SIX actual Penpot ring rectangles have a 2px stroke and exact **3px symmetric vector bounds outside the Button face** on all four sides, equivalent to the chosen CSS 2px stroke plus 2px offset and consistent with the earlier #501 Button Penpot geometry. The source page's original TextField bottom-only indicators and the previous Hover candidate research are preserved.

To reproduce shape/geometry checks, run scripts/quality/penpot_v3_focus_context_hosts_audit.js in the connected Penpot plugin. CI node --check validates script syntax; only an actual live Penpot invocation validates editable native layer properties.

## Still pending for acceptance

Host-background context may need an explicit semantic contrast role or a fallback focus mechanism, but no such public API has been approved. A single branded, single white or neutral ring must not be assumed universally accessible. Resolve nested theme scopes, filled/color/image/translucent hosts, hover/pressed/selected interactions, foreground contrast, Windows Contrast Themes, real UI zoom, assistive technology and pixel/visual sign-off. Keep original brand focus as the selected visual on neutral hosts; retain Focus2 alternatives as research only. Do not merge into Dev, stable NuGet or a production Button API.


## Actual mounted Blazor host-color experiment: 80 browser observations

The study was also reproduced by temporarily changing the background of the **real Styling Lab host** while keeping the actual Bluent Button mounted and keyboard-focused. No synthetic clone of the Button was used. For each of ten source brands and both modes, Chrome/Blazor WebAssembly temporarily painted four real host backgrounds (brand, brand-hover, danger and inverted), then read actual computed Button outlineColor and the host backgroundColor. It temporarily substituted the **existing inverse brand foreground source** to compare treatments, and restored the exact previous host style/attribute afterward.

Results across **80 real browser host observations**: the selected/experimental same-hue ring fell below 3:1 in **70** cases (all brand/brand-hover/danger and inverted Light), while the inverse source fell below 3:1 in **10** (all inverted Dark). This directly reproduces the source-only 100-case audit's relevant outcomes and confirms why an unconditional "always brand" or "always inverse" rule is not adequate. The full actual Chrome/Blazor WASM suite after these additions passed **753/753, zero failures**; 80 dedicated cases assert the expected contrast classification rather than treating a known shortfall as an unexpected test failure.

These temporary host color manipulations are bounded experimental cases, not a guarantee for every application, native OS high contrast, raster-pixel area, transparent overlay or assistive technology. No public style or shipped CSS was modified.

**Penpot verification status (2026-10-14):** both board PNG exports were visually inspected, six 2px rings were read back with 3px symmetric vector bounds, and the final combined live Penpot read-only audit was successfully re-run after reconnecting the plugin: **40/40 native board/shape/color/geometry/pass-fail-caption checks passed, zero failures**. The earlier suspended-tab attempt was inconclusive, but the later successful run completes this specific design-artifact gate. This does NOT approve final production focus semantics or native OS/AT.
