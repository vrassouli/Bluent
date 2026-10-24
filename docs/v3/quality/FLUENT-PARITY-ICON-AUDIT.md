# #552 family audit — Icon (#429)

**Status: partial source/browser audit with confirmed gaps.** This is not a Fluent parity acceptance, a design approval, a public Color-variant decision, or native OS/assistive-technology sign-off. The current Icon source files match the exact source baseline used by the recorded browser evidence (`1b023a5c`). No product source or package asset was changed. A separate editable Penpot review draft was added on 2026-10-23; its concrete file/page/board IDs and limitations are recorded below and in the dated design-artifact addendum.

## Upstream comparison decision

The pinned Fluent Web Components 3.1.3 manifest has **no dedicated Icon custom-element tag**. The pinned React semantic triage describes Fluent React Icons as a named icon catalogue, not a generic `Icon(Value, Variant)` component. Do not infer a one-to-one component/API mapping from the common name “Icon”.

The previous 2026-10-20 README read has now been supplemented by [an exact published npm package/inventory snapshot](evidence/FLUENT-ICON-ASSET-PACKAGES-2026-10-23.json): `@fluentui/react-icons@2.0.344` is pinned separately from `@fluentui/svg-icons@1.1.344` by published SHA-512 integrity and MIT license. The exact SVG tarball contains 21,732 files across 2,991 unique icon names; it contains 890 Color files, but the same packed README marks Color deprecated and warns it may be removed. The tarball also contains size/style filenames that its README omits (10, 12 and 32px; `light` style), which is recorded as an upstream documentation discrepancy—not an API promise. The current Bluent source has no `IconVariant.Color`. Do not add it merely because assets exist; license/shipping, asset selection, deprecation, theme/forced-colors fallback, and an accepted Bluent v3 design decision remain required.

## Current Bluent API and source contract

| Capability | Source fact | Audit disposition |
| --- | --- | --- |
| Public variant | `IconVariant` is exactly `Regular` and `Filled`; component default is `Regular`. | Verified source fact. A Color enum value is absent; whether Color is a required product feature remains undecided. |
| `IconDefinition` | Requires `Regular`; `Filled` is optional. `GetSource(Filled)` falls back to Regular if Filled is absent. | Existing fallback behavior is verified; the public policy and consumer-facing docs still need review. |
| Generated `FluentIcons` | `FluentIconsGenerator` selects keys matching 20px `regular` or `filled` font assets. The checked bundled JSON has 5,694 keys: 2,827 regular, 2,867 filled, 2,875 unique names (8 regular-only, 48 filled-only), and zero Color entries. | This describes the local 20px font-map snapshot, **not** all Fluent icon assets, all sizes, or all visible glyphs. Upstream freshness is not established by the filename. |
| Supported source types | `FromCss`, `FromSvg`, `FromImage`; renderer emits an `i`, a `span` containing supplied SVG `MarkupString`, or an `img`. `AdditionalAttributes` are forwarded. | Custom sources are supported. Raw SVG markup, sizing, accessible semantics, and caller-supplied attribute precedence need an explicit contract. |
| Intrinsic accessibility | Renderer does not automatically set `aria-hidden`, `role`, `aria-label`, or image `alt`. | There is no universal decorative/informative policy. A standalone icon may be decorative or meaningful; icon-only actions must be named at the **control** level. |

## Custom SVG security trust boundary

`IconDefinition.FromSvg` stores the supplied string in `IconSource.Svg`, and `Icon.BuildRenderTree` emits that value as a `MarkupString`. The inspected rendering path has no SVG sanitizer/allow-list call. This is a **source-level trust-boundary observation**, not an exploitability finding: no attack payload was executed and this audit did not run a security exploit test. The migration guide already requires trusted developer-controlled SVG; the canonical [Icon reference](../../components/icon.md) now carries the same warning beside the factory/API documentation. Do not pass user-submitted or otherwise untrusted SVG without a separately reviewed sanitizer/allow-list and threat model. Do not treat CSS sizing as a security control. No sanitizer or product runtime behavior was changed by this audit-only PR.

