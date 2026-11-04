# Bluent v3 Icon — implementation record (design accepted; implementation review pending)

`Icon` visual design direction was explicitly accepted by the maintainer on 2026-11-04. The typed `Icon` component and its source-definition API were already present in the `bluent-v3` base branch; PR #558 adds the source-kind viewport styling, showcase, Server fixture, catalog regression coverage and evidence handoff. The PR is ready for independent implementation review but is not merged or a released v3 API. The existing [Bluent 2.x Icon reference](../../components/icon.md) remains authoritative for released packages.

## Package and namespaces

```razor
@using Bluent.UI.Components
@using Bluent.UI.Icons
```

Source project / assembly: `Bluent.UI` (branch-local; not a released NuGet package)

## Basic usage

```razor
<Icon Value="@FluentIcons.Save" />
<Button Text="Save" Icon="@FluentIcons.Save" />
```

## Icon component API

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Value` | `IconDefinition?` | editor-required | Typed icon definition. No output is rendered when the resolved source is absent. |
| `Variant` | `IconVariant` | `Regular` | Requests the regular or filled source. |

The component inherits common Bluent `Class`, `Style`, `Id`, tooltip, and unmatched-attribute support.

## IconDefinition

`IconDefinition` is a readonly record struct containing a required regular `IconSource` and optional filled `IconSource`.

Factory methods:

```csharp
IconDefinition.FromCss(regularClass, filledClass?)
IconDefinition.FromSvg(regularSvg, filledSvg?)
IconDefinition.FromImage(regularSource, filledSource?)
```

When `IconVariant.Filled` is requested but the definition has no filled source, `GetSource` falls back to the regular source.

## Rendering by source kind

Current `Icon` rendering is source-kind dependent:

- SVG source => `<span>` containing the supplied SVG markup.
- Image source => `<img src="...">`.
- CSS-class source => `<i>` with the icon CSS class added to the component classes.

Unsupported source kinds throw `ArgumentOutOfRangeException`.

## Consumer guidance

Use the repository-provided typed icon catalog (for example `FluentIcons.Save`) where it contains the desired icon. Construct an `IconDefinition` directly only when integrating a custom CSS, SVG, or image icon source.

Do not fall back to string icon class names for Bluent parameters that now accept `IconDefinition?`; that bypasses the typed consumer surface introduced by the current API.

## Accessibility

The `Icon` component does not automatically decide whether an icon is decorative or meaningful and does not synthesize `alt`, `aria-label`, or `aria-hidden` semantics. Supply appropriate unmatched attributes/context according to usage. In particular, icon-only interactive controls need an accessible name on the control, not merely a visual icon.

Image-backed icons render an `<img>`; consumers should not assume an automatic alt value is supplied.

## Evidence boundary

Source verified from `Icon.cs` and `Bluent.UI.Icons.IconDefinition`. Do not invent icon-name strings, size/color parameters, automatic accessibility labels, or filled variants that the selected definition does not contain.

## v3 implementation scope and status

| Field | Current value |
|---|---|
| Issue / PR | [#429](https://github.com/vrassouli/Bluent/issues/429) / [#558](https://github.com/vrassouli/Bluent/pull/558) |
| Task branch | `v3/issue-429-icon` → `bluent-v3` |
| Existing typed source lineage (already in base) | `Icon.cs` `755ffaf8`; `IconDefinition.cs` `0c9f4a5e` |
| Task demo / browser-probe baseline | `7bf36a54fa699d7e840c762dcaad22372876658a` |
| Catalog regression test | `ba410d89de5460752e5078d4c8991e43955fed72` |
| Evidence metadata snapshot | `40ca74f96b64d9c84691332853ef2bcf61d8a333` |
| Documentation / Skill / parity-ledger handoff | `d961d209b6a465c96a1fd0dc082c7febb7724f90` |
| Design-approval record / current PR head | `8c587d76db6dc35a6a861d9d4e8db74fd9bc9814` |
| Implementation state | Maintainer design accepted 2026-11-04; implementation PR review pending; not merged or released |
| Demo | `/components/icons`; dedicated InteractiveServer fixture `/compatibility/icons-server` |
| Design | Penpot page 47, three editable boards; maintainer visual direction accepted 2026-11-04 and page/board status labels synchronized to DESIGN APPROVED. |

The component code changes are additive layout behavior: a low-specificity `:where(.bui-icon)` viewport gives every source root a relative `1em` inline/block size, line-height 1 and inline-block alignment. SVG children fill that viewport and image roots use `object-fit: contain`. Consumer CSS and `Style` remain authoritative. No public parameter, enum value, source factory or Color variant has been added.

## Public source/API census

**Direct `Icon` parameters:**

| Member | CLR type | Default / contract |
|---|---|---|
| `Value` | `IconDefinition?` | `[EditorRequired]`; a null value renders no root |
| `Variant` | `IconVariant` | `Regular`; `Filled` falls back to `Regular` when no Filled source is defined |

**Supporting public source types:**

- `IconDefinition` is a readonly record struct with a required `Regular` `IconSource`, optional `Filled`, `GetSource(IconVariant)`, and factories `FromCss`, `FromSvg`, `FromImage`.
- `IconSource` is a readonly record struct with `Kind` and `Value`; factories are `CssClass`, `Svg`, `Image`. Empty/whitespace source values throw `ArgumentException`.
- `IconSourceKind` contains `CssClass`, `Svg`, `Image`.
- `IconVariant` contains only `Regular`, `Filled`.
- The generated `FluentIcons` catalog is based on the bundled 20px Fluent System Icons metadata. The current repository snapshot contains 5,694 metadata keys: 2,827 Regular, 2,867 Filled, 2,875 base names, including 2,819 paired names, 8 Regular-only names and 48 Filled-only names. These are repository catalog facts, not a claim of exhaustive upstream Fluent parity.

**Inherited API and lifecycle:** `Icon` inherits common `Id`, `Class`, `Style`, `AdditionalAttributes` and Tooltip parameters (`Tooltip`, `TooltipContent`, `TooltipPlacement`, `TooltipAppearance`, `DisplayTooltipArrow`) through `BluentUiComponentBase`. The base injects `ITooltipService`, registers tooltip behavior after the first render and implements `IAsyncDisposable` cleanup. `Icon` itself declares no `EventCallback`, `ChildContent`, icon-specific `@bind` contract, public `Size`, or `Color` parameter. It does not add a JavaScript dependency.

## DOM roots, attribute precedence and trust boundary

- CSS class source renders `<i class="bui-icon ...">`.
- Trusted SVG source renders `<span class="bui-icon ...">` and inserts the supplied markup using Blazor `MarkupString`.
- Image source renders `<img class="bui-icon ..." src="...">`.
- `AdditionalAttributes`, generated/supplied `Id`, computed `Class`, and `Style` are forwarded to the selected root by `AddCommonAttributes`.
- `FromSvg` is not a sanitizer. Only developer-owned, app-owned trusted SVG may be passed. A valid SVG `viewBox` is required for predictable scaling; authored SVG dimensions/fills/strokes remain source-owned.
- Decorative/informative intent is not inferred. Use `aria-hidden="true"` for decorative CSS/SVG glyphs; use `alt=""` plus `aria-hidden="true"` for decorative images; informative roots need a meaningful `role`/`aria-label` or `alt` at the usage site. A parent interactive control owns its own contextual action name.
- Icon roots are not interactive controls and do not create their own keyboard tab stop. A parent control supplies interaction and keyboard behavior.

## Upstream mapping boundary

The pinned `@fluentui/web-components@3.1.3` catalog does not expose a generic Fluent Web Component named Icon. The upstream assets compared here are from the pinned `@fluentui/svg-icons@1.1.344` package, alongside the repository's bundled CSS font. The SVG package contains Color assets, but its package README deprecates Color assets; this does not justify a public `IconVariant.Color`. This implementation therefore compares icon assets and rendering behavior, not a fictional one-to-one Fluent Icon element.

The page-47 comparison board contains seven Regular/Filled pairs of pinned SVG/font-outline specimens. Those path specimens are fitted to geometry bounds for silhouette inspection, not native font metrics or browser pixel-parity acceptance. The browser font sweep independently found three intrinsic 0.952em glyph advances (19.04px at 20px): `hand_wave_filled`, `person_passkey_filled`, `person_passkey_regular`. These are source font metrics, not CSS normalization defects.

## Design locations and review state

Source-owned Penpot file: **Bluent v3 Design System**, file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`.

