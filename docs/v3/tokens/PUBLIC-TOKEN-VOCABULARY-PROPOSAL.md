# #418 — Public token vocabulary and production alias policy proposal

**Status: Option B architecture selected by the maintainer-delegated decision (2026-11-16); final semantic allow-list and production promotion remain pending.** This document does not approve a public Bluent v3 API, change the token schema, publish CSS, or promote the Penpot decision boards. It makes the remaining naming and compatibility decision explicit so it can be reviewed without conflating implementation consistency with public API approval.

## Current preview facts

The current source-owned schema has 16 source entries, 17 semantic entries and 13 component entries. The source entries retain two intentionally distinct namespaces: nine `bluent.color.*` reusable palette/state primitives and seven `bluent.source.*` context-constrained source roles. Both currently map to existing Fluent-derived CSS custom properties. `bluent.semantic.*` expresses consumer intent; `bluent.component.*` is a component-private layer. The current `--bui-v3-*` names are preview aliases, not yet published consumer contracts.

## Vocabulary options

| Option | Public logical names | Private/internal names | Consumer impact |
|---|---|---|---|
| A — expose every layer | `color`, `source`, `semantic`, `component` | none | Maximum reach, but freezes source implementation details and component-specific aliases as supported consumer API. |
| B — expose global + semantic (recommended) | `bluent.color.*` and approved `bluent.semantic.*` | `bluent.source.*` and `bluent.component.*` | Gives consumers palette primitives and meaning-based roles while preserving source/context and per-component implementation freedom. |
| C — semantic-only | approved `bluent.semantic.*` | `color`, `source`, `component` | Smallest public surface and strongest semantic abstraction, but limits deliberate brand/palette customization and diagnostics through named global primitives. |

### Recommended boundary: Option B

1. `bluent.color.*` is the public global palette vocabulary for reusable neutral/brand primitives and explicitly state-named link palette roles. Do not use these names as a replacement for intent-level semantics when a semantic role exists.
2. `bluent.semantic.*` is public only after that individual role has a documented meaning, approved consumer scope, supported brand/mode values, and passing design/runtime evidence. A candidate or unsafe role is not public merely because it appears in the preview schema.
3. `bluent.source.*` remains internal. It preserves the direct Fluent source mapping and context constraints; exposing it would let applications couple themselves to implementation-oriented roles such as `dangerForeground`, `focusStroke2`, `onBrand` or `strokeAccessible`.
4. `bluent.component.*` remains private to the component implementation. Its aliases may be generated internally, but are not a supported application override surface and can be changed when component structure evolves.

This boundary fits the current source → semantic → component layering and the documented Danger rule: an approved semantic role is not a blanket approval for each downstream component alias.

## Production CSS alias policy proposal

- Logical token identity is the canonical source of truth. CSS custom-property names are a stable serialization of approved public tokens, not an independent second API.
- Public aliases use the `--bui-v3-*` prefix and are emitted only for approved `bluent.color.*` / `bluent.semantic.*` entries. Component-private aliases may use the same prefix internally but must be documented as private and excluded from consumer override examples.
- Keep all v3 aliases under the explicit v3 opt-in scope. Do not mutate, rename, shadow globally, or remove existing Fluent-compatible `--color*` source variables or 2.x assets.
- Brand and mode values resolve through the established ten-brand × Light/Dark matrix. Do not encode brand or mode names into each public token name; the active theme scope supplies those values.
- Once a public alias ships, never repurpose its meaning. Additive aliases are the normal compatible evolution path. A semantic change requires a new token name and a documented migration; removal/renaming belongs to a separately approved breaking release with a published deprecation path.
- Preview aliases remain under `docs/v3/tokens/` and are not included in production package assets until the corresponding names, values, consumers and design decisions are accepted.

## Required maintainer decisions

| Decision | Selected direction / remaining question | State |
|---|---|---|
| Public logical layers | Option B: bluent.color.* plus individually accepted bluent.semantic.* | **Selected 2026-11-16**; exact semantic allow-list remains open |
| Source namespace | bluent.source.* stays internal as the context-constrained source mapping layer | **Selected — Option B** |
| Component namespace | bluent.component.* stays private; no consumer override promise | **Selected — Option B** |
| CSS serialization | --bui-v3-* serializes only individually approved public logical tokens inside the explicit v3 opt-in scope | **Direction selected**; no production aliases approved |
| Compatibility | Never repurpose a shipped alias; semantic changes need a new name and migration; removals require breaking-release treatment | **Direction selected**; no package approval implied |
| First-wave semantic candidates | text.primary, text.disabled and text.placeholder recommended for maintainer review based on consumer-specific evidence | **Review proposal only** |
| Production publication | Only after design, consumer, compatibility and runtime review; preview remains excluded | **Pending** |