## Reproduced visual and accessibility gaps

| Finding | Actual Chrome/Edge observation | Boundary / owner |
| --- | --- | --- |
| Custom SVG sizing defect | On the real Blazor WebAssembly `/components/icons` page, a custom SVG supplied with inline `width:32px;height:32px` paints at **377×377 CSS px** in both Chrome and Edge. The containing span's measured layout fragment is **377×16 CSS px**. Reproduced in Light/LTR, Dark/RTL and Chromium CSS Forced Colors emulation. | Confirmed #429 visual/sizing gap. The separate CSS-only prototype restores a 32×32 box in its temporary browser but is not a product fix or design-approved CSS. |
| Informative image has no accessible name | The real 32×32 image loads (`naturalWidth > 0`) but has no `alt`; the browser partial AX tree exposes an `image` node with an empty name. | Confirmed #429 accessibility gap. An empty `alt` could be correct for a decorative image, but intent must be explicit; native screen-reader output has not been tested. |
| Standalone font/SVG nodes | In the recorded partial AX tree, standalone Regular, Filled and SVG roots appear as generic nodes with empty names. The font uses private-use glyphs. | Browser AX observation only; do not claim every Icon necessarily contaminates a parent control name. The FileSelect Button glyph finding is a separate control-context result. |
| Theme/direction and forced colors | Original screenshots exist for Light/LTR, Dark/RTL and Chromium forced-colors emulation. | They establish fixture coverage, not pixelwise Fluent parity, correct directional mirroring, native Windows Contrast Themes, or a screen-reader result. |

The original live browser harness observed 15/15 fixture/render assertions per engine (30 total) across three scenarios. Those are positive source-render observations, **not 30 parity passes**; the oversized SVG and unnamed image are the defects those measurements preserve. The isolated CSS candidate later observed 31/31 assertions per engine across Light/LTR, Dark/RTL, forced-colors emulation and a 320px viewport, with SVG/wrapper measuring 32×32. The candidate was injected only into temporary browser sessions and did not alter source or package assets.

## Canonical matrix disposition

The nine dimensions below are now all represented in the shared, machine-checked 18-family matrix as `audited_gaps`. These cross-family inventories make the review scope explicit; they do not mean every Icon scenario is implemented, verified or accepted.

