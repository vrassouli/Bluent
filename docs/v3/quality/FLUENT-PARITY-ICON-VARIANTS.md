# #552 Wave A / Icon #429 — source-backed variant and accessibility checkpoint

**Observed 2026-10-20. Status: source/API audit only, NOT Fluent parity, NOT #429 product acceptance.** Source checkout `v3/issue-552-fluent-parity-audit`, baseline from `bluent-v3`. This report does not change product code, package assets, component behavior, or the 18-family canonical acceptance matrix owned by #421.

## Actual Bluent public surface and source behavior

| Capability | Observed source evidence | Disposition |
| --- | --- | --- |
| Standalone `Icon.Value` | `Icon.cs` requires an `IconDefinition?` via `[Parameter, EditorRequired]`; absent source renders nothing | Bluent supported; runtime empty/fallback states not measured |
| `Icon.Variant` | Public enum is exactly `Regular`, `Filled`; default `Regular` | Two variants supported; **Color is missing from the enum**, not a silently supported variant |
| `IconDefinition` | `Regular` required, optional `Filled`; `GetSource(Filled)` falls back to Regular when absent | Deliberate current fallback, needs product policy and consumer docs |
| Source types | `FromCss`, `FromSvg`, `FromImage`; component emits `i`, `span` containing supplied SVG markup, or `img` respectively | Custom sources supported, **not** proof of first-party Fluent Color catalog |
| Generated `FluentIcons` | `FluentIconsGenerator.cs` extracts only `ic_fluent_*_20_(regular\|filled)` from bundled resizable font map | Currently a **20px-font-asset registry**, not all upstream sizes/styles |
| Accessibility | The `Icon` renderer forwards `AdditionalAttributes` and sets class/id/style; it does not intrinsically set `aria-hidden`, `role`, `aria-label`, or image `alt` | Decorativeness, nonvisual label, meaningful image `alt`, and consumer delegation need explicit #429/#420 policies and real AT checks |

Actual `FluentSystemIcons-Resizable.json` source snapshot: **5,694 entries**; **2,827 regular** and **2,867 filled** 20px named entries; **2,875 unique names**, comprising **8 regular-only** and **48 filled-only** names; **0 color entries**. These are *font-map keys*, not independently tested visible glyphs or entire upstream icon availability. Generator selects regular if available, otherwise filled; if both exist it includes both. Bundled assets `woff2`, `woff`, `ttf`, CSS and JSON are local input data; no claim of upstream freshness.

The existing `/components/icons` sample demonstrates Regular, Filled and custom SVG/Image plus use inside Button. It does not demo Color, role/ARIA behavior, icon sizing families, theme contrast, RTL mirroring, native screen readers or fallback. In other P0 research, a **FileSelect** remove Button whose accessible name is a private-use font glyph was recorded; do **not** claim every decorative `Icon` produces the same AX name without a separate browser test.

## Exact upstream distinction — avoid a false "Fluent supports three universal variants" claim