| Page 47 board | Node ID | Geometry audit |
|---|---|---:|
| Icon visual master | `63d7b719-8065-801f-8008-e345641fc17f` | 250 descendants; 0 out of bounds |
| Contextual states & catalog inventory | `63d7b719-8065-801f-8008-e38a3d009b0d` | 98 descendants; 0 out of bounds |
| Pinned Fluent asset comparison | `63d7b719-8065-801f-8008-e38bdc4a0b01` | 153 descendants; 0 out of bounds |

Two boards had direct-child coordinates corrected relative to their parent boards; nested descendants were left untouched. All three boards were exported after correction.

### Maintainer design decision — 2026-11-04

The maintainer accepted the visual design direction and the three page-47 Icon boards for the current implementation scope. This approves the component design direction, anatomy, contextual-state presentation and selected asset comparison as shown; it does **not** claim exhaustive 5,694-glyph pixel parity or native OS/assistive-technology acceptance.

Following the decision, the Penpot page title and all three board names were updated. The visual master and contextual-state boards now display `DESIGN APPROVED`; the pinned upstream asset comparison is marked `DESIGN APPROVED (SCOPED)`. Embedded status copy was also corrected to keep exhaustive pixel parity, OS contrast and native AT as separate outstanding checks. A post-edit geometry audit retained the original 250/98/153 descendant counts with **0 out-of-bounds descendants** on every board.