| Dimension | Current evidence | Disposition and boundary |
| --- | --- | --- |
| `visual` | [Icon browser evidence](FLUENT-PARITY-ICON-BROWSER.md) and [cross-family visual evidence inventory](FLUENT-PARITY-VISUAL-EVIDENCE-AUDIT.md) | `audited_gaps` — the 377×377 SVG sizing defect is reproduced; normalized Fluent screenshot/pixel comparison and a complete state matrix remain open. |
| `feature` | [Wave A API review](FLUENT-PARITY-WAVE-A-API-REVIEW.md) and [Icon variant/catalog audit](FLUENT-PARITY-ICON-VARIANTS.md) | `audited_gaps` — ten source-known parameters are mapped; upstream has no matching generic Icon component and the public Color decision remains unresolved. |
| `behavior` | [Cross-family behavior audit](FLUENT-PARITY-BEHAVIOR-AUDIT.md) | `audited_gaps` — representative size/alignment/inherited-color probes exist; dynamic source changes, accessible-name propagation and native screen-reader behavior remain unaccepted. |
| `accessibility` | [Cross-family accessibility audit](FLUENT-PARITY-ACCESSIBILITY-AUDIT.md) and [Button icon/AX evidence](FLUENT-PARITY-BUTTON-ICON-AX.md) | `audited_gaps` — decorative versus informative SVG/image semantics need a contract; browser AX is not native assistive-technology sign-off. |
| `tokenTheme` | [Token/theme source audit](FLUENT-PARITY-TOKEN-THEME-AUDIT.md) | `audited_gaps` — no dedicated Icon SCSS was found; SVG color inherits `currentColor` and parent theme context. Computed Light/Dark and forced-colors parity is not approved. |
| `responsiveRTL` | [Responsive/RTL audit](FLUENT-PARITY-RESPONSIVE-RTL-AUDIT.md) | `audited_gaps` — existing RTL evidence does not include the standard Icon route at narrow width; the separate 320px sizing-candidate run is research-only, not product validation. |
| `BlazorExtensions` | [Blazor extension-surface audit](FLUENT-PARITY-BLAZOR-EXTENSIONS-AUDIT.md) | `audited_gaps` — the source contract uses `IconDefinition` and inline SVG rather than `InputBase`; attribute/ARIA behavior and native AT are not certified. |
| `designArtifact` | [Design-artifact coverage audit](FLUENT-PARITY-DESIGN-ARTIFACT-AUDIT.md) and [editable Icon review draft below](#editable-icon-review-draft-2026-10-23) | `audited_gaps` — a dedicated editable review board exists, but it is not a complete reusable Icon variant set; component design approval remains pending. |
| `migrationDocs` | [Migration-document coverage audit](FLUENT-PARITY-MIGRATION-DOCS-AUDIT.md) | `audited_gaps` — the canonical reference exists, but no family-specific 2.x-to-v3 migration section is populated. |

Family `auditStatus`: `researching`; `designApproval`: `pending`; `evidenceBundle`: `null`; `gapDisposition`: `known_gaps_open`.

## Editable Icon review draft (2026-10-23)

The source-owned Penpot file was reconnected and the dedicated Icon review board was created and exported for visual inspection. Its presence corrects the historical 2026-10-22 inventory gap, but it is explicitly **review-only** and does not change any acceptance status.

- File: `Bluent v3 Design System` — `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.
- Page: `43 · Icon anatomy & contract · #429 DRAFT` — `1d7e9dd6-b977-802e-8008-d5a718dd7655`.
- Board: `#429 · Icon SVG sizing & semantics · REVIEW DRAFT` — `1d7e9dd6-b977-802e-8008-d5a718e3f4a2`.
- Live Penpot structural check: 129 editable children, 68 text nodes, zero invalid text bounds and zero children outside the 1600×2320 board; the exported board image was visually reviewed.
- The board covers candidate sizes 16/20/24/28/32, viewBox/no-viewBox geometry, decorative/informative semantics, dark/RTL context and owner decisions. Its glyphs are neutral sizing samples, not official Fluent assets. It is **not** a component-master variant set, and no library component has been created.

Next design gate is an explicit #429/#420 review of size/default precedence, valid-viewBox policy, target-browser support, trusted SVG markup/security boundary, attribute/accessible-name precedence and decorative/informative use. Only after that decision should the review page be expanded into the approved reusable family design and matched Fluent comparisons run. Keep `designApproval=pending`, `evidenceBundle=null` and all nine Icon dimensions `audited_gaps` until the actual gates pass. See [the reproducible structural addendum](evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-ADDENDUM-2026-10-23.json).

## Required owner actions

1. **#429:** design the SVG sizing/intrinsic-size contract (including SVG with/without `viewBox`, explicit vs implicit sizes, CSS and Image sources), and decide the decorative vs informative image policy and `AdditionalAttributes` precedence.
2. **#418/#420:** decide shared sizing/token and accessible-attribute rules; ensure a decorative icon does not accidentally hide a meaningful control and an Icon label does not replace an icon-only Button's contextual action name.
3. Pin the exact upstream asset release/commit before any Color proposal; compare actual asset coverage and license/shipping, define a fallback under Dark/forced colors, and preserve the current Regular/Filled behavior until an approved migration decision exists.
4. Review the linked editable Bluent v3 Icon draft, complete the reusable variant set after policy decisions, and then run same-state Fluent reference comparisons, sizes/appearances, Light/Dark, RTL/directional glyphs, 320px/reflow, browser zoom, published InteractiveServer, real Windows Contrast Themes and native assistive technology.
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
