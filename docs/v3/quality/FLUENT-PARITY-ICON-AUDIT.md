# #552 family audit — Icon (#429)

**Status: partial source/browser audit with confirmed gaps.** This is not a Fluent parity acceptance, a design approval, a public Color-variant decision, or native OS/assistive-technology sign-off. The current Icon source files match the exact source baseline used by the recorded browser evidence (`1b023a5c`). No product source, package asset, or design file was changed.

## Upstream comparison decision

The pinned Fluent Web Components 3.1.3 manifest has **no dedicated Icon custom-element tag**. The pinned React semantic triage describes Fluent React Icons as a named icon catalogue, not a generic `Icon(Value, Variant)` component. Do not infer a one-to-one component/API mapping from the common name “Icon”.

The existing source research read the upstream `@fluentui/react-icons` and `@fluentui/svg-icons` README guidance on 2026-10-20, but that is **not a pinned package/commit inventory**: Regular/Filled are broadly available, Light/Color are only present for selected assets, and the SVG catalogue marks Color deprecated. The current Bluent source has no `IconVariant.Color`. Do not add it merely because some Fluent assets have color; exact release pinning, asset coverage, license/shipping, deprecation, theme and forced-colors fallback, and an accepted Bluent v3 design decision are still required.

## Current Bluent API and source contract

| Capability | Source fact | Audit disposition |
| --- | --- | --- |
| Public variant | `IconVariant` is exactly `Regular` and `Filled`; component default is `Regular`. | Verified source fact. A Color enum value is absent; whether Color is a required product feature remains undecided. |
| `IconDefinition` | Requires `Regular`; `Filled` is optional. `GetSource(Filled)` falls back to Regular if Filled is absent. | Existing fallback behavior is verified; the public policy and consumer-facing docs still need review. |
| Generated `FluentIcons` | `FluentIconsGenerator` selects keys matching 20px `regular` or `filled` font assets. The checked bundled JSON has 5,694 keys: 2,827 regular, 2,867 filled, 2,875 unique names (8 regular-only, 48 filled-only), and zero Color entries. | This describes the local 20px font-map snapshot, **not** all Fluent icon assets, all sizes, or all visible glyphs. Upstream freshness is not established by the filename. |
| Supported source types | `FromCss`, `FromSvg`, `FromImage`; renderer emits an `i`, a `span` containing supplied SVG `MarkupString`, or an `img`. `AdditionalAttributes` are forwarded. | Custom sources are supported. Raw SVG markup, sizing, accessible semantics, and caller-supplied attribute precedence need an explicit contract. |
| Intrinsic accessibility | Renderer does not automatically set `aria-hidden`, `role`, `aria-label`, or image `alt`. | There is no universal decorative/informative policy. A standalone icon may be decorative or meaningful; icon-only actions must be named at the **control** level. |

## Reproduced visual and accessibility gaps

| Finding | Actual Chrome/Edge observation | Boundary / owner |
| --- | --- | --- |
| Custom SVG sizing defect | On the real Blazor WebAssembly `/components/icons` page, a custom SVG supplied with inline `width:32px;height:32px` paints at **377×377 CSS px** in both Chrome and Edge. The containing span's measured layout fragment is **377×16 CSS px**. Reproduced in Light/LTR, Dark/RTL and Chromium CSS Forced Colors emulation. | Confirmed #429 visual/sizing gap. The separate CSS-only prototype restores a 32×32 box in its temporary browser but is not a product fix or design-approved CSS. |
| Informative image has no accessible name | The real 32×32 image loads (`naturalWidth > 0`) but has no `alt`; the browser partial AX tree exposes an `image` node with an empty name. | Confirmed #429 accessibility gap. An empty `alt` could be correct for a decorative image, but intent must be explicit; native screen-reader output has not been tested. |
| Standalone font/SVG nodes | In the recorded partial AX tree, standalone Regular, Filled and SVG roots appear as generic nodes with empty names. The font uses private-use glyphs. | Browser AX observation only; do not claim every Icon necessarily contaminates a parent control name. The FileSelect Button glyph finding is a separate control-context result. |
| Theme/direction and forced colors | Original screenshots exist for Light/LTR, Dark/RTL and Chromium forced-colors emulation. | They establish fixture coverage, not pixelwise Fluent parity, correct directional mirroring, native Windows Contrast Themes, or a screen-reader result. |

The original live browser harness observed 15/15 fixture/render assertions per engine (30 total) across three scenarios. Those are positive source-render observations, **not 30 parity passes**; the oversized SVG and unnamed image are the defects those measurements preserve. The isolated CSS candidate later observed 31/31 assertions per engine across Light/LTR, Dark/RTL, forced-colors emulation and a 320px viewport, with SVG/wrapper measuring 32×32. The candidate was injected only into temporary browser sessions and did not alter source or package assets.

## Canonical matrix disposition

- `visual`: `audited_gaps` — the 377×377 SVG rendering defect is measured in two real browser engines; full normalized Fluent visual comparison remains open.
- `accessibility`: `audited_gaps` — the image's empty accessible name is reproduced in the browser AX tree; decorative/informative intent and native OS/AT remain pending.
- `feature`, `behavior`, `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, `designArtifact`, and `migrationDocs`: `not_reviewed` — the source inventory and selected browser scenarios do not complete those acceptance dimensions.
- Family `auditStatus`: `researching`; `designApproval`: `pending`; `evidenceBundle`: `null`; `gapDisposition`: `known_gaps_open`.

## Required owner actions

1. **#429:** design the SVG sizing/intrinsic-size contract (including SVG with/without `viewBox`, explicit vs implicit sizes, CSS and Image sources), and decide the decorative vs informative image policy and `AdditionalAttributes` precedence.
2. **#418/#420:** decide shared sizing/token and accessible-attribute rules; ensure a decorative icon does not accidentally hide a meaningful control and an Icon label does not replace an icon-only Button's contextual action name.
3. Pin the exact upstream asset release/commit before any Color proposal; compare actual asset coverage and license/shipping, define a fallback under Dark/forced colors, and preserve the current Regular/Filled behavior until an approved migration decision exists.
4. Link and review the actual editable Bluent v3 Icon design. Then run same-state Fluent reference comparisons, sizes/appearances, Light/Dark, RTL/directional glyphs, 320px/reflow, browser zoom, published InteractiveServer, real Windows Contrast Themes and native assistive technology.
5. Keep all implementation on the owner issue after the normal Ready/design gates; this #552 audit branch remains documentation/evidence only.

## Evidence sources

- [Source/API and variant checkpoint](FLUENT-PARITY-ICON-VARIANTS.md)
- [Real Chrome/Edge browser and AX observations](FLUENT-PARITY-ICON-BROWSER.md)
- [Isolated SVG sizing/ARIA candidate (not product code)](FLUENT-PARITY-ICON-SVG-PROTOTYPE.md)
- [Canonical Icon component reference](../../components/icon.md)
- [Pinned Fluent Web Components 3.1.3 crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Pinned Fluent React semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md)
- [Source variant/catalog contract tests](../../../scripts/quality/test_v3_icon_variant_source.py)
- [Icon owner issue #429](https://github.com/vrassouli/Bluent/issues/429)

**Boundary:** this is a source/browser gap audit, not a claim that Fluent has a universal Color variant, that the SVG candidate is shipped, that the Icon is design-approved, or that native screen-reader/OS accessibility has passed.
