# #418 — Public token vocabulary and production alias policy proposal

**Status: PROPOSAL — maintainer decision required.** This document does not approve a public Bluent v3 API, change the token schema, publish CSS, or promote the Penpot decision boards. It makes the remaining naming and compatibility decision explicit so it can be reviewed without conflating implementation consistency with public API approval.

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

| Decision | Proposed default | Approval state |
|---|---|---|
| Public logical layers | `bluent.color.*` + accepted `bluent.semantic.*` | Pending |
| Source namespace | Internal implementation mapping | Pending |
| Component namespace | Private implementation aliases; no consumer override promise | Pending |
| CSS serialization | Stable `--bui-v3-*` aliases for approved public logical tokens only | Pending |
| Compatibility | Never repurpose a shipped alias; semantic changes get a new name and migration; removals require breaking-release treatment | Pending |
| Production publication | Only after design, consumer, compatibility and runtime review; preview excluded until then | Pending |

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