- [Microsoft `@fluentui/react-icons` README](https://github.com/microsoft/fluentui-system-icons/blob/main/packages/react-icons/README.md) says Regular/Filled for most icons, Light/Color only on selected icons, and strongly advises avoiding Color due to known Windows High Contrast and Dark mode contrast defects. This is a **React/asset reference, not a 1:1 Fluent Web Component Icon tag contract**.
- [Microsoft `@fluentui/svg-icons` README](https://github.com/microsoft/fluentui-system-icons/blob/main/packages/svg-icons/README.md) lists `regular`, `filled`, `color`, but **explicitly marks color deprecated** and warns it may be removed. Color fills/gradients are preserved and not themeable through single-color `currentColor`; not every icon/size has Color.
- The README prose observation above was originally captured on 2026-10-20. On 2026-10-23, the exact published npm tarballs were pinned and the SVG tarball was enumerated; see [the additive package/inventory snapshot](evidence/FLUENT-ICON-ASSET-PACKAGES-2026-10-23.json). This pins the **npm package version and published SRI integrity**, not a Git source commit. It separates `@fluentui/react-icons@2.0.344` (React wrappers/catalogue) from `@fluentui/svg-icons@1.1.344` (plain SVG files). The latter is MIT-licensed, and its packed README explicitly marks Color deprecated and warns it may be removed; do not treat its presence as a Bluent enum/API decision.

## Additive exact npm asset inventory (2026-10-23)

The live npm metadata and the **published `@fluentui/svg-icons@1.1.344` tarball** were checked directly on this date. The canonical [evidence JSON](evidence/FLUENT-ICON-ASSET-PACKAGES-2026-10-23.json) stores the exact published integrity and the filename inventory; the earlier 2026-10-22 upstream-version snapshot remains unchanged.

| Package | Published pin | Role in this audit |
| --- | --- | --- |
| [`@fluentui/react-icons@2.0.344`](https://www.npmjs.com/package/@fluentui/react-icons) | SHA-512 SRI recorded in the JSON; MIT | React icon wrappers/catalogue only; not a Web Components `Icon` element. |
| [`@fluentui/svg-icons@1.1.344`](https://www.npmjs.com/package/@fluentui/svg-icons) | SHA-512 SRI `sha512-rasjaq4hBXzRS25pSY9gaqwY7NdvZJCz7G/rtpwF6mCmg2R+9TnySLhHbR+sOpkMP/IDDG28XvxRcNEQ/lJYoQ==`; MIT | Plain SVG asset catalogue, separately counted from React wrappers. |

Exact tarball inventory: **21,732 SVG files**, **2,991 unique icon base names**, 8 numeric sizes present in filenames (`10, 12, 16, 20, 24, 28, 32, 48`) and four styles (`regular, filled, color, light`). This is a file inventory, not a promise that every icon has every size/style. The packed README declares sizes `16/20/24/28/48` and styles `regular/filled/color`, but the tarball includes size `10`, size `12`, size `32`, and some `light` files (214 total) that its README list does not mention. Record that as an upstream README-to-package inventory discrepancy, not a Bluent API.

There are **890 Color SVG files** across the enumerated sizes. Crucially, the *same pinned tarball's own README* marks Color deprecated, warns it may be removed, states Color assets are not themeable like Regular/Filled, and cautions that only a subset of icons/sizes has Color. Existence therefore does not justify adding `IconVariant.Color`, shipping these assets, or claiming Dark/forced-colors/Fluent parity. No upstream asset was copied into Bluent.

## Design-first #429 proposal (not approved)

1. Keep the current `Regular` and `Filled` behavior/API and explicitly document fallback where Filled is absent. Retain the ability to supply a custom SVG (including multicolor markup) independently of a new variant.
2. Do **not** add `Color` to the public enum based on Storybook pictures alone. Review feasibility of opt-in colorful assets versus their upstream deprecation, dependency size, version pinning, fallback selection and migration behavior.
3. A colorful rendering, if approved, must select an accessible monochrome `Filled`/`Regular` fallback in forced colors, avoid theme-dark low contrast and define RTL/directional icon handling; decorative icons must be hidden from AT, meaningful icon-only actions must get a contextual **control** accessible name (not icon glyph alone). Do not arbitrarily mark the icon's parent Button as decorative.
4. An editable **Bluent v3** Penpot review board now exists: [Icon anatomy & contract, page 43 / board `1d7e9dd6-b977-802e-8008-d5a718e3f4a2`](evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-ADDENDUM-2026-10-23.json). It is a review-only sizing/semantics board, not the reusable family variant set or approval. Review and expand it to cover side-by-side Fluent assets/sizes, Light/Dark, brand, RTL, forced colors and 320px cases after #429/#420 policy decisions; do not modify the Microsoft community kit.
5. Validate source-compiled asset/catalog integrity; real Chrome+Edge, WASM and published Server examples; genuine theme/contrast and keyboard/AX; native Windows High Contrast and screen readers. Proposed public API and existing behavior migration are separate owner tasks.

**Acceptance intentionally OPEN:** direct source facts are verified by `test_v3_icon_variant_source.py`; normalized actual Fluent-vs-Bluent visual and OS/AT are **not** tested in this checkpoint. #429 remains its own owner issue (no product patch and no issue-status promotion); #552 and PR #553 remain in progress/draft.

## Subsequent actual browser checkpoint (2026-10-20)

[Chrome + Edge live Icon render and AX observations](FLUENT-PARITY-ICON-BROWSER.md) now confirm a 377×377 SVG rendered from the existing 32×32 demo setting and an unnamed Image node in both engines, across Light/LTR, Dark/RTL and Chromium Forced Colors emulation. No product fix or Fluent parity approval is implied.
