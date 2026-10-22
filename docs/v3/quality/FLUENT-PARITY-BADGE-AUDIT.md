# #552 family audit — Badge (#445)

**Status: partial source/API audit with documentation drift and an accessibility gap identified.** This is not Fluent parity acceptance, design approval, or browser/native assistive-technology sign-off. Source and stylesheet were reviewed; no product code or canonical component documentation was changed.

## Upstream comparison decision

The pinned Fluent Web Components 3.1.3 manifest has separate `fluent-badge` and `fluent-counter-badge` elements; the pinned React comparison also distinguishes `Badge` from `CounterBadge`. Bluent exposes one `Badge` component with free text, optional IconDefinition, eight color values, four appearance values, six sizes, three shapes, drop shadow and animated shadow. A numeric string in `Text` is not automatically equivalent to the distinct upstream CounterBadge contract; no one-to-one acceptance is established.

## Source-backed findings

| Finding | Evidence | Disposition |
| --- | --- | --- |
| Public API docs have a type mismatch | `src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs` declares `[Parameter] public IconDefinition? Icon { get; set; }`. The current [canonical Badge docs](../../components/badge.md) list `Icon` as `string?` and describe string-based source heuristics. | Confirmed API documentation drift. Correct the reference/example against the compiled public API under the owning #445 workflow; do not silently change the public type or invent a string conversion. |
| Infinite shadow animation ignores reduced-motion preference | Chrome and Edge report `prefers-reduced-motion: reduce` as true while computed `badge-pulse-shadow` remains `1.5s`, `infinite`. | Runtime gap reproduced under CDP emulation; native OS/AT behavior remains untested. |
| Badge has no component-specific interaction | Root is a non-focusable `div`; component exposes no event/bindable value and renders `Icon` before a text `div`. | Source fact, not automatically a defect. Do not add `role=status` or `aria-live` globally without a use-case decision: a static badge, a live count and an empty decorative dot have different semantic requirements. Consumers can pass root attributes, including an appropriate accessible name/role where the surrounding UI requires one. |
| Public enum/API choices are Bluent-specific | `BadgeColor.Sever` is the actual public spelling; Icon is an `IconDefinition?`; `DropShadow` and `AnimateShadow` compose so animation only applies when both are true. | Preserve existing public names until an approved API/migration decision. Full per-parameter mapping of enum domains, defaults, overflow, counter semantics and tooltip behavior remains open. |

## Supplemental browser evidence (2026-10-22)

The `/components/badges` demo was captured in Chrome and Edge in Light/LTR, Dark/RTL and CDP-emulated forced-colors. The `+99` count-like badge is a static, non-focusable `div` with no component-imposed role; this is not automatically a defect. More importantly, the animated shadow computes to `badge-pulse-shadow`, `1.5s`, `infinite` in both browsers. Under CDP `prefers-reduced-motion: reduce`, the media query reports true but the animation remains active. See [Label/Link/Badge browser evidence](FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md). This is browser-computed evidence, not native OS or assistive-technology certification; the independent `Icon` API documentation mismatch remains open.
## Canonical matrix disposition

- `feature`: `audited_gaps` — the public component documentation's `Icon` parameter type conflicts with source.
- `accessibility`: `audited_gaps` — the optional infinite shadow animation remains active under browser-emulated `prefers-reduced-motion: reduce`; native OS/AT behavior remains untested.
- `visual`, `behavior`, `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, `designArtifact`, and `migrationDocs`: `not_reviewed` — representative browser snapshots now exist, but the normalized Fluent screenshot/state-combination matrix remains unreviewed.
- Family `auditStatus`: `researching`; `designApproval`: `pending`; `evidenceBundle`: `null`; `gapDisposition`: `known_gaps_open`.

## Required owner actions

1. **#445:** reconcile the documented `Icon` type with the compiled public API, update examples to use a real `IconDefinition`, and add a docs/source contract test so this drift cannot return.
2. Decide and implement an explicit `prefers-reduced-motion: reduce` behavior for `AnimateShadow`; keep the normal animation opt-in and test both the `DropShadow` gate and reduced-motion mode.
3. Compare the exact upstream `fluent-badge` and `fluent-counter-badge` APIs separately. Decide which Bluent behaviors are supported, missing, intentional extensions, or N/A with rationale; do not conflate generic text badges with count-specific overflow/announcement semantics.
4. Test text, IconDefinition variants, empty/dot markers, count-like text, icon+text names, all color/appearance/size/shape combinations, Light/Dark, RTL, forced colors, 320px/reflow, motion preference and native AT. Link the editable Bluent v3 design before visual approval.
5. Keep changes on the owning issue after its Ready/design gates; this #552 branch remains audit-only.

## Evidence sources

- [Canonical Badge documentation](../../components/badge.md)
- `src/Bluent.UI/Components/BadgeComponent/Badge.razor` and `.razor.cs`
- `src/Bluent.UI/Components/BadgeComponent/BadgeAppearance.cs`, `BadgeSize.cs`, `BadgeShape.cs`, `BadgeColor.cs`
- `src/Bluent.UI/Styles/Components/_badge.scss` and generated `components.css`
- [Pinned Fluent Web Components 3.1.3 crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md)
- [Pinned Fluent React semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md)
- [Badge owner issue #445](https://github.com/vrassouli/Bluent/issues/445)

**Boundary:** this is a partial source/API audit, not proof of visual parity, native reduced-motion behavior, screen-reader acceptance, or design approval.