## Verification evidence on 2026-11-04

- Focused Icon HtmlRenderer tests: **7/7 passed (Release)**.
- Full Release solution tests: **38/38 passed**; full solution Release build: **0 warnings / 0 errors**.
- Earlier exact-head GitHub Actions on `ba410d89`: **19/19 checks passed**. Latest exact-head GitHub Actions on `8c587d76db6dc35a6a861d9d4e8db74fd9bc9814`: **18/18 checks passed across 7/7 workflows**, including Chrome/Edge × InteractiveServer/WebAssembly. Report the current SHA, not the historical check count.
- Local four-mode live matrix for the Component Lab plus the dedicated Icon page: Edge/InteractiveServer **234/234**, Edge/WebAssembly **237/237**, Chrome/InteractiveServer **234/234**, Chrome/WebAssembly **237/237**. All eight Icon-specific assertions passed in each mode, including CSS/SVG/image roots, accessibility intent, inherited sizing, variant switching, fallback, caller Style, parent Button naming and 390px reflow. Both Server cases established a fresh SignalR `_blazor` WebSocket handshake (HTTP 101).
- Published Edge/WebAssembly Icon report observes 223 Icon roots (219 CSS font, 2 SVG, 2 image); 0 failed network requests, 0 HTTP responses >=400 and 0 JavaScript exceptions. One generic console 404 message could not be mapped to a Network/Performance resource, so it is not described as a clean console.
- The broader Component Lab reports existing unrelated InteractiveServer pointer-value gaps for Slider #442 and RangeSlider #443; they are not Icon failures.
- The regression test explicitly covers the generated catalog's Regular-only `PresenceOffline` and Filled-only `BookDefault` cases.

## Known acceptance limits

- The Penpot page and three board status labels mirror the maintainer-approved design direction recorded on 2026-11-04; the three-board geometry audit remains 0 out of bounds. This is not exhaustive matched-state pixel parity.
- This is not a 5,694-glyph pixel comparison or exhaustive same-state Fluent parity review. The pinned upstream has no generic Icon Web Component; the comparison is asset/source based.
- Native OS Contrast Themes, native screen-reader speech and other OS-level assistive-technology sign-off have **not** been performed for Icon. Browser DOM/AX checks are not native AT acceptance.
- Full cross-browser evidence above is scoped to the dedicated showcase and Component Lab, not acceptance of the other 17 audit families.
- The broader #418 token/theme work and #552 18-family retrospective audit remain separate and In progress. The Icon row in #552 must remain explicitly partial until matched-state pixel parity, native OS/assistive-technology testing and remaining Fluent gap dispositions are independently reviewed; the design-direction decision itself is already recorded.
- Stable Bluent 2.x documentation, assets, NuGet packages, tags and deployments must remain unchanged. This is isolated `bluent-v3` work only.

## Reproduction

From the task worktree, run `dotnet test tests/RegexSampleGeneratorTest/RegexSampleGeneratorTest.csproj --configuration Release --no-restore` and `dotnet test Bluent.sln --configuration Release --no-restore`. Browser evidence and the exact-head GitHub workflow links are recorded in the [PR #558 conversation](https://github.com/vrassouli/Bluent/pull/558) and [machine-readable Icon evidence](../quality/evidence/BLUENT-ICON-EDGE-WASM.json).