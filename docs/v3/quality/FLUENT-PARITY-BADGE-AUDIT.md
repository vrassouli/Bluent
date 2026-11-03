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
- `feature`: `audited_gaps` — 16 API parameters are mapped in [Wave A API review](FLUENT-PARITY-WAVE-A-API-REVIEW.md); `Outlined` normalization and `Sever` versus upstream `severe` are value-level gaps, and shadow animation is a Bluent extension.
- `visual`, `behavior`, `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, `designArtifact`, and `migrationDocs`: `audited_gaps` — the normalized Fluent screenshot/state-combination matrix remains unreviewed.
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
## Fluent Badge/CounterBadge and reduced-motion crosswalk (2026-10-25)

### Reference scope

This is an evidence-only crosswalk, not a design or parity approval:

- The official [Fluent 2 Badge usage guidance](https://fluent2.microsoft.design/components/web/react/core/badge/usage/) describes Badge as a visual indicator for status/description, says badges do not receive focus by default, and requires an accessible label when the badge is icon-only; when a badge is associated with another component, that component's accessible name should communicate the badge meaning where appropriate.
- The pinned [Fluent Web Components 3.1.3 crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md) lists distinct `fluent-badge` and `fluent-counter-badge` elements. A free-text Bluent `Badge` containing `+99` is not evidence of equivalent count state, zero visibility, overflow, or announcement behavior. The element census establishes distinct concepts; complete property/value mapping is still open.
- The pinned Fluent React v9.74.10 [semantic triage](FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md) likewise treats Badge and CounterBadge as separate candidates, and calls out icon-slot versus `IconDefinition` plus status/live-region semantics and numeric overflow for separate review. This is a cross-platform comparison, not a claim of 1:1 Web Components parity.
- The official [Fluent React Badge Storybook](https://storybooks.fluentui.dev/react/?path=/docs/components-badge-badge--docs) and [Counter Badge Storybook](https://storybooks.fluentui.dev/react/?path=/docs/components-badge-counter-badge--default) are separate upstream examples. The [Fluent Web Components Badge documentation](https://learn.microsoft.com/en-us/fluent-ui/web-components/components/badge) describes the element as highlighting an item or flagging status; the pinned custom-element manifest remains the API source of truth for this audit.

### Observed Bluent behavior and disposition

| Area | Confirmed observation | Disposition |
| --- | --- | --- |
| Static text Badge | In the existing Chrome/Edge probes, the `+99` fixture is a non-focusable `div` with no component-imposed role. | Consistent with the general non-interactive Badge model; not automatically an accessibility defect. The parent/control's name and whether the count changes live need use-case-specific review. |
| Badge vs CounterBadge | Bluent currently exposes one free-text `Badge`; `+99` is only its text. | Parity remains unverified for CounterBadge-specific count/overflow/zero behavior. Map each supported, missing, intentional extension, or N/A value before redesign. Do not infer equivalent numeric behavior from typography alone. |
| Reduced-motion preference | Chrome and Edge show `matchMedia('(prefers-reduced-motion: reduce)').matches === true` while `AnimateShadow` still computes to `badge-pulse-shadow`, `1.5s`, `infinite`. | Confirmed browser-computed gap in Bluent's optional, infinite animation extension. MDN explains that `reduce` expresses a preference to remove, reduce, or replace non-essential motion; the animated shadow has no recorded essential-information requirement. This is a platform reduced-motion finding, not a claim that Fluent defines an equivalent animation property or Badge-specific animation rule. |
| Test boundary | Forced Colors and Reduced Motion are Chromium DevTools Protocol emulations. Native OS setting and assistive technology were not exercised. | Keep native OS/AT outcomes unverified. A passing probe means the observation was captured, not that the observed behavior passes the design contract. |

### Owner decisions under #445

1. Decide whether Bluent should retain one general Badge plus explicitly documented Bluent-only `AnimateShadow`, or whether count-specific behavior requires a separate public concept. Do not invent a v3 `CounterBadge` API or add a product component in #552.
2. Specify the reduced-motion fallback for `AnimateShadow`; the default candidate is to stop/disable the non-essential infinite pulse when the user requests reduced motion, while preserving any static shadow only if design approves it. Test both the `DropShadow` gate and the reduced-motion preference in browser runtime after the owning issue's Ready/design gates.
3. Reconcile the existing `IconDefinition?` source type against the `string?` in the canonical Badge docs, including a source/docs contract test. That independent documentation drift remains open.
4. Compare exact props/defaults/enum domains, numeric count visibility/overflow, icon-only accessible naming, parent naming, status/live-region use cases, and combinations across Light/Dark, RTL, forced colors and narrow widths. Link the editable Bluent v3 design before claiming visual approval.

### Evidence and status

- [Chrome InteractiveServer JSON](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-CHROME.json) and [Edge InteractiveServer JSON](evidence/BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-EDGE.json) retain the original per-browser runtime observations and now carry a machine-readable `fluentBadgeReference` describing the reference scope and the measured Reduced Motion state.
- The new metadata is reference/crosswalk annotation over the previously captured observation; it does not claim a fresh browser run. Existing reports still have 29/29 observation checks per engine.
- Family `auditStatus` remains `researching`; every matrix dimension remains `audited_gaps`; `designApproval` stays `pending`; `evidenceBundle` stays `null`; `gapDisposition` stays `known_gaps_open`. Overall `auditComplete=false` and `noneApproved=true` are unchanged.

**Boundary:** no component source, public API, product CSS, canonical component documentation, design artifact, or workflow status was changed by this audit-only step. Product remediation stays on #445 after its own design/workflow gates.