## Deliberately not decided by this proposal

This proposal does not approve exact Dark brand foreground values, the final public role list, generic Danger semantics, the provisional focus host attributes/property, a public Portal/Dialog/Popover API, native Contrast Themes or spoken assistive-technology behavior. Those remain separate acceptance gates in #418. The source-owned Penpot boards remain DRAFT / REVIEW REQUIRED as recorded in `issue-418-token-schema.preview.json`.

## Editable design-tool decision board

The three-way decision is now represented in the source-owned Penpot file, in addition to this written proposal:

- File: Bluent v3 Design System (b64f6665-c9ab-80b5-8008-c4ac99d9d000)
- Page: 52 · Public token vocabulary & CSS aliases · DRAFT (388782f1-b766-8073-8008-f3299e62827a)
- Board: #418 · Public token vocabulary & production alias policy · DRAFT (388782f1-b766-8073-8008-f3299e849141)
- Last inspected Penpot file revision: 812

The board compares A (all layers public), B (global palette + individually accepted semantic), and C (semantic-only); it visualizes the proposed CSS serialization and preserves the separate Dark, Danger, Focus host and D2/D5 gates. It is marked DRAFT / MAINTAINER DECISION REQUIRED and ends with PROPOSAL ONLY / NO PUBLIC TOKEN PROMOTION / NO PRODUCTION CSS OR PACKAGE CHANGE.

The PNG export was visually inspected after correcting the board's page-coordinate offset. This confirms design artifact existence and legibility only; it is not design approval and does not change this document's Pending approval state.

## 2026-11-16 decision — Option B selected

The maintainer delegated this choice to the engineering/design review. **Option B is selected**: public global palette names `bluent.color.*` and individually accepted `bluent.semantic.*`; `bluent.source.*` remains internal and `bluent.component.*` remains private. `--bui-v3-*` serializes approved logical tokens only under the explicit v3 opt-in scope. Existing `--color*` variables and 2.x assets are preserved, and shipped aliases must never be repurposed.

This selects the vocabulary architecture, not the final semantic allow-list or production publication. The current design board remains in its recorded DRAFT state; preview CSS and aliases are not shipping assets.

## 2026-11-20 semantic role inventory — review only

This inventory makes the Option B per-role boundary explicit against the 17 semantic aliases in the current preview schema. It records existing consumer decisions; it does not convert a component-specific decision into a global/public token approval.

**Recommended first-wave candidates for maintainer review:** bluent.semantic.text.primary, bluent.semantic.text.disabled and bluent.semantic.text.placeholder. These remain preview aliases until the global allow-list and production gates are accepted. The evidence scope shown below is the maximum currently established scope, not blanket approval for other components.

