# #418 — Dark brand focus on normal and hover hosts (research candidate)

**Date: 2026-10-13.** Source-backed experimental v3 work. **No public Button token API or shipping CSS change is approved.** The maintainer selected the existing single, brand-colored keyboard focus ring over black/white Focus2 and double rings. TextField uses its native animated bottom underline without any extra outer frame.

## Actual Penpot file and new separate comparison board

Canonical Bluent v3 Design System file: b64f6665-c9ab-80b5-8008-c4ac99d9d000.
Page 07 · Accessibility & RTL: 07c521b9-e441-80bd-8008-c4b24ce6f58c.

**New native editable board:** RESEARCH · Dark brand ring on normal AND hover host · #418, ID 94a03b1b-8cb6-8091-8008-c8efa7fd2435 (100,2050), size 1440×605, 30 genuine native Penpot shapes. It compares two existing Fluent same-brand source colors on both normal #292929 and hover #3D3D3D neutral backgrounds, with one 2px Button focus ring and identical four-sided geometry:
- Existing compoundBrandStroke #4F82C8: normal 3.71:1, Dark hover approximately 2.77:1; **hover fails 3:1**.
- Existing brandForeground2 #6790CF: normal at least 4.29:1, Dark hover at least 3.20:1 in the evaluated brand source inventory.
- These colors are from default brand Dark emitted theme. The comparison is explicitly **research**, not a product Button style approval, and no library component/TokenSet was globally replaced.

The design was **exported as an actual Penpot PNG and visually inspected**: the darker source fails to stand out on the hovered surface, the newer branded source visibly has more separation while retaining its color family. A connected, read-only Penpot vector audit returned **22/22 checks passed**, verifying both state host fills, two rings per candidate, source hues, symmetric geometry, stroke widths, visible contrast text and independent editable objects. Re-run with scripts/quality/penpot_v3_brand_hover_host_audit.js in the connected Penpot plugin. Node syntax verification in CI is not a substitute for the live native design audit.

Previous page-07 three-panel board ID 94a03b1b-8cb6-8091-8008-c8ea9cc25c83 still contrasts baseline/current Compound candidate, with an explicit warning about the Hover failure. The two native original LTR/RTL TextField underline-only examples are unchanged. Original Focus2 research variants on page 38 remain comparison-only.

## Full ten-brand source audit and non-hidden counterexample

scripts/quality/audit_v3_brand_focus_candidate.py reads real emitted theme CSS for ten brands × two modes, validating colorNeutralBackground1, colorNeutralBackground1Hover, colorBrandBackground, colorCompoundBrandStroke and colorBrandForeground2.

For all ten Dark brands:
- Original brandBackground normal-host contrast: 1.94–2.15:1, previously not acceptable as sole neutral-host ring.
- Brighter compoundBrandStroke: normal 3.55–3.89:1 but **Hover 2.65–2.91:1** (ten of ten fail 3:1).
- **New research candidate** brandForeground2: normal 4.294–4.689:1, **Hover 3.206–3.501:1**, so the tested ordinary and Hover neutral surfaces both satisfy the numerical 3:1 study gate.

In Light, the live demo intentionally retains the original brandBackground and does not switch to brandForeground2. The eight dedicated Python regression cases record the original visual/default role, the Compound hover failure, and the stronger Dark candidate on both surfaces. The full v3 suite and generated preview asset checks remain separate CI gates.

## Real interactive Blazor review, no default replacement

Real Styling Lab /v3/styling-lab now exposes a **fourth actual Bluent Button selector**: «برند پرکنتراست (آزمایشی)». In Light the selected original brand outline is unchanged. Only the explicitly opted-in Dark styling-lab scope uses the emitted --colorBrandForeground2 value for its Button :focus-visible outline; the source CSS role is NOT defined/rebranded in a public API. TextFields retain their own native underline and forced-colors still use system Highlight. The UI default is the maintainer-preferred «فعلی (رنگ برند)».

Actual Chrome + Blazor WebAssembly CDP run after this change: **633/633 checks passed**, including source role selection and normal-plus-Hover numerical contrast from actual computed browser values for all 20 brand×mode cases, and five user-facing preview clicks. Browser emulation is NOT native OS assistive-technology certification.

## Blocking unknowns for a release

These comparisons concern 2 selected adjacent neutral-host colors only. They do not establish 3:1 focus contrast on filled, pressed, selected, translucent, gradient, image-backed, or complex overlay surfaces; native Windows Contrast Themes, accessible modality and zoom/AT acceptance are not yet verified. The new Fluent color role is therefore **not approved as a universal Button focus ring**. A reviewer must inspect these other host contexts, then explicitly choose the final semantic focus role and revisit the published TokenSet/Component API. Preserve original v2/stable NuGet and the bluent-v3 integration-branch isolation until acceptance.

## Keyboard-focused DOM / computed-outline verification (2026-10-13)

An additional 20 real browser regressions were added after the first 633/633 suite: the probe navigates to an actual Bluent Button with keyboard focus-visible, switches among all ten branded Light/Dark sources in the opt-in host, enables the new branded alternative and reads the actual focused Button's computed outlineColor/width rather than only a container custom property. It confirms that the computed ring is 2px, resolves the original brand source role in Light or existing brandForeground2 in Dark, and calculates 3:1-or-better contrast with both examined neutral normal and Hover source colors. Complete Chrome/WASM Blazor CDP result: **653/653 passed**, zero errors.

This verifies computed styles and real keyboard-focused DOM across those 20 host combinations. It does **not** establish actual painted-pixel contrast at every outline edge, or native Windows Contrast Themes, screen-reader/AT behavior, all filled states, or a universal public API contract. No default Button or TextField styles were changed.
