# Bluent v3 Icon — implementation handoff (Draft)

> **Task-branch only; not accepted and not released.** This Skill records the current source-backed Icon implementation under `v3/issue-429-icon`. It is not the 2.x consumer Skill and must not be used to imply a stable v3 package/API. For released consumers, use the existing [Bluent consumer Skill](../bluent/SKILL.md) and [2.x Icon reference](../../../docs/components/icon.md).

## Ownership and provenance

- Product issue: [#429 — Icon](https://github.com/vrassouli/Bluent/issues/429)
- Draft PR: [#558](https://github.com/vrassouli/Bluent/pull/558), targeting `bluent-v3` only
- Task branch: `v3/issue-429-icon`
- Current working reference: [v3 Icon implementation record](../../../docs/v3/components/icon.md)
- Source implementation baseline: 7bf36a54fa699d7e840c762dcaad22372876658a; catalog regression test: a410d89de5460752e5078d4c8991e43955fed72; evidence snapshot: 40ca74f96b64d9c84691332853ef2bcf61d8a333; v3 docs/Skill/ledger handoff: d961d209b6a465c96a1fd0dc082c7febb7724f90.
- Source-owned Penpot file: **Bluent v3 Design System**, file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page 47. Boards: visual master `63d7b719-8065-801f-8008-e345641fc17f`, contextual states/catalog `63d7b719-8065-801f-8008-e38a3d009b0d`, pinned asset comparison `63d7b719-8065-801f-8008-e38bdc4a0b01`.
- All three boards remain `REVIEW DRAFT`; this Skill does not claim visual/design acceptance.

## Source-backed API contract

Namespace imports verified in the v3 task source:

```razor
@using Bluent.UI.Components
@using Bluent.UI.Icons
```

The `Icon` component declares only:
- `Value` (`IconDefinition?`, `[EditorRequired]`)
- `Variant` (`IconVariant`, defaults to `Regular`)

Supporting source types are `IconDefinition`, `IconSource`, `IconSourceKind`, and `IconVariant`. The source factories are `FromCss`, `FromSvg`, and `FromImage`. `IconVariant` has only `Regular` and `Filled`; when Filled is absent, `GetSource` returns Regular. There is no `Size`, `Color`, `ChildContent`, Icon event callback, or Icon-specific `@bind` API.

The component inherits common `Id`, `Class`, `Style`, `AdditionalAttributes` and Tooltip parameters/lifecycle from `BluentUiComponentBase`. That base injects `ITooltipService`, registers tooltip triggers after first render and implements `IAsyncDisposable` cleanup. Do not omit inherited members when describing the total source contract.

## Source-kind and caller rules

| Source factory | Native root | Usage note |
|---|---|---|
| `IconDefinition.FromCss(...)` | `<i class="bui-icon ...">` | Uses the bundled font class mapping. |
| `IconDefinition.FromSvg(...)` | `<span class="bui-icon ...">` | Trusted developer-owned markup only; not sanitized. Include a valid `viewBox`. |
| `IconDefinition.FromImage(...)` | `<img class="bui-icon ..." src="...">` | Supply native `alt`; empty alt plus `aria-hidden="true"` for decorative artwork. |

The v3 stylesheet gives every root a low-specificity relative `1em` viewport. The inherited font size controls default sizing; explicit consumer CSS and `Style` override it. SVG `currentColor` follows the surrounding text color where the authored SVG uses that value. Icon does not automatically mirror directional glyphs in RTL.

The consumer supplies decorative/informative intent. Use `aria-hidden="true"` for decorative font/SVG roots; use `alt="" aria-hidden="true"` for decorative images. Informative roots need a meaningful role/name or alt at the use site. A parent Button owns its contextual action name; the Icon child must not repeat it. Icon is not itself a keyboard-interactive control.

## Catalog asymmetry

The bundled 20px catalog has 5,694 JSON metadata keys (2,827 Regular, 2,867 Filled, 2,875 base names): 2,819 paired names, 8 Regular-only and 48 Filled-only. Regression coverage uses actual generated entries `FluentIcons.PresenceOffline` (Regular-only) and `FluentIcons.BookDefault` (Filled-only). These are repository snapshot counts, not a claim of exhaustive equivalence with every Fluent package release.

The pinned `@fluentui/web-components@3.1.3` Storybook has no generic Icon Web Component. Compare the bundled font and pinned `@fluentui/svg-icons@1.1.344` assets as source assets, not as an invented one-to-one Fluent Icon element. Color files in the upstream SVG package are deprecated; do not add `IconVariant.Color` without a new maintainer decision.

## Demo and validation

- Shared source-kind showcase: `/components/icons`
- Dedicated InteractiveServer wrapper: `/compatibility/icons-server`
- Release tests on task branch: Icon HtmlRenderer **7/7**, full solution **38/38**, full Release build **0 warnings / 0 errors**.
- Four local real-browser sessions: Edge/InteractiveServer **234/234**, Edge/WebAssembly **237/237**, Chrome/InteractiveServer **234/234**, Chrome/WebAssembly **237/237**; all Icon-specific route/source-kind/accessibility/sizing/variant/fallback/Style/parent-name/mobile assertions passed. Both Server runs established a fresh SignalR `_blazor` HTTP 101 handshake.
- Exact-head GitHub CI passed **19/19** on `ba410d89`. Later evidence/ledger/documentation updates trigger independent exact-head runs; do not inherit the earlier green result when reporting the latest PR head.
- Detailed limits and evidence links: [Icon v3 implementation record](../../../docs/v3/components/icon.md) and [machine-readable browser evidence](../../../docs/v3/quality/evidence/BLUENT-ICON-EDGE-WASM.json).

## Acceptance boundaries

This family is not Done. The three Penpot boards still need maintainer visual/design acceptance; native OS Contrast Themes and native screen-reader speech/AT acceptance have not been performed for Icon. Browser DOM/AX evidence is not native AT sign-off. The 18-family retrospective parity audit #552 and shared #418 token/theme work remain independent. Keep the #552 Icon row partial until upstream mapping, visual/design, native accessibility and gap disposition are reviewed. Do not promote Issue #429 to Review/Done or mark this Skill accepted solely because CI is green.

## Release isolation

All changes stay on `v3/issue-429-icon` with PR base `bluent-v3`. Never merge to stable `Dev`, alter 2.x documentation/assets, publish a NuGet package or deploy from this task branch. The 2.x consumer Skill and reference remain authoritative for released packages.