| Semantic role | Source alias | Existing consumer evidence | Proposed disposition |
|---|---|---|---|
| bluent.semantic.surface.default | bluent.color.background1 | Present as a private TextField background mapping in the preview; no separate consumer-level approval for this semantic alias was found. | Defer; obtain representative surface consumers and brand/mode review. |
| bluent.semantic.text.primary | bluent.color.foreground1 | Maintainer explicitly approved this semantic mapping for Label #430. That establishes the Label consumer scope, not a blanket approval for every component or production publication. | FIRST-WAVE CANDIDATE; retain the Label evidence boundary until broader consumer parity is accepted. |
| bluent.semantic.text.placeholder | bluent.color.foreground4 | TextField #432 selected Fluent colorNeutralForeground4 for normal placeholder. The source-role choice is accepted for TextField; this semantic alias remains unconsumed until #418 integration. | FIRST-WAVE CANDIDATE; TextField scope only until integration and wider acceptance. |
| bluent.semantic.action.background | bluent.color.brandBackground | Button, Checkbox and Switch have private preview component mappings; no public semantic consumer contract was accepted by those mappings alone. | Defer; complete action/background state and component-surface review. |
| bluent.semantic.action.foreground | bluent.color.brandForeground1 | The Dark Action Rest role is represented in the 40-value page-55 candidate matrix, but exact values and public aliases remain unapproved. | Defer until page 55 and exact per-brand values are accepted. |
| bluent.semantic.action.onBrand | bluent.source.onBrand | Context-constrained on-brand foreground; Button's preview component mapping does not make the source role a public consumer contract. | Keep source role internal; defer semantic promotion. |
| bluent.semantic.border.default | bluent.color.stroke1 | Reusable source primitive exists; no independently accepted consumer mapping for this semantic alias was found. | Defer pending representative border/surface states. |
| bluent.semantic.border.strong | bluent.source.strokeAccessible | Maps to an accessible-stroke source role; TextField's private preview mapping does not approve a universal border role. | Keep context evidence attached; defer. |
| bluent.semantic.status.danger | bluent.source.dangerForeground | Dark neutral pair measured 4.164:1; policy restricts it to non-text status indicators/icons/accents on the studied neutral surface, not ordinary or small text. | RESTRICTED; do not expose as a generic text foreground. Dedicated status-consumer review remains open. |
| bluent.semantic.text.disabled | bluent.source.foregroundDisabled | Maintainer explicitly approved this mapping for Label #430 with a visual-only disabled scope. | FIRST-WAVE CANDIDATE; document disabled-state scope and do not imply normal-text WCAG conformance. |
| bluent.semantic.surface.disabled | bluent.source.backgroundDisabled | Source candidate exists; no specific accepted consumer scope was found in the reviewed component decisions. | Defer pending disabled-surface and contrast review. |
| bluent.semantic.border.focus | bluent.color.brandBackground | Focus Option A requires explicit same-painted-host metadata; its consumer attribute/API contract is not approved for production. | Defer; not a universal border token. |
| bluent.semantic.text.dangerAccessible | bluent.source.paletteRedForeground1 | Maintainer approval is Label required marker only. Badge, Alert, Toast, Button Danger and generic/body text remain unapproved. The broad text.* name would invite consumers beyond that narrow marker scope. | KEEP OUT OF THE FIRST-WAVE PUBLIC LIST; preserve Label-only preview mapping and do not generalize it. |
| bluent.semantic.focusRing.strongCandidate | bluent.source.focusStroke2 | Explicitly a candidate; Focus host metadata and public Focus API are not approved for production. | Keep internal/deferred until host contract and native acceptance are complete. |
| bluent.semantic.link.foregroundRest | bluent.color.brandForegroundLink | Link #431 was accepted using existing published Fluent-compatible CSS variables; that does not approve this new semantic alias. Page-55 exact Dark values also remain draft. | Defer until the exact Link Rest mapping and public alias are accepted. |
| bluent.semantic.link.foregroundHover | bluent.color.brandForegroundLinkHover | Existing Link #431 component acceptance uses the current published CSS variables; the hover-specific page-55 candidate value remains unapproved. | Defer until Link Hover values and consumer states are accepted. |
| bluent.semantic.link.foregroundPressed | bluent.color.brandForegroundLinkPressed | Existing Link #431 component acceptance uses the current published CSS variables; the pressed-specific page-55 candidate value remains unapproved. | Defer until Link Pressed values and consumer states are accepted. |

### Decision boundary

- The Label #430 approvals are real component-consumer approvals for three Label mappings. They do not, by themselves, approve the complete global semantic-token API.
- TextField #432 accepted the placeholder source-role choice; it explicitly deferred consumption of the new semantic alias until #418 integration.
- Link #431 is accepted, but it uses existing CSS variables. It did not approve the new semantic Link aliases.
- Page 55's 40/40 opaque-pair preview pass is evidence for the four named Dark roles on the studied neutral surface only. It is not exact-value approval, component-state approval, or native OS/AT certification.
- This review inventory recommends a small candidate set; it does not update reviewPolicy.selectedDecisions.publicTokenVocabulary.productionApproval, ship aliases, or change CSS/API. The final allow-list and production promotion remain open.

## 2026-11-21 DateField consumer dependency — review only

The source-backed [DateField foundation dependency audit](DATEFIELD-FOUNDATION-DEPENDENCY-AUDIT.md) is added as a downstream-consumer review for #418. It identifies shared field text/disabled/placeholder, readable validation text, focus boundaries, calendar/Popover surfaces and ownership, reduced motion, forced colors, RTL and locale foundations. It proposes only a **provisional, unapproved** separate validation-text semantic concept; text.dangerAccessible remains Label required-marker-only and status.danger remains non-text-only. The current 17-role preview schema and production/public token allow-list are unchanged. DateClass, typed Min/Max, YearSelect parsing, calendar trigger naming and picker keyboard work remain exclusively in DateField #438.

### 2026-11-21 follow-up — existing validation-message source and contrast

The DateField downstream audit found that the shared field stylesheet already maps .validation-message to --colorPaletteRedForeground1. The new reproducible source audit covers all 20 theme files and three neutral backgrounds per theme (60/60 pairs, minimum 5.2036:1). This does not widen the Label-only text.dangerAccessible semantic or promote a new role; semantic.text.validation remains a naming/consumer-contract candidate only. Brand/inverted/custom hosts and native forced-colors remain outside this numeric matrix. See DATEFIELD-FOUNDATION-DEPENDENCY-AUDIT.md and scripts/quality/audit_v3_validation_text_contrast.py.
